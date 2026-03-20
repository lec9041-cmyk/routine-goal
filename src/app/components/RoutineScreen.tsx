import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Plus,
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  Bell,
  BellOff,
  Minus,
  X,
  Trash2,
  Edit2,
  Settings,
} from "lucide-react";
import { useData } from "../context/DataContext";
import type { Routine } from "../context/DataContext";
import {
  getRoutineCountForPeriod,
  getRoutineDisplayCount,
  isRoutineCompleted,
} from "../utils/routineProgress";
import { toDateKey } from "../utils/dateUtils";
import { ModalPortal } from "./common/ModalPortal";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'ai';

interface RoutineScreenProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
  shouldOpenAddModal?: boolean;
  hideHeader?: boolean;
}

export function RoutineScreen({ onNavigate, shouldOpenAddModal, hideHeader }: RoutineScreenProps) {
  const { routines, addRoutine, deleteRoutine, toggleRoutineForDate } = useData();
  const allowPastDateEdit = false;
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickRoutineTitle, setQuickRoutineTitle] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [skipQuickAddOnBlur, setSkipQuickAddOnBlur] = useState(false);
  const [showRoutineMenu, setShowRoutineMenu] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  
  // shouldOpenAddModal이 true면 모달 열기
  useEffect(() => {
    if (shouldOpenAddModal) {
      setShowAddModal(true);
    }
  }, [shouldOpenAddModal]);

  const [newRoutine, setNewRoutine] = useState({
    title: "",
    icon: "⭐",
    category: "건강",
    frequency: "daily" as const,
    trackingType: "count" as const,
    targetCount: 1,
    time: "",
    notificationEnabled: false,
    timeOfDay: "anytime" as const,
    color: "from-blue-100 to-blue-200",
    repeatType: "forever" as const,
    startDate: "",
    endDate: "",
    scheduleType: "count" as const,
    specificDays: [] as number[],
  });

  const [viewMode, setViewMode] = useState<"all" | "weekly" | "monthly">("all");
  const contentContainerClass = "px-4";
  const today = new Date();
  const todayKey = toDateKey(today);
  const isSelectedDateToday = selectedDateKey === todayKey;
  const referenceDate = new Date(`${selectedDateKey}T00:00:00`);
  const isPastDate = selectedDateKey < todayKey;
  const isReadOnlyPastDate = !allowPastDateEdit && isPastDate;

  const iconOptions = ["⭐", "💧", "💪", "🧘", "📚", "📖", "🏃", "🎨", "🎵", "🍎", "☕", "🌱", "✍️", "🧠", "❤️"];
  const categoryOptions = ["건강", "학습", "자기계발", "취미", "업무", "관계"];
  const colorOptions = [
    { name: "파랑", value: "from-blue-100 to-blue-200", text: "text-blue-600" },
    { name: "보라", value: "from-purple-100 to-purple-200", text: "text-purple-600" },
    { name: "핑크", value: "from-pink-100 to-pink-200", text: "text-pink-600" },
    { name: "초록", value: "from-green-100 to-green-200", text: "text-green-600" },
    { name: "청록", value: "from-cyan-100 to-cyan-200", text: "text-cyan-600" },
    { name: "주황", value: "from-orange-100 to-orange-200", text: "text-orange-600" },
  ];
  const compactDateTimeFieldClass = "w-full max-w-[13rem] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent";

  const handleAddRoutine = () => {
    if (!newRoutine.title.trim()) return;

    const routine: Routine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      icon: newRoutine.icon,
      category: newRoutine.category,
      frequency: newRoutine.frequency,
      trackingType: newRoutine.trackingType,
      targetCount: newRoutine.targetCount,
      currentCount: 0,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      color: newRoutine.color,
      time: newRoutine.time || undefined,
      notificationEnabled: newRoutine.time ? newRoutine.notificationEnabled : false,
      timeOfDay: newRoutine.timeOfDay,
      repeatType: newRoutine.repeatType,
      startDate: newRoutine.startDate,
      endDate: newRoutine.endDate,
      scheduleType: newRoutine.scheduleType,
      specificDays: newRoutine.specificDays,
    };

    addRoutine(routine);
    setShowAddModal(false);
    setNewRoutine({
      title: "",
      icon: "⭐",
      category: "건강",
      frequency: "daily",
      trackingType: "count",
      targetCount: 1,
      time: "",
      notificationEnabled: false,
      timeOfDay: "anytime",
      color: "from-blue-100 to-blue-200",
      repeatType: "forever",
      startDate: "",
      endDate: "",
      scheduleType: "count",
      specificDays: [] as number[],
    });
  };

  const handleQuickAddRoutine = () => {
    if (isQuickAdding) return;
    const title = quickRoutineTitle.trim();
    if (!title) {
      setQuickRoutineTitle("");
      return;
    }

    setIsQuickAdding(true);
    try {
      addRoutine({
        id: Date.now().toString(),
        title,
        icon: "⭐",
        category: "건강",
        frequency: "daily",
        targetCount: 1,
        currentCount: 0,
        trackingType: "count",
        color: "from-blue-100 to-blue-200",
        completedDates: [],
      });
      setQuickRoutineTitle("");
    } finally {
      setIsQuickAdding(false);
    }
  };

  const openDetailRoutineModal = () => {
    setNewRoutine((prev) => ({
      ...prev,
      title: quickRoutineTitle.trim(),
      category: prev.category || "건강",
      frequency: prev.frequency || "daily",
      targetCount: prev.targetCount || 1,
    }));
    setShowAddModal(true);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    return (await Notification.requestPermission()) === "granted";
  };

  const getPeriodDateKeys = (routine: Routine, reference: Date) => {
    const keys: string[] = [];

    if (routine.frequency === "weekly") {
      const start = new Date(reference);
      start.setDate(reference.getDate() - reference.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        keys.push(toDateKey(date));
      }
      return keys;
    }

    if (routine.frequency === "monthly") {
      const year = reference.getFullYear();
      const month = reference.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        keys.push(toDateKey(new Date(year, month, day)));
      }
      return keys;
    }

    return [toDateKey(reference)];
  };

  const incrementPeriodRoutine = (routine: Routine) => {
    const candidateDate = getPeriodDateKeys(routine, referenceDate)
      .find((dateKey) => !routine.completedDates?.includes(dateKey));

    if (!candidateDate) return;
    toggleRoutineForDate(routine.id, candidateDate);
  };

  const decrementPeriodRoutine = (routine: Routine) => {
    const keysInPeriod = getPeriodDateKeys(routine, referenceDate);
    const completedInPeriod = (routine.completedDates || [])
      .filter((dateKey) => keysInPeriod.includes(dateKey))
      .sort((a, b) => b.localeCompare(a));

    if (completedInPeriod.length === 0) return;
    toggleRoutineForDate(routine.id, completedInPeriod[0]);
  };

  const filteredRoutines = routines.filter((routine) => {
    if (viewMode === "all") return true;
    return routine.frequency === viewMode;
  });

  const getTotalProgress = (routines: Routine[]) => {
    if (routines.length === 0) return 0;
    const totalCompleted = routines.reduce((sum, r) => {
      return sum + (isRoutineCompleted(r, referenceDate) ? 1 : 0);
    }, 0);
    return Math.round((totalCompleted / routines.length) * 100);
  };

  const completionRate = getTotalProgress(filteredRoutines);

  const frequencyIcons = {
    daily: "📅",
    weekly: "📆",
    monthly: "🗓️",
  };

  const groupedByFrequency = {
    daily: filteredRoutines.filter((r) => r.frequency === "daily"),
    weekly: filteredRoutines.filter((r) => r.frequency === "weekly"),
    monthly: filteredRoutines.filter((r) => r.frequency === "monthly"),
  };

  const FrequencySection = ({ title, routines, icon }: { title: string; routines: Routine[]; icon: string }) => {
    if (routines.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
          <span className="text-[12px] text-gray-400 font-normal">({routines.length})</span>
        </h3>
        <div className="space-y-2.5">
          {routines.map((routine) => {
            const isCompleted = isRoutineCompleted(routine, referenceDate);
            const displayCount = getRoutineDisplayCount(routine, referenceDate);
            const periodCount = getRoutineCountForPeriod(routine, referenceDate);
            const progressPercentage = (periodCount / routine.targetCount) * 100;

            return (
              <div
                key={routine.id}
                className="w-full box-border bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[16px]">{routine.icon}</span>
                      <h4 className="text-[14px] font-semibold text-gray-900">
                        {routine.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                        {routine.category}
                      </span>
                      {routine.time && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {routine.time}
                        </span>
                      )}
                      {routine.time && routine.notificationEnabled && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          알림 ON
                        </span>
                      )}
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                        {routine.frequency === "daily"
                          ? "오늘 카운트"
                          : routine.frequency === "weekly"
                            ? "이번주 카운트"
                            : "이번달 카운트"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-1.5">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`bg-gradient-to-r ${routine.color} rounded-full h-1.5 transition-all duration-300`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrementPeriodRoutine(routine)}
                          disabled={isReadOnlyPastDate || displayCount === 0}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label={`${routine.title} 카운트 감소`}
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="text-[12px] font-bold text-gray-700 min-w-[58px] text-center">
                          {displayCount}/{routine.targetCount}
                        </span>
                        <button
                          onClick={() => incrementPeriodRoutine(routine)}
                          disabled={isReadOnlyPastDate || displayCount >= routine.targetCount}
                          className="w-7 h-7 rounded-lg bg-purple-100 hover:bg-purple-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label={`${routine.title} 카운트 증가`}
                        >
                          <Plus className="w-3.5 h-3.5 text-purple-700" />
                        </button>
                      </div>
                      <span className={`text-[11px] font-semibold ${isCompleted ? "text-green-600" : "text-gray-500"}`}>
                        {isCompleted ? "목표 달성" : "진행 중"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-transparent">
      {/* Header */}
      {!hideHeader && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-5 pt-12 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => onNavigate('home')}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">루틴</h1>
              <div className="w-9 h-9" />
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  viewMode === "all"
                    ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  viewMode === "daily"
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                }`}
              >
                📅 일일
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  viewMode === "weekly"
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                }`}
              >
                📆 주간
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  viewMode === "monthly"
                    ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                }`}
              >
                🗓️ 월간
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Progress */}
      <div className={`${contentContainerClass} py-5`}>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[12px] font-medium">기준 날짜</span>
            </div>
            <input
              type="date"
              value={selectedDateKey}
              onChange={(e) => setSelectedDateKey(e.target.value || todayKey)}
              className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>
          {isReadOnlyPastDate && (
            <p className="text-[11px] text-amber-600 mt-2">
              과거 날짜는 읽기 전용입니다. 오늘({todayKey})만 체크를 수정할 수 있어요.
            </p>
          )}
          {allowPastDateEdit && isPastDate && (
            <p className="text-[11px] text-blue-600 mt-2">
              과거 날짜 수정이 허용되어 선택 날짜에도 체크/취소를 적용합니다.
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-purple-600 text-[12px] mb-1 font-medium">
                {viewMode === "all" && "전체 루틴"}
                {viewMode === "daily" && (isSelectedDateToday ? "오늘 루틴" : "선택한 날짜의 일일 루틴")}
                {viewMode === "weekly" && (isSelectedDateToday ? "이번 주 루틴" : "선택한 날짜 기준 주간 루틴")}
                {viewMode === "monthly" && (isSelectedDateToday ? "이번 달 루틴" : "선택한 날짜 기준 월간 루틴")}
              </p>
              <p className="text-purple-900 text-2xl font-bold">
                {filteredRoutines.length}개
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center">
              <span className="text-purple-700 font-bold text-lg">{completionRate}%</span>
            </div>
          </div>
          <div className="w-full bg-white/40 rounded-full h-2 mb-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-purple-700 text-[12px]">
            {completionRate > 0 ? "좋아요! 횟수를 채워가며 루틴을 관리해보세요 💪" : "주간/월간 루틴 카운트를 시작해보세요!"}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-2 mb-5">
          <div className="flex items-center gap-2">
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
              onBlur={() => {
                if (skipQuickAddOnBlur) {
                  setSkipQuickAddOnBlur(false);
                  return;
                }
                handleQuickAddRoutine();
              }}
              placeholder="+ 루틴 입력..."
              className="flex-1 h-10 px-3 rounded-lg bg-white border border-gray-200 focus:border-purple-500 focus:outline-none text-[14px]"
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setSkipQuickAddOnBlur(true);
              }}
              onClick={openDetailRoutineModal}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              title="상세 설정"
              aria-label="상세 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Routines by Frequency */}
        <FrequencySection title="일일 루틴" routines={groupedByFrequency.daily} icon={frequencyIcons.daily} />
        <FrequencySection title="주간 루틴" routines={groupedByFrequency.weekly} icon={frequencyIcons.weekly} />
        <FrequencySection title="월간 루틴" routines={groupedByFrequency.monthly} icon={frequencyIcons.monthly} />
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <ModalPortal>
          <div className="modal-backdrop bg-black/30 backdrop-blur-sm flex items-end justify-center">
            <div className="modal-sheet bg-white rounded-t-3xl w-full max-w-md h-[min(90dvh,760px)] shadow-2xl animate-slide-up flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 pt-4 pb-4 border-b border-gray-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">새 루틴 추가</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

              <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-5 py-4 overscroll-contain">
                {/* Icon Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">아이콘</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewRoutine({ ...newRoutine, icon })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                          newRoutine.icon === icon
                            ? "bg-purple-100 ring-2 ring-purple-400"
                            : "bg-gray-100 hover:bg-gray-150"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">루틴 이름</label>
                  <input
                    type="text"
                    value={newRoutine.title}
                    onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                    placeholder="예: 물 마시기"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">카테고리</label>
                  <div className="flex gap-2 flex-wrap">
                    {categoryOptions.map((category) => (
                      <button
                        key={category}
                        onClick={() => setNewRoutine({ ...newRoutine, category })}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                          newRoutine.category === category
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">빈도</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, frequency: "daily" })}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.frequency === "daily"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      📅 일일
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, frequency: "weekly" })}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.frequency === "weekly"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      📆 주간
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, frequency: "monthly" })}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.frequency === "monthly"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      🗓️ 월간
                    </button>
                  </div>
                </div>

                {/* Repeat Type Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">반복 기간</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, repeatType: "forever" })}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.repeatType === "forever"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      ♾️ 계속 반복
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, repeatType: "period" })}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.repeatType === "period"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      📅 기간 지정
                    </button>
                  </div>
                </div>

                {/* Date Range (if period selected) */}
                {newRoutine.repeatType === "period" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 mb-2 block">시작일</label>
                      <input
                        type="date"
                        value={newRoutine.startDate}
                        onChange={(e) => setNewRoutine({ ...newRoutine, startDate: e.target.value })}
                        className={compactDateTimeFieldClass}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 mb-2 block">종료일</label>
                      <input
                        type="date"
                        value={newRoutine.endDate}
                        onChange={(e) => setNewRoutine({ ...newRoutine, endDate: e.target.value })}
                        className={compactDateTimeFieldClass}
                      />
                    </div>
                  </div>
                )}

                {/* Schedule Type (Weekly & Monthly only) */}
                {(newRoutine.frequency === "weekly" || newRoutine.frequency === "monthly") && (
                  <>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 mb-2 block">스케줄 방식</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setNewRoutine({ ...newRoutine, scheduleType: "count", specificDays: [] })}
                          className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                            newRoutine.scheduleType === "count"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                          }`}
                        >
                          🔢 횟수만 지정
                        </button>
                        <button
                          onClick={() => setNewRoutine({ ...newRoutine, scheduleType: "specific" })}
                          className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                            newRoutine.scheduleType === "specific"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                          }`}
                        >
                          📍 {newRoutine.frequency === "weekly" ? "요일" : "날짜"} 지정
                        </button>
                      </div>
                    </div>

                    {/* Specific Days Selection (if specific selected) */}
                    {newRoutine.scheduleType === "specific" && (
                      <div>
                        <label className="text-[13px] font-medium text-gray-700 mb-2 block">
                          {newRoutine.frequency === "weekly" ? "반복 요일" : "반복 날짜"}
                        </label>
                        {newRoutine.frequency === "weekly" ? (
                          <div className="flex gap-2 flex-wrap">
                            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  const days = newRoutine.specificDays || [];
                                  const newDays = days.includes(index)
                                    ? days.filter(d => d !== index)
                                    : [...days, index].sort((a, b) => a - b);
                                  setNewRoutine({ ...newRoutine, specificDays: newDays });
                                }}
                                className={`w-10 h-10 rounded-full text-[13px] font-medium transition-all ${
                                  newRoutine.specificDays?.includes(index)
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <button
                                key={day}
                                onClick={() => {
                                  const days = newRoutine.specificDays || [];
                                  const newDays = days.includes(day)
                                    ? days.filter(d => d !== day)
                                    : [...days, day].sort((a, b) => a - b);
                                  setNewRoutine({ ...newRoutine, specificDays: newDays });
                                }}
                                className={`h-9 rounded-lg text-[12px] font-medium transition-all ${
                                  newRoutine.specificDays?.includes(day)
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Target Count (only show if count type or daily) */}
                {(newRoutine.frequency === "daily" || newRoutine.scheduleType === "count") && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-2 block">
                      목표 횟수 ({newRoutine.frequency === "daily" ? "하루" : newRoutine.frequency === "weekly" ? "주" : "월"})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRoutine.targetCount}
                      onChange={(e) => setNewRoutine({ ...newRoutine, targetCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">알림 시간 (선택)</label>
                  <input
                    type="time"
                    value={newRoutine.time}
                    onChange={(e) =>
                      setNewRoutine({
                        ...newRoutine,
                        time: e.target.value,
                        notificationEnabled: e.target.value ? newRoutine.notificationEnabled : false,
                      })
                    }
                    className={compactDateTimeFieldClass}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">알림</label>
                  <button
                    type="button"
                    disabled={!newRoutine.time}
                    onClick={async () => {
                      if (!newRoutine.time) return;
                      if (!newRoutine.notificationEnabled) {
                        const granted = await requestNotificationPermission();
                        if (!granted) return;
                      }
                      setNewRoutine({ ...newRoutine, notificationEnabled: !newRoutine.notificationEnabled });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
                      !newRoutine.time
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : newRoutine.notificationEnabled
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {newRoutine.notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    {newRoutine.notificationEnabled ? "알림 켜짐" : "알림 꺼짐 (기본)"}
                  </button>
                  {!newRoutine.time && (
                    <p className="text-[11px] text-gray-400 mt-1">시간을 설정한 루틴만 알림을 켤 수 있어요.</p>
                  )}
                </div>

                {/* Time of Day */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">시간대</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, timeOfDay: "morning" })}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.timeOfDay === "morning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      🌅 아침
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, timeOfDay: "afternoon" })}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.timeOfDay === "afternoon"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      ☀️ 오후
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, timeOfDay: "evening" })}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.timeOfDay === "evening"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      🌙 저녁
                    </button>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, timeOfDay: "anytime" })}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        newRoutine.timeOfDay === "anytime"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                      }`}
                    >
                      ⏰ 언제든지
                    </button>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">색상</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewRoutine({ ...newRoutine, color: color.value })}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.value} transition-all ${
                          newRoutine.color === color.value
                            ? "ring-2 ring-purple-400 scale-110"
                            : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 border-t border-gray-100 bg-white/95 backdrop-blur px-5 pt-3 pb-[calc(14px+var(--safe-area-bottom)+var(--keyboard-inset))]">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-[14px] hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddRoutine}
                  disabled={!newRoutine.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium text-[14px] hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가하기
                </button>
              </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
