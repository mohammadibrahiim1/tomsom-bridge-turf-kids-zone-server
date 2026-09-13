"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_model_1 = require("../../modules/user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const seedSuperAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('Database connected for seeding...');
        const isSuperAdminExist = await user_model_1.User.findOne({ role: 'SUPER_ADMIN' });
        if (!isSuperAdminExist) {
            const plainPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
            const hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10);
            const superAdminData = {
                name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
                username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
                email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com',
                phone: process.env.SUPER_ADMIN_PHONE || '01700000000',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                status: 'APPROVED',
                is_active: true,
            };
            await user_model_1.User.create(superAdminData);
            console.log('✨ Super Admin created successfully!');
        }
        else {
            console.log('⚠️ Super Admin already exists!');
        }
    }
    catch (error) {
        console.error('Error seeding Super Admin:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Database disconnected.');
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
(0, exports.seedSuperAdmin)();
