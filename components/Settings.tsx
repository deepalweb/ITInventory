
import React, { useState } from 'react';
import { Device, Repair } from '../types';

interface SettingsProps {
    deviceCategories: string[];
    devices: Device[];
    addDeviceCategory: (newType: string) => void;
    updateDeviceCategory: (oldName: string, newName: string) => void;
    deleteDeviceCategory: (typeName: string) => void;

    repairCategories: string[];
    repairs: Repair[];
    addRepairCategory: (newType: string) => void;
    updateRepairCategory: (oldName: string, newName: string) => void;
    deleteRepairCategory: (typeName: string) => void;

    locations: string[];
    addLocation: (newType: string) => void;
    updateLocation: (oldName: string, newName: string) => void;
    deleteLocation: (typeName: string) => void;
}

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const CategoryManager: React.FC<{
    title: string;
    subtitle: string;
    categories: string[];
    itemsInUse: string[];
    addCategory: (name: string) => void;
    updateCategory: (oldName: string, newName: string) => void;
    deleteCategory: (name: string) => void;
}> = ({ title, subtitle, categories, itemsInUse, addCategory, updateCategory, deleteCategory }) => {
    const [newItemName, setNewItemName] = useState('');
    const [editingItem, setEditingItem] = useState<{ oldName: string, newName: string } | null>(null);
    const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() && !categories.some(c => c.toLowerCase() === newItemName.toLowerCase())) {
            addCategory(newItemName.trim());
            setNewItemName('');
        } else {
            alert('Category name cannot be empty or already exist.');
        }
    };

    const handleEditSave = () => {
        if (!editingItem) return;
        const { oldName, newName } = editingItem;
        if (newName.trim() && oldName.toLowerCase() !== newName.trim().toLowerCase() && !categories.some(c => c.toLowerCase() === newName.toLowerCase())) {
            updateCategory(oldName, newName.trim());
            setEditingItem(null);
        } else if (oldName.toLowerCase() === newName.trim().toLowerCase()) {
            setEditingItem(null); // No change, just cancel
        } else {
            alert('New category name cannot be empty or already exist.');
        }
    };

    const handleDeleteRequest = (itemName: string) => {
        if (itemsInUse.includes(itemName)) {
            alert("Cannot delete this category because it is still in use.");
            return;
        }
        setDeleteCandidate(itemName);
    };

    const handleDeleteConfirm = () => {
        if (deleteCandidate) {
            deleteCategory(deleteCandidate);
            setDeleteCandidate(null);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <ConfirmationModal
                isOpen={!!deleteCandidate}
                onClose={() => setDeleteCandidate(null)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the category "${deleteCandidate}"? This action cannot be undone.`}
            />
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
            
            <form onSubmit={handleAddItem} className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Add new category name"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    Add Category
                </button>
            </form>

            <div className="space-y-3">
                {categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        {editingItem?.oldName === cat ? (
                            <input
                                type="text"
                                value={editingItem.newName}
                                onChange={(e) => setEditingItem({ ...editingItem, newName: e.target.value })}
                                className="bg-gray-600 border border-gray-500 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                            />
                        ) : (
                            <span className="text-gray-200">{cat}</span>
                        )}
                        <div className="flex gap-3">
                            {editingItem?.oldName === cat ? (
                                <>
                                    <button onClick={handleEditSave} className="text-green-400 hover:text-green-300 text-sm font-semibold">Save</button>
                                    <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-300 text-sm font-semibold">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditingItem({ oldName: cat, newName: cat })} className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Edit</button>
                                    <button onClick={() => handleDeleteRequest(cat)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = (props) => {
    const { 
        deviceCategories, devices, addDeviceCategory, updateDeviceCategory, deleteDeviceCategory,
        repairCategories, repairs, addRepairCategory, updateRepairCategory, deleteRepairCategory,
        locations, addLocation, updateLocation, deleteLocation,
    } = props;
    
    const usedDeviceCategories = React.useMemo(() => [...new Set(devices.map(d => d.type))], [devices]);
    const usedRepairCategories = React.useMemo(() => [...new Set(repairs.map(r => r.category))], [repairs]);
    const usedLocations = React.useMemo(() => [...new Set(devices.map(d => d.location))], [devices]);
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Settings</h2>
            <div className="space-y-8">
                <CategoryManager
                    title="Manage Device Categories (CapEx)"
                    subtitle="These are the types of assets you purchase. Budgets are set per category in Financials."
                    categories={deviceCategories}
                    itemsInUse={usedDeviceCategories}
                    addCategory={addDeviceCategory}
                    updateCategory={updateDeviceCategory}
                    deleteCategory={deleteDeviceCategory}
                />
                 <CategoryManager
                    title="Manage Repair Categories (OpEx)"
                    subtitle="These are the types of repairs you perform. Budgets are set per category in Financials."
                    categories={repairCategories}
                    itemsInUse={usedRepairCategories}
                    addCategory={addRepairCategory}
                    updateCategory={updateRepairCategory}
                    deleteCategory={deleteRepairCategory}
                />
                <CategoryManager
                    title="Manage Locations"
                    subtitle="Physical or logical locations where devices are tracked."
                    categories={locations}
                    itemsInUse={usedLocations}
                    addCategory={addLocation}
                    updateCategory={updateLocation}
                    deleteCategory={deleteLocation}
                />
            </div>
        </div>
    );
};

export default Settings;