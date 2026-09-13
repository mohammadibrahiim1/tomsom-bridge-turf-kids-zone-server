"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotService = void 0;
const slot_model_1 = require("./slot.model");
exports.SlotService = {
    createSlot: async (payload) => {
        // 1. Check if slotId already exists
        const existingSlot = await slot_model_1.Slot.findOne({ slotId: payload.slotId });
        if (existingSlot) {
            throw new Error(`Slot with ID '${payload.slotId}' already exists.`);
        }
        // 2. Auto-calculate totalPrice if not explicitly provided
        const extraCharge = payload.extraGroundCharge ?? 200;
        const calculatedTotalPrice = payload.totalPrice ??
            (payload.groundType === 'PITCH_3_LARGE' ? payload.regularPrice + extraCharge : payload.regularPrice);
        // 3. Save to database
        const newSlot = await slot_model_1.Slot.create({
            ...payload,
            slotTimeType: payload.slotTimeType,
            extraGroundCharge: extraCharge,
            totalPrice: calculatedTotalPrice,
            bookingDate: payload.bookingDate ? new Date(payload.bookingDate) : null,
        });
        return newSlot;
    },
    getAllSlots: async (filters, pagination) => {
        const { searchTerm, bookingDate, startDate, endDate, startTime, endTime, groundType, sportType, slotTimeType, packageNumber, status, isNightMatch, hasRainEffect, hasSoundSystem, minPrice, maxPrice, } = filters;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const andConditions = [];
        // Global Search
        if (searchTerm) {
            andConditions.push({
                $or: [
                    { slotId: { $regex: searchTerm, $options: 'insensitive' } },
                    { packageName: { $regex: searchTerm, $options: 'insensitive' } },
                    { groundTypeBn: { $regex: searchTerm, $options: 'insensitive' } },
                    { sportTypeBn: { $regex: searchTerm, $options: 'insensitive' } },
                    { slotTypeBn: { $regex: searchTerm, $options: 'insensitive' } },
                ],
            });
        }
        // Exact Match Filters
        if (groundType)
            andConditions.push({ groundType });
        if (sportType)
            andConditions.push({ sportType });
        if (slotTimeType)
            andConditions.push({ slotTimeType });
        if (packageNumber)
            andConditions.push({ packageNumber: Number(packageNumber) });
        if (status)
            andConditions.push({ status });
        // Amenities Filters
        if (isNightMatch !== undefined)
            andConditions.push({ isNightMatch: isNightMatch === true });
        if (hasRainEffect !== undefined)
            andConditions.push({ hasRainEffect: hasRainEffect === true });
        if (hasSoundSystem !== undefined)
            andConditions.push({ hasSoundSystem: hasSoundSystem === true });
        // Time Filters
        if (startTime)
            andConditions.push({ startTime: { $gte: startTime } });
        if (endTime)
            andConditions.push({ endTime: { $lte: endTime } });
        // Date Filters
        if (bookingDate) {
            const targetDate = new Date(bookingDate);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            andConditions.push({
                bookingDate: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
            });
        }
        else if (startDate && endDate) {
            andConditions.push({
                bookingDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            });
        }
        // Price Filtering Range
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceQuery = {};
            if (minPrice !== undefined)
                priceQuery.$gte = Number(minPrice);
            if (maxPrice !== undefined)
                priceQuery.$lte = Number(maxPrice);
            andConditions.push({ totalPrice: priceQuery });
        }
        // Only active slots
        andConditions.push({ isActive: true });
        const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const [result, total] = await Promise.all([
            slot_model_1.Slot.find(whereConditions).skip(skip).limit(take).sort(sortOptions),
            slot_model_1.Slot.countDocuments(whereConditions),
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
    deleteSlots: async (ids) => {
        const idArray = Array.isArray(ids) ? ids : [ids];
        if (idArray.length === 0) {
            throw new Error('ডিলিট করার জন্য অন্তত একটি স্লট আইডি প্রদান করুন।');
        }
        const deleteResult = await slot_model_1.Slot.deleteMany({
            _id: { $in: idArray },
        });
        return { count: deleteResult.deletedCount || 0 };
    },
};
