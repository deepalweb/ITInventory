
import React, { useMemo } from 'react';
import { Device, Repair } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportingProps {
    devices: Device[];
    repairs: Repair[];
}

const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No data available to export.");
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row => 
            headers.map(fieldName => {
                let fieldValue = row[fieldName];
                if (fieldValue === null || fieldValue === undefined) {
                    return '';
                }
                let formattedValue = fieldValue.toString();
                // If the value contains a comma, newline, or double quote, wrap it in double quotes
                if (formattedValue.includes(',') || formattedValue.includes('\n') || formattedValue.includes('"')) {
                    formattedValue = `"${formattedValue.replace(/"/g, '""')}"`;
                }
                return formattedValue;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);


const Reporting: React.FC<ReportingProps> = ({ devices, repairs }) => {
    
    const handleExportDevices = () => {
        exportToCsv(devices, 'devices_export.csv');
    };

    const handleExportRepairs = () => {
        exportToCsv(repairs, 'repairs_export.csv');
    };

    const capexByType = useMemo(() => {
        const costs: Record<string, number> = {};
        devices.forEach(device => {
            costs[device.type] = (costs[device.type] || 0) + device.cost;
        });
        return Object.entries(costs).map(([name, cost]) => ({ name, cost }));
    }, [devices]);

    const opexByCategory = useMemo(() => {
        const costs: Record<string, number> = {};
        repairs.forEach(repair => {
            if (repair.category) {
                 costs[repair.category] = (costs[repair.category] || 0) + repair.cost;
            }
        });
        return Object.entries(costs).map(([name, cost]) => ({ name, cost }));
    }, [repairs]);
    
    const devicesByLocation = useMemo(() => {
        const counts: Record<string, number> = {};
        devices.forEach(device => {
            if (device.location) {
                counts[device.location] = (counts[device.location] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [devices]);

    const deviceAgeData = useMemo(() => {
        const now = new Date();
        const ageGroups = {
            '< 1 Year': 0,
            '1-3 Years': 0,
            '3-5 Years': 0,
            '> 5 Years': 0,
        };

        devices.forEach(device => {
            const purchaseDate = new Date(device.purchaseDate);
            const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            if (ageInYears < 1) ageGroups['< 1 Year']++;
            else if (ageInYears <= 3) ageGroups['1-3 Years']++;
            else if (ageInYears <= 5) ageGroups['3-5 Years']++;
            else ageGroups['> 5 Years']++;
        });

        return Object.entries(ageGroups).map(([name, count]) => ({ name, count }));
    }, [devices]);
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Reporting & Analytics</h2>

            {/* Export Section */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
                <div className="flex flex-wrap gap-4">
                     <button onClick={handleExportDevices} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Devices (CSV)
                    </button>
                    <button onClick={handleExportRepairs} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Repairs (CSV)
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ChartCard title="Capital Expenditure by Device Type">
                    <ResponsiveContainer>
                        <BarChart data={capexByType} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `$${(value as number / 1000)}k`} />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} tick={{fontSize: 12}} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#e5e7eb' }}
                                cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                            <Bar dataKey="cost" fill="#4ade80" name="CapEx" />
                        </BarChart>
                    </ResponsiveContainer>
                 </ChartCard>
                 
                 <ChartCard title="Repair Costs (OpEx) by Repair Category">
                    <ResponsiveContainer>
                        <BarChart data={opexByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `$${value}`} />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} tick={{fontSize: 12}} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#e5e7eb' }}
                                cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                            <Bar dataKey="cost" fill="#facc15" name="OpEx" />
                        </BarChart>
                    </ResponsiveContainer>
                 </ChartCard>

                 <ChartCard title="Devices by Location">
                    <ResponsiveContainer>
                        <BarChart data={devicesByLocation} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} interval={0} angle={-45} textAnchor="end" />
                            <YAxis stroke="#9ca3af" allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#e5e7eb' }}
                                cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                            />
                            <Bar dataKey="count" fill="#818cf8" name="Number of Devices" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <div className="lg:col-span-3">
                    <ChartCard title="Device Age Distribution">
                         <ResponsiveContainer>
                            <BarChart data={deviceAgeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#e5e7eb' }}
                                    cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" name="Number of Devices" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default Reporting;