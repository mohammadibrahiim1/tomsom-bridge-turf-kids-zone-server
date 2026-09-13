import { Document, Types } from 'mongoose';

export enum GroundType {
  PITCH_1_SMALL = 'PITCH_1_SMALL',
  PITCH_2_MEDIUM = 'PITCH_2_MEDIUM',
  PITCH_3_LARGE = 'PITCH_3_LARGE',
  INDOR_TURF = 'INDOR_TURF',
  ROOFTOP_TURF = 'ROOFTOP_TURF',
  VIP_TURF = 'VIP_TURF',
}

export enum SportType {
  CRICKET = 'CRICKET',
  FOOTBALL = 'FOOTBALL',
  BADMINTON = 'BADMINTON',
  BASKETBALL = 'BASKETBALL',
  TENNIS = 'TENNIS',
  KIDS_ZONE = 'KIDS_ZONE',
}

export enum SlotTimeType {
  EARLY_MORNING = 'EARLY_MORNING',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  LATE_NIGHT = 'LATE_NIGHT',
  WEEKEND_SPECIAL = 'WEEKEND_SPECIAL',
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface ISlot extends Document {
  _id: Types.ObjectId;
  slotId: string;
  groundType?: GroundType;
  groundTypeBn?: string;
  sportType?: SportType;
  sportTypeBn?: string;
  packageNumber?: number;
  packageName?: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  bookingDate?: Date | null;
  playDurationMinutes?: number;
  bufferDurationMinutes?: number;
  slotTimeType?: SlotTimeType;
  slotTypeBn?: string;
  regularPrice: number;
  extraGroundCharge?: number;
  totalPrice?: number;
  peakPrice?: number;
  weekendPrice?: number;
  isNightMatch?: boolean;
  hasRainEffect?: boolean;
  hasSoundSystem?: boolean;
  includedAmenities?: string[];
  customAttributes?: Record<string, unknown>;
  status?: SlotStatus;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSlot {
  slotId: string;
  groundType?: GroundType;
  groundTypeBn?: string;
  sportType?: SportType;
  sportTypeBn?: string;
  packageNumber?: number;
  packageName?: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  bookingDate?: Date | string;
  playDurationMinutes?: number;
  bufferDurationMinutes?: number;
  slotTimeType?: SlotTimeType;
  slotTypeBn?: string;
  regularPrice: number;
  extraGroundCharge?: number;
  totalPrice?: number;
  peakPrice?: number;
  weekendPrice?: number;
  isNightMatch?: boolean;
  hasRainEffect?: boolean;
  hasSoundSystem?: boolean;
  includedAmenities?: string[];
  customAttributes?: Record<string, unknown>;
  status?: SlotStatus;
  isActive?: boolean;
}

export interface ISlotFilterOptions {
  searchTerm?: string;
  bookingDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  groundType?: GroundType;
  sportType?: SportType;
  slotTimeType?: SlotTimeType;
  packageNumber?: number;
  status?: SlotStatus;
  isNightMatch?: boolean;
  hasRainEffect?: boolean;
  hasSoundSystem?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}