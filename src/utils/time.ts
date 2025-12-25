interface ParsedTime {
  hours: number;
  minutes: number;
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
