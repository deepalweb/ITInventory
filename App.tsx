
import React, { useState } from 'react';
import { Device, Repair, DeviceStatus, RepairStatus, DeviceType, Location } from './types';
import { MOCK_DEVICES, MOCK_REPAIRS, MOCK_DEVICE_CATEGORIES, MOCK_REPAIR_CATEGORIES, MOCK_LOCATIONS } from './constants';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Repairs from './components/Repairs';
import Financials from './components/Financials';
import AiAssistant from './components/AiAssistant';
import Reporting from './components/Reporting';
import Settings from './components/Settings';

type View = 'dashboard' | 'inventory' | 'repairs' | 'financials' | 'ai_assistant' | 'reporting' | 'settings';

const initialCapexBudget: Record<string, number> = {};
MOCK_DEVICE_CATEGORIES.forEach(type => {
    initialCapexBudget[type] = 1000; // Default
});
Object.assign(initialCapexBudget, {
  'LAPTOP': 15000, 'DESKTOP': 10000, 'Server': 10000, 'Phone': 5000,
  'Monitor': 4000, 'Printer': 1500, 'Router': 1500,
});

const initialOpexBudget: Record<string, number> = {};
MOCK_REPAIR_CATEGORIES.forEach(type => {
    initialOpexBudget[type] = 500; // Default
});
Object.assign(initialOpexBudget, {
    'Screen Repair': 2000, 'Battery Replacement': 1500, 'Hardware Failure': 3000,
    'Software Issue': 1000, 'Accidental Damage': 2500,
});


