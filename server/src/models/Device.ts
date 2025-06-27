// Device SQL Model/Queries
import { sql, getConnection } from '../config/sqlDb';

export interface IDevice {
  id?: number;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  assignedTo?: string;
  location: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper: map SQL row to IDevice
export const mapDeviceRow = (row: any): IDevice => ({
  id: row.id,
  name: row.name,
  type: row.type,
  serialNumber: row.serialNumber,
  status: row.status,
  assignedTo: row.assignedTo,
  location: row.location,
  purchaseDate: row.purchaseDate,
  warrantyExpiry: row.warrantyExpiry,
  notes: row.notes,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
