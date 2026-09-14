import {
  GroundType,
  SlotStatus,
  SlotTimeType,
  SportType,
} from "@prisma/client";

// ==========================================
// CREATE SLOT
// ==========================================

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

  bookingDate?: Date | string | null;

  playDurationMinutes?: number;
  bufferDurationMinutes?: number;

  hasExtraTime?: boolean;
  extraTimeMinutes?: number;
  extraTimeCharge?: number;

  slotTimeType?: SlotTimeType;
  slotTimeTypeBn?: string;

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

// ==========================================
// UPDATE SLOT
// ==========================================

export interface IUpdateSlot {
  slotId?: string;

  groundType?: GroundType;
  groundTypeBn?: string;

  sportType?: SportType;
  sportTypeBn?: string;

  packageNumber?: number;
  packageName?: string;

  startTime?: string;
  endTime?: string;
  displayTime?: string;

  bookingDate?: Date | string | null;

  playDurationMinutes?: number;
  bufferDurationMinutes?: number;

  hasExtraTime?: boolean;
  extraTimeMinutes?: number;
  extraTimeCharge?: number;

  slotTimeType?: SlotTimeType;
  slotTimeTypeBn?: string;

  regularPrice?: number;
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

// ==========================================
// FILTER OPTIONS
// ==========================================

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

// ==========================================
// PAGINATION
// ==========================================

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}