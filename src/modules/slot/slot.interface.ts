import { GroundType, SlotStatus, SlotTimeType, SportType } from '@prisma/client';

export interface ICreateSlot {
  slotId: string;
  groundType?: GroundType;
  groundTypeBn?: string;
  sportType?: SportType;
  sportTypeBn?: string;
  packageNumber?: number;
  packageName?: string;
  startTime: string; // Format: "18:00"
  endTime: string; // Format: "19:00"
  displayTime: string; // Format: "06:00 PM - 07:00 PM"
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
  customAttributes?: Record<string, any>;
  status?: SlotStatus;
  isActive?: boolean;
}

export interface ISlotFilterOptions {
  searchTerm?: string;
  bookingDate?: string; // Single date: "2026-09-10"
  startDate?: string; // Date range start
  endDate?: string; // Date range end
  startTime?: string; // "18:00"
  endTime?: string; // "19:00"
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
