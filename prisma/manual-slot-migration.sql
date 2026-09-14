-- CreateEnum
CREATE TYPE "GroundType" AS ENUM ('PITCH_1_SMALL', 'PITCH_2_MEDIUM', 'PITCH_3_LARGE', 'INDOR_TURF', 'ROOFTOP_TURF', 'VIP_TURF');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SlotTimeType" ADD VALUE 'EARLY_MORNING';
ALTER TYPE "SlotTimeType" ADD VALUE 'LATE_NIGHT';
ALTER TYPE "SlotTimeType" ADD VALUE 'WEEKEND_SPECIAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SportType" ADD VALUE 'TENNIS';
ALTER TYPE "SportType" ADD VALUE 'BASKETBALL';

-- DropTable
DROP TABLE "time_slots";

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "groundType" "GroundType" NOT NULL DEFAULT 'PITCH_1_SMALL',
    "groundTypeBn" TEXT DEFAULT 'মাঠ ১ (ছোট মাঠ)',
    "sportType" "SportType" NOT NULL DEFAULT 'FOOTBALL',
    "sportTypeBn" TEXT,
    "packageNumber" INTEGER,
    "packageName" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "displayTime" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3),
    "playDurationMinutes" INTEGER NOT NULL DEFAULT 55,
    "bufferDurationMinutes" INTEGER NOT NULL DEFAULT 5,
    "hasExtraTime" BOOLEAN NOT NULL DEFAULT false,
    "extraTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "extraTimeCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "slotTimeType" "SlotTimeType" NOT NULL DEFAULT 'EVENING',
    "slotTimeTypeBn" TEXT,
    "regularPrice" DOUBLE PRECISION NOT NULL,
    "extraGroundCharge" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "peakPrice" DOUBLE PRECISION,
    "weekendPrice" DOUBLE PRECISION,
    "isNightMatch" BOOLEAN NOT NULL DEFAULT false,
    "hasRainEffect" BOOLEAN NOT NULL DEFAULT false,
    "hasSoundSystem" BOOLEAN NOT NULL DEFAULT false,
    "includedAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customAttributes" JSONB,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slots_slotId_key" ON "slots"("slotId");

-- CreateIndex
CREATE INDEX "slots_sportType_idx" ON "slots"("sportType");

-- CreateIndex
CREATE INDEX "slots_groundType_idx" ON "slots"("groundType");

-- CreateIndex
CREATE INDEX "slots_status_idx" ON "slots"("status");

-- CreateIndex
CREATE INDEX "slots_bookingDate_idx" ON "slots"("bookingDate");

-- CreateIndex
CREATE INDEX "slots_slotTimeType_idx" ON "slots"("slotTimeType");
