"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const mongoose_1 = require("mongoose");
const slot_interface_1 = require("./slot.interface");
const slotSchema = new mongoose_1.Schema({
    slotId: { type: String, required: true, unique: true, index: true },
    groundType: { type: String, enum: Object.values(slot_interface_1.GroundType) },
    groundTypeBn: { type: String },
    sportType: { type: String, enum: Object.values(slot_interface_1.SportType) },
    sportTypeBn: { type: String },
    packageNumber: { type: Number },
    packageName: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    displayTime: { type: String, required: true },
    bookingDate: { type: Date, default: null },
    playDurationMinutes: { type: Number },
    bufferDurationMinutes: { type: Number },
    slotTimeType: { type: String, enum: Object.values(slot_interface_1.SlotTimeType) },
    slotTypeBn: { type: String },
    regularPrice: { type: Number, required: true },
    extraGroundCharge: { type: Number, default: 200 },
    totalPrice: { type: Number, required: true },
    peakPrice: { type: Number },
    weekendPrice: { type: Number },
    isNightMatch: { type: Boolean, default: false },
    hasRainEffect: { type: Boolean, default: false },
    hasSoundSystem: { type: Boolean, default: false },
    includedAmenities: { type: [String], default: [] },
    customAttributes: { type: mongoose_1.Schema.Types.Mixed },
    status: { type: String, enum: Object.values(slot_interface_1.SlotStatus), default: slot_interface_1.SlotStatus.AVAILABLE },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Slot = (0, mongoose_1.model)('Slot', slotSchema);
