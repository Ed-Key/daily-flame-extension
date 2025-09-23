"use strict";
/**
 * Date utility functions for Daily Bread
 * Ensures consistent date handling across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalDateString = getLocalDateString;
exports.parseLocalDateString = parseLocalDateString;
exports.getDayOfYear = getDayOfYear;
/**
 * Get the current date in the user's local timezone as YYYY-MM-DD string
 * This ensures verse changes happen at midnight in the user's timezone,
 * not at midnight UTC
 */
function getLocalDateString(date) {
    if (date === void 0) { date = new Date(); }
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
/**
 * Parse a YYYY-MM-DD string into a Date object in local timezone
 * Useful for comparing dates or calculating date differences
 */
function parseLocalDateString(dateString) {
    var _a = dateString.split('-').map(Number), year = _a[0], month = _a[1], day = _a[2];
    return new Date(year, month - 1, day);
}
/**
 * Get the day of year (1-365/366) for a given date
 * Used for deterministic verse selection based on date
 */
function getDayOfYear(date) {
    if (date === void 0) { date = new Date(); }
    var startOfYear = new Date(date.getFullYear(), 0, 0);
    var diff = date.getTime() - startOfYear.getTime();
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
