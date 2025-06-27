import { Request, Response } from 'express';
import { getConnection, sql } from '../config/sqlDb';
import { IDevice, mapDeviceRow } from '../models/Device';

// @desc    Get all devices
// @route   GET /api/devices
// @access  Public
export const getDevices = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Devices ORDER BY createdAt DESC');
    const devices = result.recordset.map(mapDeviceRow);
    return res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching devices',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Create a new device
// @route   POST /api/devices
// @access  Private/Admin
export const createDevice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const deviceData: IDevice = req.body;
    
    // Validate required fields
    if (!deviceData.name || !deviceData.type || !deviceData.serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, type, serialNumber'
      });
    }

    const pool = await getConnection();
    // Check for duplicate serial number
    const existing = await pool.request().input('serialNumber', sql.VarChar, deviceData.serialNumber).query('SELECT * FROM Devices WHERE serialNumber = @serialNumber');
    if (existing.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A device with this serial number already exists'
      });
    }

    const insert = await pool.request()
      .input('name', sql.VarChar, deviceData.name)
      .input('type', sql.VarChar, deviceData.type)
      .input('serialNumber', sql.VarChar, deviceData.serialNumber)
      .input('status', sql.VarChar, deviceData.status || 'available')
      .input('assignedTo', sql.VarChar, deviceData.assignedTo || null)
      .input('location', sql.VarChar, deviceData.location)
      .input('purchaseDate', sql.DateTime, deviceData.purchaseDate)
      .input('warrantyExpiry', sql.DateTime, deviceData.warrantyExpiry || null)
      .input('notes', sql.VarChar, deviceData.notes || null)
      .query(`INSERT INTO Devices (name, type, serialNumber, status, assignedTo, location, purchaseDate, warrantyExpiry, notes, createdAt, updatedAt)
              VALUES (@name, @type, @serialNumber, @status, @assignedTo, @location, @purchaseDate, @warrantyExpiry, @notes, GETDATE(), GETDATE());
              SELECT * FROM Devices WHERE serialNumber = @serialNumber`);
    const newDevice = mapDeviceRow(insert.recordset[0]);
    return res.status(201).json({
      success: true,
      data: newDevice
    });
  } catch (error) {
    console.error('Error creating device:', error);
    return res.status(400).json({
      success: false,
      message: 'Error creating device',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Get a single device by ID
// @route   GET /api/devices/:id
// @access  Public
export const getDeviceById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Devices WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    const device = mapDeviceRow(result.recordset[0]);
    return res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching device',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Update a device
// @route   PUT /api/devices/:id
// @access  Private/Admin
export const updateDevice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData: IDevice = req.body;
    const pool = await getConnection();
    // Prevent updating the serial number to one that already exists
    if (updateData.serialNumber) {
      const existing = await pool.request().input('serialNumber', sql.VarChar, updateData.serialNumber).input('id', sql.Int, id).query('SELECT * FROM Devices WHERE serialNumber = @serialNumber AND id <> @id');
      if (existing.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A device with this serial number already exists'
        });
      }
    }
    const update = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, updateData.name)
      .input('type', sql.VarChar, updateData.type)
      .input('serialNumber', sql.VarChar, updateData.serialNumber)
      .input('status', sql.VarChar, updateData.status)
      .input('assignedTo', sql.VarChar, updateData.assignedTo || null)
      .input('location', sql.VarChar, updateData.location)
      .input('purchaseDate', sql.DateTime, updateData.purchaseDate)
      .input('warrantyExpiry', sql.DateTime, updateData.warrantyExpiry || null)
      .input('notes', sql.VarChar, updateData.notes || null)
      .query(`UPDATE Devices SET name=@name, type=@type, serialNumber=@serialNumber, status=@status, assignedTo=@assignedTo, location=@location, purchaseDate=@purchaseDate, warrantyExpiry=@warrantyExpiry, notes=@notes, updatedAt=GETDATE() WHERE id=@id;
              SELECT * FROM Devices WHERE id=@id`);
    if (update.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    const updatedDevice = mapDeviceRow(update.recordset[0]);
    return res.status(200).json({
      success: true,
      data: updatedDevice
    });
  } catch (error) {
    console.error('Error updating device:', error);
    return res.status(400).json({
      success: false,
      message: 'Error updating device',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// @desc    Delete a device
// @route   DELETE /api/devices/:id
// @access  Private/Admin
export const deleteDevice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const del = await pool.request().input('id', sql.Int, id).query('DELETE FROM Devices WHERE id = @id');
    if (del.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Device removed successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting device',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
