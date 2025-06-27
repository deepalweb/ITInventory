import { Router, Request, Response, NextFunction } from 'express';
import { 
  getDevices, 
  getDeviceById, 
  createDevice, 
  updateDevice, 
  deleteDevice 
} from '../controllers/deviceController';

const router = Router();

// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Device routes
router.route('/')
  .get(asyncHandler(async (req, res) => getDevices(req, res)))
  .post(asyncHandler(async (req, res) => createDevice(req, res)));

router.route('/:id')
  .get(asyncHandler(async (req, res) => getDeviceById(req, res)))
  .put(asyncHandler(async (req, res) => updateDevice(req, res)))
  .delete(asyncHandler(async (req, res) => deleteDevice(req, res)));

export default router;
