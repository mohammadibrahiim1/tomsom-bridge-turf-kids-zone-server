import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import {
  GroundType,
  SlotStatus,
  SlotTimeType,
  SportType,
} from "@prisma/client";

import { SlotService } from "./slot.service";
import { ICreateSlot } from "./slot.interface";

import { catchAsync } from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/response";

// ==========================================
// CREATE
// ==========================================

const createSlot = catchAsync(
  async (req: Request, res: Response) => {
    const payload =
      req.body as ICreateSlot;

    const result =
      await SlotService.createSlot(
        payload,
      );

    sendResponse(res, {
      statusCode:
        StatusCodes.CREATED,

      success: true,

      message:
        "Slot created successfully!",

      data: result,
    });
  },
);

// ==========================================
// GET ALL
// ==========================================

const getAllSlots = catchAsync(
  async (req: Request, res: Response) => {
    // ------------------------------------------
    // Filters
    // ------------------------------------------

    const filters = {
      searchTerm:
        typeof req.query.searchTerm ===
        "string"
          ? req.query.searchTerm
          : undefined,

      bookingDate:
        typeof req.query.bookingDate ===
        "string"
          ? req.query.bookingDate
          : undefined,

      startDate:
        typeof req.query.startDate ===
        "string"
          ? req.query.startDate
          : undefined,

      endDate:
        typeof req.query.endDate ===
        "string"
          ? req.query.endDate
          : undefined,

      startTime:
        typeof req.query.startTime ===
        "string"
          ? req.query.startTime
          : undefined,

      endTime:
        typeof req.query.endTime ===
        "string"
          ? req.query.endTime
          : undefined,

      groundType:
        typeof req.query.groundType ===
        "string"
          ? (req.query.groundType as GroundType)
          : undefined,

      sportType:
        typeof req.query.sportType ===
        "string"
          ? (req.query.sportType as SportType)
          : undefined,

      slotTimeType:
        typeof req.query.slotTimeType ===
        "string"
          ? (req.query.slotTimeType as SlotTimeType)
          : undefined,

      packageNumber:
        typeof req.query.packageNumber ===
        "string"
          ? Number(req.query.packageNumber)
          : undefined,

      status:
        typeof req.query.status ===
        "string"
          ? (req.query.status as SlotStatus)
          : undefined,

      isNightMatch:
        typeof req.query.isNightMatch ===
        "string"
          ? req.query.isNightMatch ===
            "true"
          : undefined,

      hasRainEffect:
        typeof req.query.hasRainEffect ===
        "string"
          ? req.query.hasRainEffect ===
            "true"
          : undefined,

      hasSoundSystem:
        typeof req.query.hasSoundSystem ===
        "string"
          ? req.query.hasSoundSystem ===
            "true"
          : undefined,

      minPrice:
        typeof req.query.minPrice ===
        "string"
          ? Number(req.query.minPrice)
          : undefined,

      maxPrice:
        typeof req.query.maxPrice ===
        "string"
          ? Number(req.query.maxPrice)
          : undefined,
    };

    // ------------------------------------------
    // Pagination
    // ------------------------------------------

    const pagination = {
      page:
        typeof req.query.page ===
        "string"
          ? Number(req.query.page)
          : 1,

      limit:
        typeof req.query.limit ===
        "string"
          ? Number(req.query.limit)
          : 10,

      sortBy:
        typeof req.query.sortBy ===
        "string"
          ? req.query.sortBy
          : "createdAt",

      sortOrder:
        req.query.sortOrder === "asc"
          ? ("asc" as const)
          : ("desc" as const),
    };

    const result =
      await SlotService.getAllSlots(
        filters,
        pagination,
      );

    sendResponse(res, {
      statusCode:
        StatusCodes.OK,

      success: true,

      message:
        "Slots fetched successfully!",

      meta: result.meta,
      data: result.data,
    });
  },
);

// ==========================================
// GET SINGLE
// ==========================================

const getSlotById = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await SlotService.getSlotById(
        id,
      );

    sendResponse(res, {
      statusCode:
        StatusCodes.OK,

      success: true,

      message:
        "Slot fetched successfully!",

      data: result,
    });
  },
);

// ==========================================
// UPDATE
// ==========================================

const updateSlot = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result =
      await SlotService.updateSlot(
        id,
        req.body,
      );

    sendResponse(res, {
      statusCode:
        StatusCodes.OK,

      success: true,

      message:
        "Slot updated successfully!",

      data: result,
    });
  },
);

// ==========================================
// DELETE MULTIPLE
// ==========================================

const deleteSlots = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;

    const result =
      await SlotService.deleteSlots(
        ids,
      );

    if (result.count === 0) {
      sendResponse(res, {
        statusCode:
          StatusCodes.NOT_FOUND,

        success: false,

        message:
          "যে স্লটগুলো মুছতে চাচ্ছেন তা খুঁজে পাওয়া যায়নি।",

        data: null,
      });

      return;
    }

    sendResponse(res, {
      statusCode:
        StatusCodes.OK,

      success: true,

      message: `${result.count} টি স্লট সফলভাবে মুছে ফেলা হয়েছে।`,

      data: {
        deletedCount:
          result.count,
      },
    });
  },
);

export const SlotController = {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  deleteSlots,
};