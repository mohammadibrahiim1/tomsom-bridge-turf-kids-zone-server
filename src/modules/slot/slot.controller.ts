import { Request, Response } from 'express';
import { SlotService } from './slot.service';

export const SlotController = {
  createSlot: async (req: Request, res: Response) => {
    try {
      const result = await SlotService.createSlot(req.body);

      return res.status(201).json({
        success: true,
        message: 'Slot created successfully!',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create slot.',
      });
    }
  },

  getAllSlots: async (req: Request, res: Response) => {
    try {
      // Extract filter params
      const filters = {
        searchTerm: req.query.searchTerm as string,
        bookingDate: req.query.bookingDate as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        startTime: req.query.startTime as string,
        endTime: req.query.endTime as string,
        groundType: req.query.groundType as any,
        sportType: req.query.sportType as any,
        slotType: req.query.slotType as any,
        packageNumber: req.query.packageNumber ? Number(req.query.packageNumber) : undefined,
        status: req.query.status as any,
        isNightMatch: req.query.isNightMatch ? req.query.isNightMatch === 'true' : undefined,
        hasRainEffect: req.query.hasRainEffect ? req.query.hasRainEffect === 'true' : undefined,
        hasSoundSystem: req.query.hasSoundSystem ? req.query.hasSoundSystem === 'true' : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      // Extract pagination params
      const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await SlotService.getAllSlots(filters, pagination);

      return res.status(200).json({
        success: true,
        message: 'Slots fetched successfully!',
        meta: result.meta,
        data: result.data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'internal server error!',
      });
    }
  },
};
