import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, Calendar as CalendarIcon, Bell, BellOff, X, Settings, MoreVertical, Pencil, Trash2, Check } from "lucide-react";
import { useData } from "../context/DataContext";
import type { Routine } from "../context/DataContext";
import { getRoutineCountForPeriod, isRoutineCompleted } from "../utils/routineProgress";
import { toDateKey } from "../utils/dateUtils";
import { ModalPortal } from "./common/ModalPortal";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'ai';

interface RoutineScreenProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
  shouldOpenAddModal?: boolean;
  hideHeader?: boolean;
}

type RoutineFormState = {
  title: string;
  icon: string;
  category: string;
  description: string;
  linkedGoalId: string;
  frequency: "daily" | "weekly" | "monthly";
  targetCount: string;
  time: string;
  notificationEnabled: boolean;
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
  color: string;
  repeatType: "forever" | "period";
  startDate: string;
  endDate: string;
  scheduleType: "count" | "specific";
  specificDays: number[];
};

const defaultFormState: RoutineFormState = {
  title: "",
  icon: "⭐",
  category: "건강",
  description: "",
  linkedGoalId: "",
  frequency: "daily",
  targetCount: "",
  time: "",
  notificationEnabled: false,
  timeOfDay: "anytime",
  color: "from-blue-100 to-blue-200",
  repeatType: "forever",
  startDate: "",
  endDate: "",
  scheduleType: "count",
  specificDays: [],
};

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

const getWeekDatesSundayToSaturday = (referenceDate: Date) => {
  const day = referenceDate.getDay();
  const sunday = new Date(referenceDate);
  sunday.setDate(referenceDate.getDate() - day);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return date;
  });
};

const getMonthDates = (referenceDate: Date) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));
};

const toRoutineFormState = (routine?: Routine): RoutineFormState => {
  if (!routine) {
    return defaultFormState;
  }

  return {
    title: routine.title,
    icon: routine.icon,
    category: routine.category ?? "건강",
    description: routine.description ?? "",
    linkedGoalId: routine.linkedGoalId ?? "",
    frequency: routine.frequency,
    targetCount: routine.targetCount ? String(routine.targetCount) : "",
    time: routine.time ?? "",
    notificationEnabled: Boolean(routine.notificationEnabled),
    timeOfDay: routine.timeOfDay ?? "anytime",
    color: routine.color,
    repeatType: routine.repeatType ?? "forever",
    startDate: routine.startDate ?? "",
    endDate: routine.endDate ?? "",
    scheduleType: routine.scheduleType ?? "count",
    specificDays: routine.specificDays ?? [],
  };
};

