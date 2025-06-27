import React from 'react';
import { useDevices } from '../contexts/DeviceContext';

const DeviceList: React.FC = () => {
  const { devices, loading, error, deleteDevice } = useDevices();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice(id);
      } catch (err) {
        console.error('Failed to delete device:', err);
      }
    }
  };

  if (loading && devices.length === 0) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  }

  if (devices.length === 0) {
    return <div className="text-center py-8">No devices found. Add your first device to get started!</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Type</th>
            <th className="py-2 px-4 text-left">Serial Number</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Location</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device._id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{device.name}</td>
              <td className="py-2 px-4">{device.type}</td>
              <td className="py-2 px-4">{device.serialNumber}</td>
              <td className="py-2 px-4">
                <span 
                  className={`px-2 py-1 text-xs rounded-full ${
                    device.status === 'available' ? 'bg-green-100 text-green-800' :
                    device.status === 'in-use' ? 'bg-blue-100 text-blue-800' :
                    device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {device.status}
                </span>
              </td>
              <td className="py-2 px-4">{device.location}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDelete(device._id)}
                  className="text-red-600 hover:text-red-800 mr-4"
                  title="Delete"
                >
                  Delete
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                  // Add edit functionality here
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceList;
