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

CREATE UNIQUE INDEX "slots_slotId_key"
ON "slots"("slotId");

CREATE INDEX "slots_sportType_idx"
ON "slots"("sportType");

CREATE INDEX "slots_groundType_idx"
ON "slots"("groundType");

CREATE INDEX "slots_status_idx"
ON "slots"("status");

CREATE INDEX "slots_bookingDate_idx"
ON "slots"("bookingDate");

CREATE INDEX "slots_slotTimeType_idx"
ON "slots"("slotTimeType");

