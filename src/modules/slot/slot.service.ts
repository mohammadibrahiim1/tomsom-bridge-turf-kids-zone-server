import { Prisma, PrismaClient, Slot } from '@prisma/client';
import { ICreateSlot, IPaginationOptions, ISlotFilterOptions } from './slot.interface';

const prisma = new PrismaClient();

export const SlotService = {
  createSlot: async (payload: ICreateSlot): Promise<Slot> => {
    // 1. Check if slotId already exists
    const existingSlot = await prisma.slot.findUnique({
      where: { slotId: payload.slotId },
    });

    if (existingSlot) {
      throw new Error(`Slot with ID '${payload.slotId}' already exists.`);
    }

    // 2. Auto-calculate totalPrice if not explicitly provided
    const extraCharge = payload.extraGroundCharge ?? 200;
    const calculatedTotalPrice =
      payload.totalPrice ??
      (payload.groundType === 'PITCH_2_LARGE' ? payload.regularPrice + extraCharge : payload.regularPrice);

    // 3. Save to database
    const newSlot = await prisma.slot.create({
      data: {
        ...payload,
        extraGroundCharge: extraCharge,
        totalPrice: calculatedTotalPrice,
        bookingDate: payload.bookingDate ? new Date(payload.bookingDate) : null,
      },
    });

    return newSlot;
  },

  getAllSlots: async (filters: ISlotFilterOptions, pagination: IPaginationOptions) => {
    const {
      searchTerm,
      bookingDate,
      startDate,
      endDate,
      startTime,
      endTime,
      groundType,
      sportType,
      slotType,
      packageNumber,
      status,
      isNightMatch,
      hasRainEffect,
      hasSoundSystem,
      minPrice,
      maxPrice,
    } = filters;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build Prisma AND Conditions
    const andConditions: Prisma.SlotWhereInput[] = [];

    // Global Search (Search across Bangla/English Names and SlotId)
    if (searchTerm) {
      andConditions.push({
        OR: [
          { slotId: { contains: searchTerm, mode: 'insensitive' } },
          { packageName: { contains: searchTerm, mode: 'insensitive' } },
          { groundTypeBn: { contains: searchTerm, mode: 'insensitive' } },
          { sportTypeBn: { contains: searchTerm, mode: 'insensitive' } },
          { slotTypeBn: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    // Exact Match Filters
    if (groundType) andConditions.push({ groundType });
    if (sportType) andConditions.push({ sportType });
    if (slotType) andConditions.push({ slotType });
    if (packageNumber) andConditions.push({ packageNumber: Number(packageNumber) });
    if (status) andConditions.push({ status });

    // Amenities / Features Filters (Matching the handwritten turf sheet)
    if (isNightMatch !== undefined) andConditions.push({ isNightMatch: isNightMatch === true });
    if (hasRainEffect !== undefined) andConditions.push({ hasRainEffect: hasRainEffect === true });
    if (hasSoundSystem !== undefined) andConditions.push({ hasSoundSystem: hasSoundSystem === true });

    // Time Filters
    if (startTime) andConditions.push({ startTime: { gte: startTime } });
    if (endTime) andConditions.push({ endTime: { lte: endTime } });

    // Date Filters (Supports single date or range query)
    if (bookingDate) {
      const targetDate = new Date(bookingDate);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      andConditions.push({
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    } else if (startDate && endDate) {
      andConditions.push({
        bookingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      });
    }

    // Price Filtering Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      andConditions.push({
        totalPrice: {
          gte: minPrice !== undefined ? Number(minPrice) : undefined,
          lte: maxPrice !== undefined ? Number(maxPrice) : undefined,
        },
      });
    }

    // Only active slots
    andConditions.push({ isActive: true });

    const whereConditions: Prisma.SlotWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Execute query and total count concurrently for performance
    const [result, total] = await Promise.all([
      prisma.slot.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.slot.count({ where: whereConditions }),
    ]);

    const totalPage = Math.ceil(total / take);

    return {
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPage,
      },
      data: result,
    };
  },
};
