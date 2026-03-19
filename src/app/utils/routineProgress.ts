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
  const displayCount = getRoutineDisplayCount(routine);
  const nextCount = isRoutineCompleted(routine)
    ? Math.max(displayCount - 1, 0)
    : Math.min(displayCount + 1, routine.targetCount);

  if (routine.frequency === "daily") {
    return { currentCount: nextCount };
  }

  if (routine.frequency === "weekly") {
    return { weeklyCount: nextCount };
  }

  return { monthlyCount: nextCount };
};
