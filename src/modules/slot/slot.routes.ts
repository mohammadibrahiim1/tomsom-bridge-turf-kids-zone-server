import { Router } from 'express';
import { SlotController } from './slot.controller';

const router = Router();

// POST /api/v1/slots/create
router.post('/create', SlotController.createSlot); 

// GET /api/v1/slots
router.get('/', SlotController.getAllSlots);

export const SlotRoutes = router;
