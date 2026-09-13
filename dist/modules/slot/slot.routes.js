"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRoutes = void 0;
const express_1 = require("express");
const slot_controller_1 = require("./slot.controller");
const router = (0, express_1.Router)();
// POST /api/v1/slots/create
router.post('/create', slot_controller_1.SlotController.createSlot);
// GET /api/v1/slots
router.get('/', slot_controller_1.SlotController.getAllSlots);
// DELETE /api/v1/slots/delete-slots
router.delete('/delete-slots', slot_controller_1.SlotController.deleteSlots);
exports.SlotRoutes = router;