const App: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [repairs, setRepairs] = useState<Repair[]>(MOCK_REPAIRS);
  const [deviceCategories, setDeviceCategories] = useState<string[]>(MOCK_DEVICE_CATEGORIES);
  const [repairCategories, setRepairCategories] = useState<string[]>(MOCK_REPAIR_CATEGORIES);
  const [locations, setLocations] = useState<string[]>(MOCK_LOCATIONS);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [capexBudget, setCapexBudget] = useState<Record<string, number>>(initialCapexBudget);
  const [opexBudget, setOpexBudget] = useState<Record<string, number>>(initialOpexBudget);

  const addDevice = (device: Omit<Device, 'id'>) => {
    const newDevice = { ...device, id: `d${Date.now()}` };
    setDevices(prev => [...prev, newDevice]);
  };

  const updateDevice = (updatedDevice: Device) => {
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
  };
  
  const addRepair = (repair: Omit<Repair, 'id'>) => {
    const newRepair = { ...repair, id: `r${Date.now()}` };
    setRepairs(prev => [...prev, newRepair]);
    if (newRepair.status === RepairStatus.Pending || newRepair.status === RepairStatus.InProgress) {
        setDevices(prevDevices => prevDevices.map(d => 
            d.id === newRepair.deviceId ? { ...d, status: DeviceStatus.InRepair } : d
        ));
    }
  };
  
  const updateRepair = (updatedRepair: Repair) => {
    const otherActiveRepairs = repairs.some(r =>
        r.deviceId === updatedRepair.deviceId &&
        r.id !== updatedRepair.id &&
        (r.status === RepairStatus.Pending || r.status === RepairStatus.InProgress)
    );
    setRepairs(prev => prev.map(r => (r.id === updatedRepair.id ? updatedRepair : r)));
    if (updatedRepair.status === RepairStatus.Completed || updatedRepair.status === RepairStatus.Cancelled) {
        if (!otherActiveRepairs) {
            setDevices(prevDevices => prevDevices.map(d =>
                d.id === updatedRepair.deviceId ? { ...d, status: DeviceStatus.InStorage } : d
            ));
        }
    } else if (updatedRepair.status === RepairStatus.Pending || updatedRepair.status === RepairStatus.InProgress) {
        setDevices(prevDevices => prevDevices.map(d =>
            d.id === updatedRepair.deviceId ? { ...d, status: DeviceStatus.InRepair } : d
        ));
    }
  };

  const updateBudgets = (newCapex: Record<string, number>, newOpex: Record<string, number>) => {
    setCapexBudget(newCapex);
    setOpexBudget(newOpex);
  };
  
  // Device Category (CapEx) Management
  const addDeviceCategory = (newType: string) => {
    setDeviceCategories(prev => [...prev, newType].sort((a,b) => a.localeCompare(b)));
    setCapexBudget(prev => ({...prev, [newType]: 1000})); // Default CapEx budget
  };

  const updateDeviceCategory = (oldName: string, newName: string) => {
    setDeviceCategories(prev => prev.map(t => t === oldName ? newName : t).sort((a,b) => a.localeCompare(b)));
    setDevices(prev => prev.map(d => d.type === oldName ? { ...d, type: newName } : d));
    setCapexBudget(prev => {
        const newBudget = {...prev};
        if(newBudget[oldName] !== undefined) {
          newBudget[newName] = newBudget[oldName];
          delete newBudget[oldName];
        }
        return newBudget;
    });
  };
  
  const deleteDeviceCategory = (typeName: string) => {
    setDeviceCategories(prev => prev.filter(t => t !== typeName));
    setCapexBudget(prev => {
        const newBudget = {...prev};
        delete newBudget[typeName];
        return newBudget;
    });
  };

  // Repair Category (OpEx) Management
  const addRepairCategory = (newType: string) => {
    setRepairCategories(prev => [...prev, newType].sort((a,b) => a.localeCompare(b)));
    setOpexBudget(prev => ({...prev, [newType]: 250})); // Default OpEx budget
  };

  const updateRepairCategory = (oldName: string, newName: string) => {
    setRepairCategories(prev => prev.map(t => t === oldName ? newName : t).sort((a,b) => a.localeCompare(b)));
    setRepairs(prev => prev.map(r => r.category === oldName ? { ...r, category: newName } : r));
    setOpexBudget(prev => {
        const newBudget = {...prev};
        if(newBudget[oldName] !== undefined) {
          newBudget[newName] = newBudget[oldName];
          delete newBudget[oldName];
        }
        return newBudget;
    });
  };

  const deleteRepairCategory = (typeName: string) => {
    setRepairCategories(prev => prev.filter(t => t !== typeName));
    setOpexBudget(prev => {
        const newBudget = {...prev};
        delete newBudget[typeName];
        return newBudget;
    });
  };

  // Location Management
  const addLocation = (newLocation: string) => {
    setLocations(prev => [...prev, newLocation].sort((a,b) => a.localeCompare(b)));
  };

  const updateLocation = (oldName: string, newName: string) => {
    setLocations(prev => prev.map(l => l === oldName ? newName : l).sort((a,b) => a.localeCompare(b)));
    setDevices(prev => prev.map(d => d.location === oldName ? { ...d, location: newName } : d));
  };
  
  const deleteLocation = (locationName: string) => {
    setLocations(prev => prev.filter(l => l !== locationName));
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <li>
      <button
        onClick={() => setActiveView(view)}
        className={`flex items-center p-2 rounded-lg w-full text-left transition-colors ${
          activeView === view
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard devices={devices} repairs={repairs} />;
      case 'inventory':
        return <Inventory devices={devices} deviceCategories={deviceCategories} locations={locations} addDevice={addDevice} updateDevice={updateDevice} />;
      case 'repairs':
        return <Repairs repairs={repairs} devices={devices} repairCategories={repairCategories} addRepair={addRepair} updateRepair={updateRepair}/>;
      case 'financials':
        return <Financials devices={devices} repairs={repairs} capexBudget={capexBudget} opexBudget={opexBudget} updateBudgets={updateBudgets} />;
      case 'ai_assistant':
        return <AiAssistant devices={devices} repairs={repairs} />;
      case 'reporting':
        return <Reporting devices={devices} repairs={repairs} />;
      case 'settings':
          return <Settings 
              deviceCategories={deviceCategories} 
              devices={devices} 
              addDeviceCategory={addDeviceCategory}
              updateDeviceCategory={updateDeviceCategory}
              deleteDeviceCategory={deleteDeviceCategory}
              repairCategories={repairCategories}
              repairs={repairs}
              addRepairCategory={addRepairCategory}
              updateRepairCategory={updateRepairCategory}
              deleteRepairCategory={deleteRepairCategory}
              locations={locations}
              addLocation={addLocation}
              updateLocation={updateLocation}
              deleteLocation={deleteLocation}
          />;
      default:
        return <Dashboard devices={devices} repairs={repairs} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
        <div>
            <div className="flex items-center mb-8">
            <svg className="h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            <h1 className="text-xl font-bold ml-2">IT Inventory HQ</h1>
            </div>
            <nav>
            <ul className="space-y-2">
                <NavItem view="dashboard" label="Dashboard" icon={<IconDashboard />} />
                <NavItem view="inventory" label="Inventory" icon={<IconInventory />} />
                <NavItem view="repairs" label="Repairs" icon={<IconRepairs />} />
                <NavItem view="financials" label="Financials" icon={<IconFinancials />} />
                <NavItem view="reporting" label="Reporting" icon={<IconReporting />} />
                <NavItem view="ai_assistant" label="AI Assistant" icon={<IconAIAssistant />} />
            </ul>
            </nav>
        </div>
        <div className="mt-auto">
            <nav>
                 <ul className="space-y-2 pt-4 border-t border-gray-700">
                     <NavItem view="settings" label="Settings" icon={<IconSettings />} />
                 </ul>
            </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {renderView()}
      </main>
    </div>
  );
};

// Icons
const IconDashboard = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v11h6V10H3zm10-4v15h6V6h-6zM3 5v2h6V5H3zm10 0v2h6V5h-6z" /></svg>;
const IconInventory = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const IconRepairs = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>;
const IconFinancials = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const IconReporting = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6l-2 2M9 11V7l2 2m0-2v6l2-2m-2 2V7l2 2m4 10v-6l-2 2m2-2V7l2 2m0-2v6l2-2M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const IconAIAssistant = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const IconSettings = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default App;