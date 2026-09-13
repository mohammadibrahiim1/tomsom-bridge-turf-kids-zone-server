"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotController = void 0;
const slot_service_1 = require("./slot.service");
exports.SlotController = {
    createSlot: async (req, res, next) => {
        try {
            const result = await slot_service_1.SlotService.createSlot(req.body);
            return res.status(201).json({
                success: true,
                message: 'Slot created successfully!',
                data: result,
            });
        }
        catch (error) {
            console.log('Error creating slot:', error);
            next(error);
        }
    },
    getAllSlots: async (req, res, next) => {
        try {
            const filters = {
                searchTerm: req.query.searchTerm,
                bookingDate: req.query.bookingDate,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                startTime: req.query.startTime,
                endTime: req.query.endTime,
                groundType: req.query.groundType,
                sportType: req.query.sportType,
                slotTimeType: req.query.slotTimeType,
                packageNumber: req.query.packageNumber ? Number(req.query.packageNumber) : undefined,
                status: req.query.status,
                isNightMatch: req.query.isNightMatch ? req.query.isNightMatch === 'true' : undefined,
                hasRainEffect: req.query.hasRainEffect ? req.query.hasRainEffect === 'true' : undefined,
                hasSoundSystem: req.query.hasSoundSystem ? req.query.hasSoundSystem === 'true' : undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            };
            const pagination = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                sortBy: req.query.sortBy || 'createdAt',
                sortOrder: req.query.sortOrder || 'desc',
            };
            const result = await slot_service_1.SlotService.getAllSlots(filters, pagination);
            return res.status(200).json({
                success: true,
                message: 'Slots fetched successfully!',
                meta: result.meta,
                data: result.data,
            });
        }
        catch (error) {
            next(error);
        }
    },
    deleteSlots: async (req, res, next) => {
        try {
            const { ids } = req.body;
            if (!ids) {
                return res.status(400).json({
                    success: false,
                    message: 'ডিলিট করার জন্য অন্তত একটি স্লট আইডি প্রদান করুন।',
                });
            }
            const deleteResult = await slot_service_1.SlotService.deleteSlots(ids);
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
        }
        catch (error) {
            next(error);
        }
    },
};
