import { Request, Response, NextFunction } from 'express';
import { SlotService } from './slot.service';

export const SlotController = {
  createSlot: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await SlotService.createSlot(req.body);

      return res.status(201).json({
        success: true,
        message: 'Slot created successfully!',
        data: result,
      });
    } catch (error: unknown) {
      console.log('Error creating slot:', error);
      next(error);
    }
  },

  getAllSlots: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        searchTerm: req.query.searchTerm as string,
        bookingDate: req.query.bookingDate as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        startTime: req.query.startTime as string,
        endTime: req.query.endTime as string,
        groundType: req.query.groundType as string,
        sportType: req.query.sportType as string,
        slotTimeType: req.query.slotTimeType as string,
        packageNumber: req.query.packageNumber ? Number(req.query.packageNumber) : undefined,
        status: req.query.status as string,
        isNightMatch: req.query.isNightMatch ? req.query.isNightMatch === 'true' : undefined,
        hasRainEffect: req.query.hasRainEffect ? req.query.hasRainEffect === 'true' : undefined,
        hasSoundSystem: req.query.hasSoundSystem ? req.query.hasSoundSystem === 'true' : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await SlotService.getAllSlots(
        filters as Parameters<typeof SlotService.getAllSlots>[0],
        pagination,
      );

      return res.status(200).json({
        success: true,
        message: 'Slots fetched successfully!',
        meta: result.meta,
        data: result.data,
      });
    } catch (error: unknown) {
      next(error);
    }
  },

  deleteSlots: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;

      if (!ids) {
        return res.status(400).json({
          success: false,
          message: 'ডিলিট করার জন্য অন্তত একটি স্লট আইডি প্রদান করুন।',
        });
      }

      const deleteResult = await SlotService.deleteSlots(ids);

      if (deleteResult.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'যে স্লটগুলো মুছতে চাচ্ছেন তা খুঁজে পাওয়া যায়নি।',
        });
      }

      return res.status(200).json({
        success: true,
        message: `${deleteResult.count} টি স্লট সফলভাবে মুছে ফেলা হয়েছে।`,
        deletedCount: deleteResult.count,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
};