"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotStatus = exports.SlotTimeType = exports.SportType = exports.GroundType = void 0;
var GroundType;
(function (GroundType) {
    GroundType["PITCH_1_SMALL"] = "PITCH_1_SMALL";
    GroundType["PITCH_2_MEDIUM"] = "PITCH_2_MEDIUM";
    GroundType["PITCH_3_LARGE"] = "PITCH_3_LARGE";
    GroundType["INDOR_TURF"] = "INDOR_TURF";
    GroundType["ROOFTOP_TURF"] = "ROOFTOP_TURF";
    GroundType["VIP_TURF"] = "VIP_TURF";
})(GroundType || (exports.GroundType = GroundType = {}));
var SportType;
(function (SportType) {
    SportType["CRICKET"] = "CRICKET";
    SportType["FOOTBALL"] = "FOOTBALL";
    SportType["BADMINTON"] = "BADMINTON";
    SportType["BASKETBALL"] = "BASKETBALL";
    SportType["TENNIS"] = "TENNIS";
    SportType["KIDS_ZONE"] = "KIDS_ZONE";
})(SportType || (exports.SportType = SportType = {}));
var SlotTimeType;
(function (SlotTimeType) {
    SlotTimeType["EARLY_MORNING"] = "EARLY_MORNING";
    SlotTimeType["MORNING"] = "MORNING";
    SlotTimeType["AFTERNOON"] = "AFTERNOON";
    SlotTimeType["EVENING"] = "EVENING";
    SlotTimeType["NIGHT"] = "NIGHT";
    SlotTimeType["LATE_NIGHT"] = "LATE_NIGHT";
    SlotTimeType["WEEKEND_SPECIAL"] = "WEEKEND_SPECIAL";
})(SlotTimeType || (exports.SlotTimeType = SlotTimeType = {}));
var SlotStatus;
(function (SlotStatus) {
    SlotStatus["AVAILABLE"] = "AVAILABLE";
    SlotStatus["BOOKED"] = "BOOKED";
    SlotStatus["MAINTENANCE"] = "MAINTENANCE";
})(SlotStatus || (exports.SlotStatus = SlotStatus = {}));
