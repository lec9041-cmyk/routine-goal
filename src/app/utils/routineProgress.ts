import type { Routine } from "../context/DataContext";
import { toDateKey } from "./dateUtils";

const getWeekStartKey = (referenceDate: Date) => {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return toDateKey(date);
};

const getWeekEndKey = (referenceDate: Date) => {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const sundayOffset = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + sundayOffset);
  return toDateKey(date);
};

const getMonthPrefix = (referenceDate: Date) => {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-`;
};

export const getRoutineCountForPeriod = (routine: Routine, referenceDate: Date) => {
  const completedDates = routine.completedDates ?? [];
  const referenceKey = toDateKey(referenceDate);

  if (routine.frequency === "daily") {
    return completedDates.filter((dateKey) => dateKey === referenceKey).length;
  }

  if (routine.frequency === "weekly") {
    const weekStart = getWeekStartKey(referenceDate);
    const weekEnd = getWeekEndKey(referenceDate);
    return completedDates.filter((dateKey) => dateKey >= weekStart && dateKey <= weekEnd).length;
  }

  const monthPrefix = getMonthPrefix(referenceDate);
  return completedDates.filter((dateKey) => dateKey.startsWith(monthPrefix)).length;
};

export const getRoutineDisplayCount = (routine: Routine, referenceDate: Date = new Date()) => {
  return getRoutineCountForPeriod(routine, referenceDate);
};

export const isRoutineCompleted = (routine: Routine, referenceDate: Date = new Date()) => {
  return getRoutineCountForPeriod(routine, referenceDate) >= routine.targetCount;
};
