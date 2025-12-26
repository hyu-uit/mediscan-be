import { FrequencyType, IntervalUnit } from "@prisma/client";

interface ParsedTime {
  hours: number;
  minutes: number;
}

export interface MedicationFrequency {
  frequencyType: FrequencyType;
  intervalValue: number;
  intervalUnit: IntervalUnit;
  selectedDays: string[];
  createdAt: Date;
}

/**
 * Get today's date at UTC midnight (00:00:00.000Z)
 * This ensures consistent date storage regardless of server timezone
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Get a specific date at UTC midnight
 */
export function getDateUTC(date: Date | string): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function parseTime(timeStr: string): ParsedTime {
  const parts = timeStr.split(" ");
  const [hours, minutes] = parts[0].split(":")?.map(Number);

  if (parts.length === 1) {
    return { hours, minutes };
  }

  const modifier = parts[1]?.toUpperCase();

  if (modifier === "PM" && hours !== 12) {
    return { hours: hours + 12, minutes };
  }

  if (modifier === "AM" && hours === 12) {
    return { hours: 0, minutes };
  }

  return { hours, minutes };
}

export function getScheduledDateTimeForToday(timeStr: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { hours, minutes } = parseTime(timeStr);
  const scheduledDateTime = new Date(today);
  scheduledDateTime.setHours(hours, minutes, 0, 0);

  return scheduledDateTime;
}

export function hasTimePassed(timeStr: string): boolean {
  return getScheduledDateTimeForToday(timeStr) <= new Date();
}

export function getDelayUntil(timeStr: string): number {
  return getScheduledDateTimeForToday(timeStr).getTime() - Date.now();
}

/**
 * Check if a medication should be scheduled on a specific date based on its frequency settings
 */
export function shouldScheduleOnDate(
  medication: MedicationFrequency,
  targetDate: Date
): boolean {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const createdDate = new Date(medication.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  // Don't schedule for dates before medication was created
  if (target < createdDate) return false;

  switch (medication.frequencyType) {
    case "DAILY":
      return true;

    case "INTERVAL": {
      const diffTime = target.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (medication.intervalUnit === "DAYS") {
        return diffDays % medication.intervalValue === 0;
      }

      if (medication.intervalUnit === "WEEKS") {
        const diffWeeks = Math.floor(diffDays / 7);
        return (
          diffWeeks % medication.intervalValue === 0 &&
          target.getDay() === createdDate.getDay()
        );
      }

      if (medication.intervalUnit === "MONTHS") {
        const diffMonths =
          (target.getFullYear() - createdDate.getFullYear()) * 12 +
          (target.getMonth() - createdDate.getMonth());
        return (
          diffMonths % medication.intervalValue === 0 &&
          target.getDate() === createdDate.getDate()
        );
      }

      return false;
    }

    case "SPECIFIC_DAYS": {
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const targetDayName = dayNames[target.getDay()];
      return medication.selectedDays
        .map((d) => d?.toUpperCase())
        .includes(targetDayName);
    }

    default:
      return true;
  }
}

/**
 * Check if a medication should be scheduled today based on its frequency settings
 */
export function shouldScheduleToday(medication: MedicationFrequency): boolean {
  return shouldScheduleOnDate(medication, new Date());
}
