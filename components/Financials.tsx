
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Device, Repair } from '../types';

interface FinancialsProps {
  devices: Device[];
  repairs: Repair[];
  capexBudget: Record<string, number>;
  opexBudget: Record<string, number>;
  updateBudgets: (newCapex: Record<string, number>, newOpex: Record<string, number>) => void;
}

const BudgetProgress: React.FC<{ current: number; budget: number; }> = ({ current, budget }) => {
    const percentage = budget > 0 ? (current / budget) * 100 : 0;
    const isOverBudget = current > budget;
    const amountOver = current - budget;

    const progressBarColor =
        isOverBudget ? 'bg-red-500' :
        percentage >= 90 ? 'bg-red-500' :
        percentage >= 75 ? 'bg-yellow-400' :
        'bg-green-500';

    return (
        <div>
            <div className="flex justify-between items-baseline text-sm text-gray-300 mb-1">
                <span className="font-bold text-xl">${current.toLocaleString()}</span>
                <span className="text-gray-400">of ${budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`${progressBarColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
             {isOverBudget && (
                <p className="text-xs text-red-400 mt-1 font-medium">
                    Over budget by ${amountOver.toLocaleString()}
                </p>
            )}
        </div>
    );
};


const Financials: React.FC<FinancialsProps> = ({ devices, repairs, capexBudget, opexBudget, updateBudgets }) => {
  const totalCapex = useMemo(() => devices.reduce((acc, dev) => acc + dev.cost, 0), [devices]);
  const totalOpex = useMemo(() => repairs.reduce((acc, rep) => acc + rep.cost, 0), [repairs]);
  
  const totalCapexBudget = useMemo(() => Object.values(capexBudget).reduce((sum, val) => sum + val, 0), [capexBudget]);
  const totalOpexBudget = useMemo(() => Object.values(opexBudget).reduce((sum, val) => sum + val, 0), [opexBudget]);

  const [editableCapexBudget, setEditableCapexBudget] = useState(capexBudget);
  const [editableOpexBudget, setEditableOpexBudget] = useState(opexBudget);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  React.useEffect(() => {
    setEditableCapexBudget(capexBudget);
    setEditableOpexBudget(opexBudget);
  }, [capexBudget, opexBudget]);
  
  const capexSpentPerCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    devices.forEach(device => {
        spending[device.type] = (spending[device.type] || 0) + device.cost;
    });
    return spending;
  }, [devices]);
  
  const opexSpentPerCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    repairs.forEach(repair => {
        if (repair.category) {
            spending[repair.category] = (spending[repair.category] || 0) + repair.cost;
        }
    });
    return spending;
  }, [repairs]);


  const handleBudgetSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgets(editableCapexBudget, editableOpexBudget);
    setSaveStatus('✅ Budgets updated successfully!');
    setTimeout(() => {
        setSaveStatus(null);
    }, 3000);
  };
  
  const handleBudgetChange = (
      setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
      category: string, 
      value: string
    ) => {
      setter(prev => ({...prev, [category]: Math.max(0, parseFloat(value) || 0)}));
  }

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { name: string, capex: number, opex: number } } = {};
    const processItems = (items: (Device | Repair)[], type: 'capex' | 'opex') => {
      items.forEach(item => {
        const date = new Date(type === 'capex' ? (item as Device).purchaseDate : (item as Repair).reportedDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!data[monthKey]) {
          data[monthKey] = { name: date.toLocaleString('default', { month: 'short', year: '2-digit' }), capex: 0, opex: 0 };
        }
        data[monthKey][type] += item.cost;
      });
    };
    processItems(devices, 'capex');
    processItems(repairs, 'opex');
    
    return Object.values(data).sort((a,b) => new Date(a.name) > new Date(b.name) ? 1 : -1);
  }, [devices, repairs]);
  
  const AllocationTable: React.FC<{
      title: string;
      budget: Record<string, number>;
      spending: Record<string, number>;
      onChange: (category: string, value: string) => void;
    }> = ({title, budget, spending, onChange}) => (
        <div className="overflow-x-auto">
            <h4 className="text-md font-semibold text-gray-300 mb-2 mt-4">{title}</h4>
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Allocated Budget</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spent</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Remaining</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilization</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {Object.keys(budget).sort().map(category => {
                        const allocated = budget[category] || 0;
                        const spent = spending[category] || 0;
                        const remaining = allocated - spent;
                        const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
                        const progressBarColor = remaining < 0 ? 'bg-red-500' : percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-yellow-400' : 'bg-green-500';

                        return (
                            <tr key={category}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{category}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 sm:text-sm">$</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={allocated}
                                            onChange={(e) => onChange(category, e.target.value)}
                                            className="w-40 bg-gray-700 border border-gray-600 rounded-md py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 font-mono">${spent.toLocaleString()}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-mono ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>${remaining.toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div className={`${progressBarColor} h-2.5 rounded-full`} style={{width: `${Math.min(percentage, 100)}%`}}></div>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Financials & Budget Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-center">
          <h3 className="text-gray-400 font-medium">Total Spending</h3>
          <p className="text-4xl font-bold text-white mt-2">${(totalCapex + totalOpex).toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-3">
          <h3 className="text-gray-400 font-medium">Capital Expenditure (CapEx)</h3>
          <BudgetProgress current={totalCapex} budget={totalCapexBudget} />
          <p className="text-sm text-gray-500">Total cost of new assets vs total budget</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-3">
          <h3 className="text-gray-400 font-medium">Operational Expenditure (OpEx)</h3>
          <BudgetProgress current={totalOpex} budget={totalOpexBudget} />
           <p className="text-sm text-gray-500">Total cost of repairs vs total budget</p>
        </div>
      </div>
      
      {/* Budget Allocation Tool */}
      <form onSubmit={handleBudgetSave} className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-lg font-semibold text-white">Budget Allocation & Utilization</h3>
                <p className="text-sm text-gray-500">Allocate your budget by category and track spending.</p>
            </div>
             <div className="flex items-center gap-4">
                 {saveStatus && <span className="text-sm text-green-400 transition-opacity duration-300">{saveStatus}</span>}
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors h-fit flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293zM5 4a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 11-2 0V5H7v1a1 1 0 11-2 0V4z" /></svg>
                    Save All Budgets
                </button>
            </div>
        </div>

        <AllocationTable 
            title="CapEx Allocation by Category"
            budget={editableCapexBudget}
            spending={capexSpentPerCategory}
            onChange={(cat, val) => handleBudgetChange(setEditableCapexBudget, cat, val)}
        />
        
         <AllocationTable 
            title="OpEx Allocation by Category"
            budget={editableOpexBudget}
            spending={opexSpentPerCategory}
            onChange={(cat, val) => handleBudgetChange(setEditableOpexBudget, cat, val)}
        />
      </form>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending (CapEx vs OpEx)</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#e5e7eb' }}
                cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }}/>
              <Bar dataKey="capex" fill="#4ade80" name="CapEx" />
              <Bar dataKey="opex" fill="#facc15" name="OpEx" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Financials;
