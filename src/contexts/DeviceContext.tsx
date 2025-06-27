import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { deviceApi } from '../services/api';

interface Device {
  _id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  assignedTo?: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  getDevice: (id: string) => Promise<Device | null>;
  createDevice: (deviceData: Omit<Device, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDevice: (id: string, updateData: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all devices
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deviceApi.getAll();
      setDevices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices');
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get a single device by ID
  const getDevice = async (id: string): Promise<Device | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await deviceApi.getById(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch device');
      console.error('Error fetching device:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new device
  const createDevice = async (deviceData: Omit<Device, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      await deviceApi.create(deviceData);
      await fetchDevices(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create device');
      console.error('Error creating device:', err);
      throw err; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  // Update an existing device
  const updateDevice = async (id: string, updateData: Partial<Device>) => {
    try {
      setLoading(true);
      setError(null);
      await deviceApi.update(id, updateData);
      await fetchDevices(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to update device');
      console.error('Error updating device:', err);
      throw err; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  // Delete a device
  const deleteDevice = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deviceApi.delete(id);
      setDevices(prevDevices => prevDevices.filter(device => device._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete device');
      console.error('Error deleting device:', err);
      throw err; // Re-throw to handle in the component
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, []);

  const value = {
    devices,
    loading,
    error,
    fetchDevices,
    getDevice,
    createDevice,
    updateDevice,
    deleteDevice,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};