export function RoutineScreen({ onNavigate, shouldOpenAddModal, hideHeader }: RoutineScreenProps) {
  const { routines, goals, addRoutine, updateRoutine, deleteRoutine, toggleRoutineForDate } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [showRoutineMenu, setShowRoutineMenu] = useState<string | null>(null);
  const [quickRoutineTitle, setQuickRoutineTitle] = useState("");
  const [newRoutine, setNewRoutine] = useState<RoutineFormState>(defaultFormState);
  const [viewMode, setViewMode] = useState<"all" | "weekly" | "monthly">("all");
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [monthlyExpanded, setMonthlyExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (shouldOpenAddModal) {
      setEditingRoutineId(null);
      setNewRoutine(defaultFormState);
      setShowAddModal(true);
    }
  }, [shouldOpenAddModal]);

  useEffect(() => {
    if (!showAddModal) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const updateInset = () => {
      const inset = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));
      document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    };

    updateInset();
    viewport.addEventListener("resize", updateInset);
    window.addEventListener("focusin", handleFocusIn);

    return () => {
      viewport.removeEventListener("resize", updateInset);
      window.removeEventListener("focusin", handleFocusIn);
      document.documentElement.style.setProperty("--keyboard-inset", "0px");
    };
  }, [showAddModal]);

  const today = new Date();
  const todayKey = toDateKey(today);
  const referenceDate = new Date(`${selectedDateKey}T00:00:00`);
  const weekDates = useMemo(() => getWeekDatesSundayToSaturday(referenceDate), [referenceDate]);
  const thisWeekDates = useMemo(() => getWeekDatesSundayToSaturday(today), [todayKey]);
  const monthDates = useMemo(() => getMonthDates(referenceDate), [referenceDate]);

  const iconOptions = ["⭐", "💧", "💪", "🧘", "📚", "📖", "🏃", "🎨", "🎵", "🍎", "☕", "🌱", "✍️", "🧠", "❤️"];
  const categoryOptions = ["건강", "학습", "자기계발", "취미", "업무", "관계"];

  const openCreateModal = () => {
    setEditingRoutineId(null);
    setNewRoutine({ ...defaultFormState, title: quickRoutineTitle.trim() });
    setShowAddModal(true);
  };

  const openEditRoutineModal = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setNewRoutine(toRoutineFormState(routine));
    setShowAddModal(true);
  };

  const resetModal = () => {
    setShowAddModal(false);
    setEditingRoutineId(null);
    setNewRoutine(defaultFormState);
  };

  const handleSaveRoutine = () => {
    if (!newRoutine.title.trim()) return;
    const parsedTargetCount = Number.parseInt(newRoutine.targetCount, 10);
    if (Number.isNaN(parsedTargetCount) || parsedTargetCount <= 0) return;

    const payload: Partial<Routine> = {
      title: newRoutine.title.trim(),
      icon: newRoutine.icon,
      category: newRoutine.category,
      description: newRoutine.description,
      linkedGoalId: newRoutine.linkedGoalId || undefined,
      frequency: newRoutine.frequency,
      targetCount: parsedTargetCount,
      trackingType: "days",
      time: newRoutine.time || undefined,
      notificationEnabled: newRoutine.time ? newRoutine.notificationEnabled : false,
      timeOfDay: newRoutine.timeOfDay,
      color: newRoutine.color,
      repeatType: newRoutine.repeatType,
      startDate: newRoutine.startDate,
      endDate: newRoutine.endDate,
      scheduleType: newRoutine.scheduleType,
      specificDays: newRoutine.specificDays,
    };

    if (editingRoutineId) {
      updateRoutine(editingRoutineId, payload);
    } else {
      addRoutine({
        id: Date.now().toString(),
        currentCount: 0,
        completedDates: [],
        ...payload,
      } as Routine);
      setQuickRoutineTitle("");
    }

    resetModal();
  };

  const handleQuickAddRoutine = () => {
    const title = quickRoutineTitle.trim();
    if (!title) return;

    addRoutine({
      id: Date.now().toString(),
      title,
      icon: "⭐",
      category: "건강",
      frequency: "daily",
      targetCount: 1,
      currentCount: 0,
      trackingType: "days",
      color: "from-blue-100 to-blue-200",
      completedDates: [],
      scheduleType: "count",
      specificDays: [],
    });
    setQuickRoutineTitle("");
  };

  const renderFrequencyBadges = (routine: Routine) => {
    if (routine.frequency === "weekly") {
      return (
        <div className="flex gap-1.5 flex-wrap">
          {weekDates.map((date, idx) => {
            const dateKey = toDateKey(date);
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDateKey;
            const isCompleted = (routine.completedDates ?? []).includes(dateKey);

            return (
              <button
                key={dateKey}
                onClick={() => toggleRoutineForDate(routine.id, dateKey)}
                className={`w-9 h-9 rounded-full text-[11px] font-bold border transition-all flex items-center justify-center ${
                  isCompleted
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : isToday
                      ? "bg-white border-purple-400 text-purple-700"
                      : isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
                aria-label={`${routine.title} ${weekdayLabels[idx]}요일 체크`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : weekdayLabels[idx]}
              </button>
            );
          })}
        </div>
      );
    }

    if (routine.frequency === "monthly") {
      const expanded = monthlyExpanded[routine.id] ?? false;
      const visibleDates = expanded ? monthDates : thisWeekDates;
      return (
        <div className="space-y-2">
          <div className={`grid grid-cols-7 gap-1.5 ${expanded ? "max-h-44 overflow-y-auto pr-1" : ""}`}>
          {visibleDates.map((date) => {
            const dateKey = toDateKey(date);
            const dayNumber = date.getDate();
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDateKey;
            const isCompleted = (routine.completedDates ?? []).includes(dateKey);
            return (
              <button
                key={dateKey}
                onClick={() => toggleRoutineForDate(routine.id, dateKey)}
                className={`h-8 rounded-md text-[11px] font-semibold border transition-all ${
                  isCompleted
                    ? "bg-amber-500 text-white border-amber-500"
                    : isToday
                      ? "bg-white border-purple-400 text-purple-700"
                      : isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                {isCompleted ? "✓" : dayNumber}
              </button>
            );
          })}
        </div>
          <button
            onClick={() => setMonthlyExpanded((prev) => ({ ...prev, [routine.id]: !expanded }))}
            className="w-full py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[12px] font-medium hover:bg-gray-200 transition-colors"
          >
            {expanded ? "이번 주만 표시" : "전체 월 표시"}
          </button>
        </div>
      );
    }

    const isDoneToday = (routine.completedDates ?? []).includes(todayKey);

    return (
      <button
        onClick={() => toggleRoutineForDate(routine.id, todayKey)}
        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${
          isDoneToday ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
        }`}
      >
        {isDoneToday ? "오늘 완료 ✓" : "오늘 체크"}
      </button>
    );
  };

  const filteredRoutines = routines.filter((routine) => (viewMode === "all" ? true : routine.frequency === viewMode));

  return (
    <div className="min-h-full bg-transparent">
      {!hideHeader && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-5 pt-12 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">루틴</h1>
              <div className="w-9 h-9" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <button onClick={() => setViewMode("all")} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium ${viewMode === "all" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>전체</button>
              <button onClick={() => setViewMode("weekly")} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium ${viewMode === "weekly" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>📆 주간</button>
              <button onClick={() => setViewMode("monthly")} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium ${viewMode === "monthly" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>🗓️ 월간</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-5">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-3 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-[12px] font-medium">기준 날짜</span>
          </div>
          <input type="date" value={selectedDateKey} onChange={(e) => setSelectedDateKey(e.target.value || todayKey)} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px]" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-2 mb-5 flex items-center gap-2">
          <input
            type="text"
            value={quickRoutineTitle}
            onChange={(e) => setQuickRoutineTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleQuickAddRoutine();
              }
            }}
            placeholder="+ 루틴 입력..."
            className="flex-1 h-10 px-3 rounded-lg bg-white border border-gray-200 text-[14px]"
          />
          <button onClick={openCreateModal} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600" aria-label="상세 설정">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {filteredRoutines.map((routine) => {
            const completedCount = getRoutineCountForPeriod(routine, referenceDate);
            const progressPercent = Math.min(100, Math.max(0, Math.round((completedCount / routine.targetCount) * 100)));
            const overAchieved = Math.max(0, completedCount - routine.targetCount);
            const linkedGoal = routine.linkedGoalId ? goals.find((goal) => goal.id === routine.linkedGoalId) : null;

            return (
              <div key={routine.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900">{routine.icon} {routine.title}</p>
                    {linkedGoal && <p className="text-[11px] text-purple-600 mt-0.5">목표: {linkedGoal.title}</p>}
                    <p className="text-[11px] text-gray-500 mt-0.5">{routine.frequency === "weekly" ? "이번 주" : routine.frequency === "monthly" ? "이번 달" : "오늘"} {completedCount}/{routine.targetCount}</p>
                  </div>
                  <div className="relative">
                    <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center" onClick={() => setShowRoutineMenu(showRoutineMenu === routine.id ? null : routine.id)}>
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    {showRoutineMenu === routine.id && (
                      <div className="absolute top-9 right-0 bg-white border border-gray-100 rounded-xl shadow-lg p-1 z-30 min-w-[120px]">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center gap-2"
                          onClick={() => {
                            openEditRoutineModal(routine);
                            setShowRoutineMenu(null);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />수정
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                          onClick={() => {
                            if (confirm(`\"${routine.title}\" 루틴을 삭제하시겠습니까?`)) {
                              deleteRoutine(routine.id);
                            }
                            setShowRoutineMenu(null);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className={`bg-gradient-to-r ${routine.color} h-1.5 rounded-full`} style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold ${isRoutineCompleted(routine, referenceDate) ? "text-green-600" : "text-gray-500"}`}>
                    {isRoutineCompleted(routine, referenceDate) ? "목표 달성" : "진행 중"}
                  </span>
                  {overAchieved > 0 && <span className="text-[11px] font-semibold text-indigo-600">초과 달성 +{overAchieved}</span>}
                </div>

                {renderFrequencyBadges(routine)}
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <ModalPortal>
          <div className="modal-backdrop bg-black/30 backdrop-blur-sm flex items-end justify-center">
            <div className="modal-sheet bg-white rounded-t-3xl w-full max-w-md h-[min(90dvh,760px)] shadow-2xl animate-slide-up flex flex-col overflow-hidden">
              <div className="shrink-0 px-5 pt-4 pb-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{editingRoutineId ? "루틴 수정" : "새 루틴 추가"}</h2>
                <button onClick={resetModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-5 h-5 text-gray-600" /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ paddingBottom: "calc(1rem + var(--keyboard-inset, 0px))" }}>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">아이콘</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((icon) => (
                      <button key={icon} onClick={() => setNewRoutine({ ...newRoutine, icon })} className={`w-10 h-10 rounded-xl text-lg ${newRoutine.icon === icon ? "bg-purple-100 ring-2 ring-purple-400" : "bg-gray-100"}`}>{icon}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">루틴 이름</label>
                  <input type="text" value={newRoutine.title} onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px]" />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">설명/메모</label>
                  <textarea value={newRoutine.description} onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px]" />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">카테고리</label>
                  <div className="flex gap-2 flex-wrap">
                    {categoryOptions.map((category) => (
                      <button key={category} onClick={() => setNewRoutine({ ...newRoutine, category })} className={`px-3 py-1.5 rounded-lg text-[13px] ${newRoutine.category === category ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{category}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">연결 목표</label>
                  <select value={newRoutine.linkedGoalId} onChange={(e) => setNewRoutine({ ...newRoutine, linkedGoalId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px]">
                    <option value="">연결 안 함</option>
                    {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">빈도</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["daily", "weekly", "monthly"] as const).map((freq) => (
                      <button key={freq} onClick={() => setNewRoutine({ ...newRoutine, frequency: freq })} className={`px-3 py-2.5 rounded-xl text-[13px] ${newRoutine.frequency === freq ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{freq === "daily" ? "📅 일일" : freq === "weekly" ? "📆 주간" : "🗓️ 월간"}</button>
                    ))}
                  </div>
                </div>

                {(newRoutine.frequency === "weekly" || newRoutine.frequency === "monthly") && (
                  <>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 mb-2 block">목표 방식</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setNewRoutine({ ...newRoutine, scheduleType: "count", specificDays: [] })} className={`px-3 py-2 rounded-xl text-[13px] ${newRoutine.scheduleType === "count" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>횟수 기반</button>
                        <button onClick={() => setNewRoutine({ ...newRoutine, scheduleType: "specific" })} className={`px-3 py-2 rounded-xl text-[13px] ${newRoutine.scheduleType === "specific" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{newRoutine.frequency === "weekly" ? "요일 지정" : "날짜 지정"}</button>
                      </div>
                    </div>

                    {newRoutine.scheduleType === "specific" && (
                      <div>
                        <label className="text-[13px] font-medium text-gray-700 mb-2 block">{newRoutine.frequency === "weekly" ? "요일 설정" : "날짜 설정"}</label>
                        {newRoutine.frequency === "weekly" ? (
                          <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 0].map((day, idx) => (
                              <button
                                key={day}
                                onClick={() => {
                                  const values = newRoutine.specificDays.includes(day) ? newRoutine.specificDays.filter((v) => v !== day) : [...newRoutine.specificDays, day];
                                  setNewRoutine({ ...newRoutine, specificDays: values.sort((a, b) => a - b) });
                                }}
                                className={`w-10 h-10 rounded-full text-[13px] ${newRoutine.specificDays.includes(day) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}
                              >
                                {weekdayLabels[idx]}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                              <button
                                key={date}
                                onClick={() => {
                                  const values = newRoutine.specificDays.includes(date) ? newRoutine.specificDays.filter((v) => v !== date) : [...newRoutine.specificDays, date];
                                  setNewRoutine({ ...newRoutine, specificDays: values.sort((a, b) => a - b) });
                                }}
                                className={`h-8 rounded-lg text-[12px] ${newRoutine.specificDays.includes(date) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
                              >
                                {date}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">목표 횟수</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoutine.targetCount}
                    onChange={(e) => setNewRoutine({ ...newRoutine, targetCount: e.target.value.replace(/[^\d]/g, "") })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px]"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">알림 시간 (선택)</label>
                  <input type="time" value={newRoutine.time} onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value, notificationEnabled: e.target.value ? newRoutine.notificationEnabled : false })} className="w-full max-w-[13rem] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[13px]" />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">알림</label>
                  <button type="button" disabled={!newRoutine.time} onClick={() => setNewRoutine({ ...newRoutine, notificationEnabled: !newRoutine.notificationEnabled })} className={`w-full px-4 py-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 ${!newRoutine.time ? "bg-gray-100 text-gray-400 border-gray-200" : newRoutine.notificationEnabled ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {newRoutine.notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />} {newRoutine.notificationEnabled ? "알림 켜짐" : "알림 꺼짐"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["morning", "🌅 아침"],
                    ["afternoon", "☀️ 오후"],
                    ["evening", "🌙 저녁"],
                    ["anytime", "⏰ 언제든지"],
                  ] as const).map(([value, label]) => (
                    <button key={value} onClick={() => setNewRoutine({ ...newRoutine, timeOfDay: value })} className={`px-3 py-2 rounded-xl text-[13px] ${newRoutine.timeOfDay === value ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-white/95 px-5 pt-3 pb-[calc(14px+var(--safe-area-bottom)+var(--keyboard-inset))]">
                <div className="flex gap-3">
                  <button onClick={resetModal} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-[14px]">취소</button>
                  <button onClick={handleSaveRoutine} disabled={!newRoutine.title.trim() || !newRoutine.targetCount.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium text-[14px] disabled:opacity-50">{editingRoutineId ? "저장" : "추가하기"}</button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
