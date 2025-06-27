
import React, { useState, useMemo } from 'react';
import { Repair, RepairStatus, Device, DeviceStatus, RepairCategory } from '../types';

interface RepairsProps {
    repairs: Repair[];
    devices: Device[];
    repairCategories: string[];
    addRepair: (repair: Omit<Repair, 'id'>) => void;
    updateRepair: (repair: Repair) => void;
}

const RepairStatusBadge: React.FC<{ status: RepairStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        [RepairStatus.Pending]: "bg-gray-500/20 text-gray-400",
        [RepairStatus.InProgress]: "bg-yellow-500/20 text-yellow-400",
        [RepairStatus.Completed]: "bg-green-500/20 text-green-400",
        [RepairStatus.Cancelled]: "bg-red-500/20 text-red-400",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const RepairFormModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (repair: Repair | Omit<Repair, 'id'>) => void; 
    devices: Device[];
    repairs: Repair[];
    repairCategories: string[];
    repair: Repair | null;
}> = ({ isOpen, onClose, onSave, devices, repairs, repairCategories, repair }) => {
    const getInitialFormData = () => ({
        deviceId: '',
        issueDescription: '',
        category: repairCategories[0] || '',
        reportedDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        status: RepairStatus.Pending,
        cost: 0,
    });
    
    const [formData, setFormData] = useState<Omit<Repair, 'id' | 'deviceName'>>(getInitialFormData());
    const [deviceSearchTerm, setDeviceSearchTerm] = useState('');

    const filteredDevices = useMemo(() => {
        const availableDevices = devices.filter(device => {
            if (repair && device.id === repair.deviceId) return true;
            if (device.status === DeviceStatus.Retired) return false;
            const hasOtherActiveRepair = repairs.some(r => 
                r.deviceId === device.id && 
                (r.status === RepairStatus.InProgress || r.status === RepairStatus.Pending) &&
                r.id !== repair?.id
            );
            if (hasOtherActiveRepair) return false;
            return true;
        });

        if (!deviceSearchTerm) return availableDevices;
        return availableDevices.filter(d => 
            d.name.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
            d.serialNumber.toLowerCase().includes(deviceSearchTerm.toLowerCase())
        );
    }, [devices, repairs, repair, deviceSearchTerm]);
    
    React.useEffect(() => {
        if(repair) {
            setFormData({
                deviceId: repair.deviceId,
                issueDescription: repair.issueDescription,
                category: repair.category,
                reportedDate: repair.reportedDate,
                completedDate: repair.completedDate,
                status: repair.status,
                cost: repair.cost,
            });
        } else {
             setFormData(getInitialFormData());
        }
        setDeviceSearchTerm('');
    }, [repair, isOpen, repairCategories]);

    if (!isOpen) return null;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedDevice = devices.find(d => d.id === formData.deviceId);
        if (!selectedDevice) {
            alert("Please select a valid device.");
            return;
        }
        if (!formData.category) {
            alert("Please select a repair category.");
            return;
        }
        const repairData = { ...formData, deviceName: selectedDevice.name };
        onSave(repair ? { ...repairData, id: repair.id } : repairData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">{repair ? 'Edit Repair Log' : 'Log New Repair'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="device-search" className="block text-sm font-medium text-gray-400 mb-1">Search Device</label>
                         <input
                            id="device-search"
                            type="text"
                            placeholder="Filter by name or serial number..."
                            value={deviceSearchTerm}
                            onChange={e => setDeviceSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="device-select" className="block text-sm font-medium text-gray-400 mb-1">Device</label>
                        <select id="device-select" name="deviceId" value={formData.deviceId} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select a device</option>
                            {filteredDevices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.serialNumber})</option>)}
                        </select>
                        {filteredDevices.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No eligible devices match your search.</p>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Issue Description</label>
                        <textarea name="issueDescription" value={formData.issueDescription} onChange={handleChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Repair Category (OpEx)</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select a category</option>
                           {repairCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                               {Object.values(RepairStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Repair Cost (OpEx)</label>
                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors">Save Log</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Repairs: React.FC<RepairsProps> = ({ repairs, devices, repairCategories, addRepair, updateRepair }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

    const handleSaveRepair = (repairData: Repair | Omit<Repair, 'id'>) => {
        if ('id' in repairData) {
            updateRepair(repairData as Repair);
        } else {
            addRepair(repairData as Omit<Repair, 'id'>);
        }
    };
    
    const openAddModal = () => {
        setEditingRepair(null);
        setIsModalOpen(true);
    };

    const openEditModal = (repair: Repair) => {
        setEditingRepair(repair);
        setIsModalOpen(true);
    };
    
    return (
        <div>
             <RepairFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRepair}
                devices={devices}
                repairs={repairs}
                repairCategories={repairCategories}
                repair={editingRepair}
            />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Repair & Maintenance Log</h2>
                <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Log Repair
                </button>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Device</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Issue & Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reported Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cost</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {repairs.map(repair => (
                            <tr key={repair.id} className="hover:bg-gray-700/40 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{repair.deviceName}</td>
                                <td className="px-6 py-4 whitespace-nowrap max-w-sm">
                                    <div className="text-sm text-gray-300 truncate">{repair.issueDescription}</div>
                                    <div className="text-xs text-gray-500">{repair.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(repair.reportedDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><RepairStatusBadge status={repair.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">${repair.cost.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(repair)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {repairs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No repair logs found.</p>
                </div>
            )}
        </div>
    );
};

export default Repairs;
