import { Schema, model } from 'mongoose';
import { ISlot, GroundType, SportType, SlotTimeType, SlotStatus } from './slot.interface';

const slotSchema = new Schema<ISlot>(
  {
    slotId: { type: String, required: true, unique: true, index: true },
    groundType: { type: String, enum: Object.values(GroundType) },
    groundTypeBn: { type: String },
    sportType: { type: String, enum: Object.values(SportType) },
    sportTypeBn: { type: String },
    packageNumber: { type: Number },
    packageName: { type: String },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    displayTime: { type: String, required: true },
    bookingDate: { type: Date, default: null },
    playDurationMinutes: { type: Number },
    bufferDurationMinutes: { type: Number },
    slotTimeType: { type: String, enum: Object.values(SlotTimeType) },
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
    customAttributes: { type: Schema.Types.Mixed },
    status: { type: String, enum: Object.values(SlotStatus), default: SlotStatus.AVAILABLE },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



slotSchema.index({ groundType: 1, sportType: 1, status: 1, bookingDate: 1 });
slotSchema.index({ slotId: 'text', packageName: 'text' });

export const Slot = model<ISlot>('Slot', slotSchema);