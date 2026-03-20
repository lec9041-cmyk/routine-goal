import { useEffect, useRef } from "react";
import { useData } from "../context/DataContext";

const CHECK_INTERVAL_MS = 30 * 1000;

const toTodayKey = (date: Date) => date.toISOString().slice(0, 10);

const shouldNotifyNow = (time: string, now: Date) => {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  return now.getHours() === hour && now.getMinutes() === minute;
};

export function ReminderManager() {
  const { todos, routines } = useData();
  const firedRef = useRef<Record<string, true>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const timer = window.setInterval(() => {
      if (Notification.permission !== "granted") {
        return;
      }

      const now = new Date();
      const todayKey = toTodayKey(now);

      todos.forEach((todo) => {
        if (!todo.notificationEnabled || !todo.time || todo.completed) {
          return;
        }

        const fireKey = `todo-${todo.id}-${todayKey}-${todo.time}`;
        if (firedRef.current[fireKey] || !shouldNotifyNow(todo.time, now)) {
          return;
        }

        new Notification("할일 알림", {
          body: `${todo.title} 할 시간입니다.`,
        });
        firedRef.current[fireKey] = true;
      });

      routines.forEach((routine) => {
        if (!routine.notificationEnabled || !routine.time) {
          return;
        }

        const fireKey = `routine-${routine.id}-${todayKey}-${routine.time}`;
        if (firedRef.current[fireKey] || !shouldNotifyNow(routine.time, now)) {
          return;
        }

        new Notification("루틴 알림", {
          body: `${routine.title} 루틴 시간입니다.`,
        });
        firedRef.current[fireKey] = true;
      });
    }, CHECK_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [todos, routines]);

  return null;
}
