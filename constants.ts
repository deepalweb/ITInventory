
import { Device, Repair, DeviceStatus, RepairStatus } from './types';

// The hardcoded enum is replaced with a list of strings for initial data.
export const MOCK_DEVICE_CATEGORIES: string[] = [
  'Barcode Scanner',
  'DESKTOP',
  'Finger Print Device',
  'LAPTOP',
  'Mobile',
  'Monitor',
  'Phone',
  'PickMe Mobile',
  'POS Machine',
  'POS Printer',
  'Printer',
  'Router',
  'Server',
  'Server PC',
  'TAB',
  'Other',
];

export const MOCK_REPAIR_CATEGORIES: string[] = [
    'Screen Repair',
    'Battery Replacement',
    'Hardware Failure',
    'Software Issue',
    'Accidental Damage',
    'Other',
];

export const MOCK_LOCATIONS: string[] = [
    'Headquarters - Floor 1',
    'Headquarters - Floor 2',
    'Data Center A',
    'New York Office',
    'London Office',
    'Remote (Home Office)',
];

export const MOCK_DEVICES: Device[] = [
  { id: 'd001', name: 'MacBook Pro 16"', type: 'LAPTOP', serialNumber: 'C02Z1234ABCD', assignedTo: 'Alice Johnson', location: 'New York Office', purchaseDate: '2023-01-15', warrantyEndDate: '2026-01-14', status: DeviceStatus.InUse, cost: 2499 },
  { id: 'd002', name: 'Dell XPS 15', type: 'LAPTOP', serialNumber: 'DXPS5678EFGH', assignedTo: 'Bob Williams', location: 'London Office', purchaseDate: '2022-11-20', warrantyEndDate: '2025-11-19', status: DeviceStatus.InUse, cost: 1899 },
  { id: 'd003', name: 'HP EliteDesk 800', type: 'DESKTOP', serialNumber: 'HPED9101IJKL', assignedTo: 'Charlie Brown', location: 'Headquarters - Floor 1', purchaseDate: '2023-03-10', warrantyEndDate: '2026-03-09', status: DeviceStatus.InUse, cost: 1250 },
  { id: 'd004', name: 'Dell UltraSharp U2721DE', type: 'Monitor', serialNumber: 'DU27M456QRST', assignedTo: 'Alice Johnson', location: 'Headquarters - Floor 1', purchaseDate: '2023-01-15', warrantyEndDate: '2026-01-14', status: DeviceStatus.InUse, cost: 550 },
  { id: 'd005', name: 'iPhone 15 Pro', type: 'Phone', serialNumber: 'IP15P789UVWX', assignedTo: 'Dana White', location: 'New York Office', purchaseDate: '2023-09-22', warrantyEndDate: '2025-09-21', status: DeviceStatus.InRepair, cost: 999 },
  { id: 'd006', name: 'Lenovo ThinkPad X1', type: 'LAPTOP', serialNumber: 'LTX1Y234ZABC', assignedTo: 'Eve Adams', location: 'Data Center A', purchaseDate: '2021-08-01', warrantyEndDate: '2024-07-31', status: DeviceStatus.InStorage, cost: 1600 },
  { id: 'd007', name: 'iMac 24"', type: 'DESKTOP', serialNumber: 'IMAC24567DEFG', assignedTo: 'Frank Harris', location: 'Headquarters - Floor 2', purchaseDate: '2020-05-18', warrantyEndDate: '2023-05-17', status: DeviceStatus.Retired, cost: 1299 },
  { id: 'd008', name: 'HPE ProLiant DL380', type: 'Server', serialNumber: 'HPSERVHIJKLMNO', assignedTo: 'IT Department', location: 'Data Center A', purchaseDate: '2022-06-30', warrantyEndDate: '2027-06-29', status: DeviceStatus.InUse, cost: 7500 },
];

export const MOCK_REPAIRS: Repair[] = [
  { id: 'r001', deviceId: 'd005', deviceName: 'iPhone 15 Pro', issueDescription: 'Cracked screen after drop', category: 'Screen Repair', reportedDate: '2024-07-10', completedDate: null, status: RepairStatus.InProgress, cost: 299 },
  { id: 'r002', deviceId: 'd002', deviceName: 'Dell XPS 15', issueDescription: 'Battery not holding charge', category: 'Battery Replacement', reportedDate: '2024-05-02', completedDate: '2024-05-09', status: RepairStatus.Completed, cost: 150 },
  { id: 'r003', deviceId: 'd007', deviceName: 'iMac 24"', issueDescription: 'Logic board failure, unrepairable.', category: 'Hardware Failure', reportedDate: '2024-03-15', completedDate: '2024-03-20', status: RepairStatus.Completed, cost: 0 },
];