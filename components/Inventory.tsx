
import React, { useState, useMemo } from 'react';
import { Device, DeviceStatus, DeviceType, Location } from '../types';

interface InventoryProps {
    devices: Device[];
    deviceCategories: string[];
    locations: string[];
    addDevice: (device: Omit<Device, 'id'>) => void;
    updateDevice: (device: Device) => void;
}

const StatusBadge: React.FC<{ status: DeviceStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        [DeviceStatus.InUse]: "bg-green-500/20 text-green-400",
        [DeviceStatus.InRepair]: "bg-yellow-500/20 text-yellow-400",
        [DeviceStatus.InStorage]: "bg-blue-500/20 text-blue-400",
        [DeviceStatus.Retired]: "bg-red-500/20 text-red-400",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const DeviceFormModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (device: Device | Omit<Device, 'id'>) => void; 
    device: Device | null;
    deviceCategories: string[];
    locations: string[];
}> = ({ isOpen, onClose, onSave, device, deviceCategories, locations }) => {
    const getInitialFormData = () => ({
        name: '',
        type: deviceCategories[0] || 'Other',
        serialNumber: '',
        assignedTo: '',
        location: locations[0] || '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: DeviceStatus.InStorage,
        cost: 0,
    });
    
    const [formData, setFormData] = useState<Omit<Device, 'id'>>(getInitialFormData());
    
    React.useEffect(() => {
        if (isOpen) {
            if (device) {
                setFormData({...device});
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [device, isOpen, deviceCategories, locations]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'cost' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(device ? { ...formData, id: device.id } : formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl border border-gray-700">
                <h2 className="text-2xl font-bold mb-6">{device ? 'Edit Device' : 'Add New Device'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Device Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Device Category</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {deviceCategories.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Serial Number</label>
                        <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Assigned To</label>
                        <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                        <select name="location" value={formData.location} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select a location</option>
                           {locations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                           {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date</label>
                        <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Warranty End Date</label>
                        <input type="date" name="warrantyEndDate" value={formData.warrantyEndDate} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Cost (CapEx)</label>
                        <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors">Save Device</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Inventory: React.FC<InventoryProps> = ({ devices, deviceCategories, locations, addDevice, updateDevice }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<DeviceType | 'all'>('all');
    const [locationFilter, setLocationFilter] = useState<Location | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

    const filteredDevices = useMemo(() => {
        return devices
            .filter(d => statusFilter === 'all' || d.status === statusFilter)
            .filter(d => typeFilter === 'all' || d.type === typeFilter)
            .filter(d => locationFilter === 'all' || d.location === locationFilter)
            .filter(d => 
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (d.location && d.location.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [devices, searchTerm, statusFilter, typeFilter, locationFilter]);
    
    const handleSaveDevice = (deviceData: Device | Omit<Device, 'id'>) => {
        if ('id' in deviceData) {
            updateDevice(deviceData as Device);
        } else {
            addDevice(deviceData as Omit<Device, 'id'>);
        }
    };
    
    const openAddModal = () => {
        setEditingDevice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (device: Device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    return (
        <div>
            <DeviceFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDevice}
                device={editingDevice}
                deviceCategories={deviceCategories}
                locations={locations}
            />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Device Inventory ({devices.length})</h2>
                <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Device
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name, serial, user, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px]"
                />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as DeviceStatus | 'all')}
                    className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(DeviceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                 <select 
                    value={typeFilter} 
                    onChange={e => setTypeFilter(e.target.value as DeviceType | 'all')}
                    className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Types</option>
                    {deviceCategories.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value as Location | 'all')}
                    className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Locations</option>
                    {locations.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned To</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Serial Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Warranty End</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredDevices.map(device => (
                            <tr key={device.id} className="hover:bg-gray-700/40 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{device.name}</div>
                                    <div className="text-sm text-gray-400">{device.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{device.assignedTo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{device.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{device.serialNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={device.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(device.warrantyEndDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(device)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredDevices.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No devices found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Inventory;