import {
  GroundType,
  Prisma,
  SlotStatus,
  SlotTimeType,
  SportType,
} from "@prisma/client";

import {
  ICreateSlot,
  IUpdateSlot,
  IPaginationOptions,
  ISlotFilterOptions,
} from "./slot.interface";

import { prisma } from "../../shared/config/db";
import { AppError } from "../../shared/errors/AppError";

export const SlotService = {
  // ==========================================
  // CREATE SLOT
  // ==========================================

  createSlot: async (payload: ICreateSlot) => {
    // ------------------------------------------
    // Check duplicate slotId
    // ------------------------------------------

    const existingSlot = await prisma.slot.findUnique({
      where: {
        slotId: payload.slotId,
      },
    });

    if (existingSlot) {
      throw new AppError(
        409,
        `Slot with ID '${payload.slotId}' already exists.`,
      );
    }

    // ------------------------------------------
    // Extra ground charge
    // ------------------------------------------

    const extraGroundCharge =
      payload.extraGroundCharge ?? 200;

    // ------------------------------------------
    // Calculate total price
    // ------------------------------------------

    const totalPrice =
      payload.totalPrice ??
      (payload.groundType === GroundType.PITCH_3_LARGE
        ? payload.regularPrice + extraGroundCharge
        : payload.regularPrice);

    // ------------------------------------------
    // Booking date
    // ------------------------------------------

    let bookingDate: Date | null = null;

    if (payload.bookingDate) {
      bookingDate =
        payload.bookingDate instanceof Date
          ? payload.bookingDate
          : new Date(payload.bookingDate);

      if (Number.isNaN(bookingDate.getTime())) {
        throw new AppError(
          400,
          "Invalid booking date.",
        );
      }
    }

    // ------------------------------------------
    // Create
    // ------------------------------------------

    const newSlot = await prisma.slot.create({
      data: {
        slotId: payload.slotId,

        groundType:
          payload.groundType ??
          GroundType.PITCH_1_SMALL,

        groundTypeBn:
          payload.groundTypeBn ??
          "মাঠ ১ (ছোট মাঠ)",

        sportType:
          payload.sportType ??
          SportType.FOOTBALL,

        sportTypeBn:
          payload.sportTypeBn,

        packageNumber:
          payload.packageNumber,

        packageName:
          payload.packageName,

        startTime:
          payload.startTime,

        endTime:
          payload.endTime,

        displayTime:
          payload.displayTime,

        bookingDate,

        playDurationMinutes:
          payload.playDurationMinutes ?? 55,

        bufferDurationMinutes:
          payload.bufferDurationMinutes ?? 5,

        hasExtraTime:
          payload.hasExtraTime ?? false,

        extraTimeMinutes:
          payload.extraTimeMinutes ?? 0,

        extraTimeCharge:
          payload.extraTimeCharge ?? 0,

        slotTimeType:
          payload.slotTimeType ??
          SlotTimeType.EVENING,

        slotTimeTypeBn:
          payload.slotTimeTypeBn,

        regularPrice:
          payload.regularPrice,

        extraGroundCharge,

        totalPrice,

        peakPrice:
          payload.peakPrice,

        weekendPrice:
          payload.weekendPrice,

        isNightMatch:
          payload.isNightMatch ?? false,

        hasRainEffect:
          payload.hasRainEffect ?? false,

        hasSoundSystem:
          payload.hasSoundSystem ?? false,

        includedAmenities:
          payload.includedAmenities ?? [],

        customAttributes:
          payload.customAttributes
            ? (payload.customAttributes as Prisma.InputJsonValue)
            : undefined,

        status:
          payload.status ??
          SlotStatus.AVAILABLE,

        isActive:
          payload.isActive ?? true,
      },
    });

    return newSlot;
  },

  // ==========================================
  // GET ALL SLOTS
  // ==========================================

  getAllSlots: async (
    filters: ISlotFilterOptions,
    pagination: IPaginationOptions,
  ) => {
    const {
      searchTerm,
      bookingDate,
      startDate,
      endDate,
      startTime,
      endTime,
      groundType,
      sportType,
      slotTimeType,
      packageNumber,
      status,
      isNightMatch,
      hasRainEffect,
      hasSoundSystem,
      minPrice,
      maxPrice,
    } = filters;

    // ------------------------------------------
    // Pagination
    // ------------------------------------------

    const page = Math.max(
      Number(pagination.page) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(
        Number(pagination.limit) || 10,
        1,
      ),
      100,
    );

    const skip = (page - 1) * limit;

    const sortOrder =
      pagination.sortOrder === "asc"
        ? "asc"
        : "desc";

    // ------------------------------------------
    // Conditions
    // ------------------------------------------

    const andConditions: Prisma.SlotWhereInput[] = [];

    // ------------------------------------------
    // Search
    // ------------------------------------------

    if (searchTerm?.trim()) {
      const search = searchTerm.trim();

      andConditions.push({
        OR: [
          {
            slotId: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            packageName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            groundTypeBn: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            sportTypeBn: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            slotTimeTypeBn: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    // ------------------------------------------
    // Exact filters
    // ------------------------------------------

    if (groundType) {
      andConditions.push({
        groundType,
      });
    }

    if (sportType) {
      andConditions.push({
        sportType,
      });
    }

    if (slotTimeType) {
      andConditions.push({
        slotTimeType,
      });
    }

    if (packageNumber !== undefined) {
      andConditions.push({
        packageNumber,
      });
    }

    if (status) {
      andConditions.push({
        status,
      });
    }

    // ------------------------------------------
    // Boolean filters
    // ------------------------------------------

    if (isNightMatch !== undefined) {
      andConditions.push({
        isNightMatch,
      });
    }

    if (hasRainEffect !== undefined) {
      andConditions.push({
        hasRainEffect,
      });
    }

    if (hasSoundSystem !== undefined) {
      andConditions.push({
        hasSoundSystem,
      });
    }

    // ------------------------------------------
    // Time filters
    // ------------------------------------------

    if (startTime) {
      andConditions.push({
        startTime: {
          gte: startTime,
        },
      });
    }

    if (endTime) {
      andConditions.push({
        endTime: {
          lte: endTime,
        },
      });
    }

    // ------------------------------------------
    // Booking date
    // ------------------------------------------

    if (bookingDate) {
      const targetDate = new Date(
        bookingDate,
      );

      if (Number.isNaN(targetDate.getTime())) {
        throw new AppError(
          400,
          "Invalid bookingDate.",
        );
      }

      const startOfDay = new Date(targetDate);

      startOfDay.setHours(
        0,
        0,
        0,
        0,
      );

      const endOfDay = new Date(targetDate);

      endOfDay.setHours(
        23,
        59,
        59,
        999,
      );

      andConditions.push({
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    // ------------------------------------------
    // Date range
    // ------------------------------------------

    if (
      !bookingDate &&
      (startDate || endDate)
    ) {
      const dateFilter: Prisma.DateTimeNullableFilter =
        {};

      if (startDate) {
        const start = new Date(
          startDate,
        );

        if (Number.isNaN(start.getTime())) {
          throw new AppError(
            400,
            "Invalid startDate.",
          );
        }

        start.setHours(
          0,
          0,
          0,
          0,
        );

        dateFilter.gte = start;
      }

      if (endDate) {
        const end = new Date(
          endDate,
        );

        if (Number.isNaN(end.getTime())) {
          throw new AppError(
            400,
            "Invalid endDate.",
          );
        }

        end.setHours(
          23,
          59,
          59,
          999,
        );

        dateFilter.lte = end;
      }

      andConditions.push({
        bookingDate: dateFilter,
      });
    }

    // ------------------------------------------
    // Price range
    // ------------------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      const priceFilter: Prisma.FloatFilter =
        {};

      if (minPrice !== undefined) {
        priceFilter.gte = minPrice;
      }

      if (maxPrice !== undefined) {
        priceFilter.lte = maxPrice;
      }

      andConditions.push({
        totalPrice: priceFilter,
      });
    }

    // ------------------------------------------
    // Active only
    // ------------------------------------------

    andConditions.push({
      isActive: true,
    });

    const where: Prisma.SlotWhereInput = {
      AND: andConditions,
    };

    // ------------------------------------------
    // Safe sorting
    // ------------------------------------------

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "slotId",
      "regularPrice",
      "totalPrice",
      "bookingDate",
      "startTime",
      "endTime",
      "packageNumber",
    ] as const;

    type AllowedSortField =
      (typeof allowedSortFields)[number];

    const requestedSort =
      pagination.sortBy;

    const sortBy: AllowedSortField =
      requestedSort &&
      allowedSortFields.includes(
        requestedSort as AllowedSortField,
      )
        ? (requestedSort as AllowedSortField)
        : "createdAt";

    const orderBy: Prisma.SlotOrderByWithRelationInput =
      {
        [sortBy]: sortOrder,
      };

    // ------------------------------------------
    // Database query
    // ------------------------------------------

    const [data, total] =
      await Promise.all([
        prisma.slot.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),

        prisma.slot.count({
          where,
        }),
      ]);

    // ------------------------------------------
    // Pagination meta
    // ------------------------------------------

    const totalPage =
      Math.ceil(total / limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
      data,
    };
  },

  // ==========================================
  // GET SINGLE SLOT
  // ==========================================

  getSlotById: async (id: string) => {
    const slot =
      await prisma.slot.findUnique({
        where: {
          id,
        },
      });

    if (!slot) {
      throw new AppError(
        404,
        "Slot not found.",
      );
    }

    return slot;
  },

  // ==========================================
  // UPDATE SLOT
  // ==========================================

  updateSlot: async (
    id: string,
    payload: IUpdateSlot,
  ) => {
    const existingSlot =
      await prisma.slot.findUnique({
        where: {
          id,
        },
      });

    if (!existingSlot) {
      throw new AppError(
        404,
        "Slot not found.",
      );
    }

    // ------------------------------------------
    // Check duplicate slotId
    // ------------------------------------------

    if (
      payload.slotId &&
      payload.slotId !== existingSlot.slotId
    ) {
      const duplicateSlot =
        await prisma.slot.findUnique({
          where: {
            slotId: payload.slotId,
          },
        });

      if (duplicateSlot) {
        throw new AppError(
          409,
          `Slot with ID '${payload.slotId}' already exists.`,
        );
      }
    }

    // ------------------------------------------
    // Calculate total price
    // ------------------------------------------

    const regularPrice =
      payload.regularPrice ??
      existingSlot.regularPrice;

    const groundType =
      payload.groundType ??
      existingSlot.groundType;

    const extraGroundCharge =
      payload.extraGroundCharge ??
      existingSlot.extraGroundCharge;

    const totalPrice =
      payload.totalPrice ??
      (groundType ===
      GroundType.PITCH_3_LARGE
        ? regularPrice +
          extraGroundCharge
        : regularPrice);

    // ------------------------------------------
    // Booking date
    // ------------------------------------------

    let bookingDate:
      | Date
      | null
      | undefined;

    if (
      payload.bookingDate !==
      undefined
    ) {
      if (
        payload.bookingDate ===
        null
      ) {
        bookingDate = null;
      } else {
        bookingDate =
          payload.bookingDate instanceof Date
            ? payload.bookingDate
            : new Date(
                payload.bookingDate,
              );

        if (
          Number.isNaN(
            bookingDate.getTime(),
          )
        ) {
          throw new AppError(
            400,
            "Invalid booking date.",
          );
        }
      }
    }

    // ------------------------------------------
    // Update
    // ------------------------------------------

    const updatedSlot =
      await prisma.slot.update({
        where: {
          id,
        },

        data: {
          ...(payload.slotId !==
            undefined && {
            slotId:
              payload.slotId,
          }),

          ...(payload.groundType !==
            undefined && {
            groundType:
              payload.groundType,
          }),

          ...(payload.groundTypeBn !==
            undefined && {
            groundTypeBn:
              payload.groundTypeBn,
          }),

          ...(payload.sportType !==
            undefined && {
            sportType:
              payload.sportType,
          }),

          ...(payload.sportTypeBn !==
            undefined && {
            sportTypeBn:
              payload.sportTypeBn,
          }),

          ...(payload.packageNumber !==
            undefined && {
            packageNumber:
              payload.packageNumber,
          }),

          ...(payload.packageName !==
            undefined && {
            packageName:
              payload.packageName,
          }),

          ...(payload.startTime !==
            undefined && {
            startTime:
              payload.startTime,
          }),

          ...(payload.endTime !==
            undefined && {
            endTime:
              payload.endTime,
          }),

          ...(payload.displayTime !==
            undefined && {
            displayTime:
              payload.displayTime,
          }),

          ...(bookingDate !==
            undefined && {
            bookingDate,
          }),

          ...(payload.playDurationMinutes !==
            undefined && {
            playDurationMinutes:
              payload.playDurationMinutes,
          }),

          ...(payload.bufferDurationMinutes !==
            undefined && {
            bufferDurationMinutes:
              payload.bufferDurationMinutes,
          }),

          ...(payload.hasExtraTime !==
            undefined && {
            hasExtraTime:
              payload.hasExtraTime,
          }),

          ...(payload.extraTimeMinutes !==
            undefined && {
            extraTimeMinutes:
              payload.extraTimeMinutes,
          }),

          ...(payload.extraTimeCharge !==
            undefined && {
            extraTimeCharge:
              payload.extraTimeCharge,
          }),

          ...(payload.slotTimeType !==
            undefined && {
            slotTimeType:
              payload.slotTimeType,
          }),

          ...(payload.slotTimeTypeBn !==
            undefined && {
            slotTimeTypeBn:
              payload.slotTimeTypeBn,
          }),

          ...(payload.regularPrice !==
            undefined && {
            regularPrice:
              payload.regularPrice,
          }),

          ...(payload.extraGroundCharge !==
            undefined && {
            extraGroundCharge:
              payload.extraGroundCharge,
          }),

          totalPrice,

          ...(payload.peakPrice !==
            undefined && {
            peakPrice:
              payload.peakPrice,
          }),

          ...(payload.weekendPrice !==
            undefined && {
            weekendPrice:
              payload.weekendPrice,
          }),

          ...(payload.isNightMatch !==
            undefined && {
            isNightMatch:
              payload.isNightMatch,
          }),

          ...(payload.hasRainEffect !==
            undefined && {
            hasRainEffect:
              payload.hasRainEffect,
          }),

          ...(payload.hasSoundSystem !==
            undefined && {
            hasSoundSystem:
              payload.hasSoundSystem,
          }),

          ...(payload.includedAmenities !==
            undefined && {
            includedAmenities:
              payload.includedAmenities,
          }),

          ...(payload.customAttributes !==
            undefined && {
            customAttributes:
              payload.customAttributes as Prisma.InputJsonValue,
          }),

          ...(payload.status !==
            undefined && {
            status:
              payload.status,
          }),

          ...(payload.isActive !==
            undefined && {
            isActive:
              payload.isActive,
          }),
        },
      });

    return updatedSlot;
  },

  // ==========================================
  // DELETE MULTIPLE SLOTS
  // ==========================================

  deleteSlots: async (
    ids: string | string[],
  ) => {
    const idArray = Array.isArray(ids)
      ? ids
      : [ids];

    const cleanIds = idArray
      .filter(
        (id): id is string =>
          typeof id === "string" &&
          id.trim().length > 0,
      )
      .map((id) => id.trim());

    if (cleanIds.length === 0) {
      throw new AppError(
        400,
        "ডিলিট করার জন্য অন্তত একটি স্লট আইডি প্রদান করুন।",
      );
    }

    const deleteResult =
      await prisma.slot.deleteMany({
        where: {
          id: {
            in: cleanIds,
          },
        },
      });

    return {
      count: deleteResult.count,
    };
  },
};