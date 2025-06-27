
export enum DeviceStatus {
  InUse = 'In Use',
  InRepair = 'In Repair',
  InStorage = 'In Storage',
  Retired = 'Retired',
}

// DeviceType is no longer an enum to allow for dynamic categories.
export type DeviceType = string;
export type RepairCategory = string;
export type Location = string;

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  serialNumber: string;
  assignedTo: string;
  location: Location;
  purchaseDate: string;
  warrantyEndDate: string;
  status: DeviceStatus;
  cost: number;
}

export enum RepairStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Repair {
  id: string;
  deviceId: string;
  deviceName: string;
  issueDescription: string;
  category: RepairCategory;
  reportedDate: string;
  completedDate: string | null;
  status: RepairStatus;
  cost: number;
}