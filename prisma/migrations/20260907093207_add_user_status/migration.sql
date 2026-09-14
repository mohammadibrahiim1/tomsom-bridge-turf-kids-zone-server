-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('FOOTBALL', 'CRICKET', 'BADMINTON', 'KIDS_ZONE');

-- CreateEnum
CREATE TYPE "SlotTimeType" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'LOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "sportType" "SportType" NOT NULL DEFAULT 'FOOTBALL',
    "sportTypeBn" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "displayTime" TEXT NOT NULL,
    "playDurationMinutes" INTEGER NOT NULL DEFAULT 55,
    "bufferDurationMinutes" INTEGER NOT NULL DEFAULT 5,
    "slotTimeType" "SlotTimeType" NOT NULL DEFAULT 'EVENING',
    "slotTimeTypeBn" TEXT,
    "regularPrice" DOUBLE PRECISION NOT NULL,
    "peakPrice" DOUBLE PRECISION,
    "weekendPrice" DOUBLE PRECISION,
    "customAttributes" JSONB,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_slotId_key" ON "time_slots"("slotId");

-- CreateIndex
CREATE INDEX "time_slots_sportType_idx" ON "time_slots"("sportType");
