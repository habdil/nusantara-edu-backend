"use strict";
// src/types/aiTypes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrgencyLevel = exports.ImplementationStatus = exports.RecommendationCategory = void 0;
// Enums matching Prisma schema
var RecommendationCategory;
(function (RecommendationCategory) {
    RecommendationCategory["ACADEMIC"] = "academic";
    RecommendationCategory["FINANCIAL"] = "financial";
    RecommendationCategory["ASSET"] = "asset";
    RecommendationCategory["TEACHER"] = "teacher";
    RecommendationCategory["ATTENDANCE"] = "attendance";
})(RecommendationCategory || (exports.RecommendationCategory = RecommendationCategory = {}));
var ImplementationStatus;
(function (ImplementationStatus) {
    ImplementationStatus["PENDING"] = "pending";
    ImplementationStatus["IN_PROGRESS"] = "in_progress";
    ImplementationStatus["APPROVED"] = "approved";
    ImplementationStatus["COMPLETED"] = "completed";
    ImplementationStatus["REJECTED"] = "rejected";
})(ImplementationStatus || (exports.ImplementationStatus = ImplementationStatus = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["LOW"] = "low";
    UrgencyLevel["MEDIUM"] = "medium";
    UrgencyLevel["HIGH"] = "high";
    UrgencyLevel["CRITICAL"] = "critical";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
