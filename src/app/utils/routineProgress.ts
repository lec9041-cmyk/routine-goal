import type { Routine } from "../context/DataContext";

export const getRoutineDisplayCount = (routine: Routine) => {
  if (routine.frequency === "daily") {
    return routine.currentCount;
  }

  if (routine.frequency === "weekly") {
    return routine.weeklyCount || 0;
  }

  return routine.monthlyCount || 0;
};

export const isRoutineCompleted = (routine: Routine) => {
  return getRoutineDisplayCount(routine) >= routine.targetCount;
};

export const getRoutineCompletionTogglePatch = (routine: Routine): Partial<Routine> => {
  const nextCount = isRoutineCompleted(routine) ? 0 : routine.targetCount;

  if (routine.frequency === "daily") {
    return { currentCount: nextCount };
  }

  if (routine.frequency === "weekly") {
    return { weeklyCount: nextCount };
  }

  return { monthlyCount: nextCount };
};
