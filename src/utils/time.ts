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

export function parseTime(timeStr: string): ParsedTime {
  const parts = timeStr.split(" ");
  const [hours, minutes] = parts[0].split(":").map(Number);

  if (parts.length === 1) {
    return { hours, minutes };
  }

  const modifier = parts[1].toUpperCase();

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
 * Check if a medication should be scheduled today based on its frequency settings
 */
export function shouldScheduleToday(medication: MedicationFrequency): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (medication.frequencyType) {
    case "DAILY":
      return true;

    case "INTERVAL": {
      const createdDate = new Date(medication.createdAt);
      createdDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (medication.intervalUnit === "DAYS") {
        return diffDays % medication.intervalValue === 0;
      }

      if (medication.intervalUnit === "WEEKS") {
        const diffWeeks = Math.floor(diffDays / 7);
        // Schedule if we're on the right week AND same day of week as creation
        return (
          diffWeeks % medication.intervalValue === 0 &&
          today.getDay() === createdDate.getDay()
        );
      }

      if (medication.intervalUnit === "MONTHS") {
        const diffMonths =
          (today.getFullYear() - createdDate.getFullYear()) * 12 +
          (today.getMonth() - createdDate.getMonth());
        // Schedule if we're on the right month AND same day of month as creation
        return (
          diffMonths % medication.intervalValue === 0 &&
          today.getDate() === createdDate.getDate()
        );
      }

      return false;
    }

    case "SPECIFIC_DAYS": {
      const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const todayName = dayNames[today.getDay()];
      return medication.selectedDays.includes(todayName);
    }

    default:
      return true;
  }
}
