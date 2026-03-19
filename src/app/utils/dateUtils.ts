export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateString = (date: Date): string => {
  return toDateKey(date);
};

export const isSameDay = (left: Date, right: Date): boolean => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const matchesDueDate = (dueDate: string | undefined, selectedDate: Date, today: Date): boolean => {
  if (!dueDate) {
    return false;
  }

  const selectedDateString = formatDateString(selectedDate);

  if (dueDate === "오늘") {
    return isSameDay(selectedDate, today);
  }

  if (dueDate === "내일") {
    return selectedDateString === formatDateString(addDays(today, 1));
  }

  if (dueDate.includes("-")) {
    return dueDate === selectedDateString;
  }

  return false;
};
