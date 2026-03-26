import { useEffect, useState } from "react";
import { CheckSquare, Target, Circle, CircleDashed, CheckCircle2, Plus, X, ChevronRight, ChevronLeft, Menu, Settings } from "lucide-react";
import { useData } from "../context/DataContext";
import {
  getRoutineDisplayCount,
  isRoutineCompleted,
} from "../utils/routineProgress";
import { isSameDay, matchesDueDate, toDateKey } from "../utils/dateUtils";

type ScreenId = 'home' | 'todos' | 'goals-routines';

interface MainDashboardProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
}

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const { todos, routines, goals, projects, toggleTodo, addTodo, toggleRoutineForDate } = useData();
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [quickAddError, setQuickAddError] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "todo" | "routine">("all");
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0); // 주 단위 오프셋

  useEffect(() => {
    if (!showQuickAdd) {
      setQuickAddError("");
      setIsQuickAdding(false);
      setQuickAddText("");
    }
  }, [showQuickAdd]);

  // 선택한 날짜의 할일 (완료/미완료 모두 포함)
  const selectedDateTodos = todos.filter((todo) => matchesDueDate(todo.dueDate, selectedDate, today));

  // 미완료 할일과 완료 할일 분리
  const incompleteTodos = selectedDateTodos.filter(t => !t.completed);
  const completedTodos = selectedDateTodos.filter(t => t.completed);
  const selectedDateRoutines = routines.map((routine) => {
    const completedCount = getRoutineDisplayCount(routine, selectedDate);
    const isCompleted = isRoutineCompleted(routine, selectedDate);
    const isDoneOnSelectedDate = (routine.completedDates ?? []).includes(toDateKey(selectedDate));

    return {
      ...routine,
      completedCount,
      isCompleted,
      isDoneOnSelectedDate,
    };
  });

  const selectedDayOfWeek = selectedDate.getDay();
  const selectedDayOfMonth = selectedDate.getDate();

  const isWeeklyCountingRoutine = (routine: (typeof selectedDateRoutines)[number]) =>
    routine.frequency === "weekly"
    && (routine.scheduleType === "count" || (routine.scheduleType !== "specific" && routine.trackingType === "count"));

  const isMonthlyCountingRoutine = (routine: (typeof selectedDateRoutines)[number]) =>
    routine.frequency === "monthly"
    && (routine.scheduleType === "count" || (routine.scheduleType !== "specific" && routine.trackingType === "count"));

  const getRoutineMatchInfo = (routine: (typeof selectedDateRoutines)[number]) => {
    if (routine.frequency === "daily") {
      return { matchesToday: true, reason: "daily routine (매일 실행)" };
    }

    if (isWeeklyCountingRoutine(routine)) {
      return { matchesToday: true, reason: "weekly count routine (주간 n회, 오늘 실행 가능)" };
    }

    if (isMonthlyCountingRoutine(routine)) {
      return { matchesToday: true, reason: "monthly count routine (월간 n회, 오늘 실행 가능)" };
    }

    if (routine.frequency === "weekly") {
      const isMatched = Boolean(routine.specificDays?.includes(selectedDayOfWeek));
      return {
        matchesToday: isMatched,
        reason: isMatched
          ? `weekly specific routine (요일 매칭: ${selectedDayOfWeek})`
          : `weekly specific routine filtered out (오늘 요일 ${selectedDayOfWeek} 미포함)`,
      };
    }

    if (routine.frequency === "monthly") {
      const isMatched = Boolean(routine.specificDays?.includes(selectedDayOfMonth));
      return {
        matchesToday: isMatched,
        reason: isMatched
          ? `monthly specific routine (날짜 매칭: ${selectedDayOfMonth})`
          : `monthly specific routine filtered out (오늘 날짜 ${selectedDayOfMonth} 미포함)`,
      };
    }

    return { matchesToday: false, reason: "unknown frequency" };
  };

  const routineMatchResults = selectedDateRoutines.map((routine) => ({
    routine,
    ...getRoutineMatchInfo(routine),
  }));

  const todayRoutines = routineMatchResults
    .filter((result) => result.matchesToday)
    .map((result) => result.routine);

  const weeklyCountRoutines = selectedDateRoutines.filter(isWeeklyCountingRoutine);
  const monthlyCountRoutines = selectedDateRoutines.filter(isMonthlyCountingRoutine);

  useEffect(() => {
    const selectedDateKey = toDateKey(selectedDate);
    console.group(`[MainDashboard][RoutineFilter] ${selectedDateKey} / filter=${activeFilter}`);
    console.log("before filter (selectedDateRoutines)", selectedDateRoutines);
    console.table(
      routineMatchResults.map(({ routine, matchesToday, reason }) => ({
        id: routine.id,
        title: routine.title,
        frequency: routine.frequency,
        scheduleType: routine.scheduleType,
        trackingType: routine.trackingType,
        specificDays: routine.specificDays?.join(",") ?? "-",
        matchesToday,
        reason,
      }))
    );
    console.log("after filter (todayRoutines)", todayRoutines);
    console.log("weeklyCountRoutines", weeklyCountRoutines);
    console.log("monthlyCountRoutines", monthlyCountRoutines);
    console.groupEnd();
  }, [activeFilter, monthlyCountRoutines, routineMatchResults, selectedDate, selectedDateRoutines, todayRoutines, weeklyCountRoutines]);

  const isRoutineDoneForSelectedDate = (routine: (typeof selectedDateRoutines)[number]) => routine.isDoneOnSelectedDate;

  const incompleteTodayRoutines = todayRoutines.filter(
    (routine) => !isRoutineDoneForSelectedDate(routine)
  );
  const completedTodayRoutines = todayRoutines.filter(
    (routine) => isRoutineDoneForSelectedDate(routine)
  );

  // 선택한 날짜가 오늘인지 확인
  const isSelectedToday = isSameDay(selectedDate, today);
  
  // 카테고리별 색상 매핑 (배경 포함)
  const categoryStyles: { [key: string]: { bg: string; text: string } } = {
    "업무": { bg: "bg-gradient-to-r from-blue-100 to-blue-200", text: "text-blue-700" },
    "개인": { bg: "bg-gradient-to-r from-purple-100 to-purple-200", text: "text-purple-700" },
    "학습": { bg: "bg-gradient-to-r from-green-100 to-green-200", text: "text-green-700" },
    "건강": { bg: "bg-gradient-to-r from-orange-100 to-orange-200", text: "text-orange-700" },
    "취미": { bg: "bg-gradient-to-r from-pink-100 to-pink-200", text: "text-pink-700" },
    "기타": { bg: "bg-gradient-to-r from-gray-100 to-gray-200", text: "text-gray-700" },
  };

  const getCategoryStyle = (category: string) => {
    return categoryStyles[category] || categoryStyles["기타"];
  };

  // 진행률 계산 (선택 날짜 기준 할일 + 루틴 통합)
  const totalTodos = selectedDateTodos.length;
  const completedTodosCount = completedTodos.length;
  const totalRoutines = todayRoutines.length;
  const completedRoutinesCount = todayRoutines.filter((routine) => isRoutineDoneForSelectedDate(routine)).length;
  const totalItems = totalTodos + totalRoutines;
  const completedItems = completedTodosCount + completedRoutinesCount;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const progressTitle = isSelectedToday
    ? "오늘 진행률"
    : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 진행률`;

  const handleQuickAdd = async () => {
    if (isQuickAdding) return;
    const trimmedTitle = quickAddText.trim();
    if (!trimmedTitle) {
      setShowQuickAdd(false);
      return;
    }
    
    setIsQuickAdding(true);
    setQuickAddError("");
    try {
      addTodo({
        id: Date.now().toString(),
        title: trimmedTitle,
        category: "업무",
        completed: false,
        priority: "medium",
        dueDate: "오늘",
        projectId: "",
      });
      setShowQuickAdd(false);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "좋은 아침";
    if (hour < 18) return "좋은 오후";
    return "좋은 저녁";
  };
  const surfaceCardClass = "bg-white/75 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm";
  const itemCardClass = "bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm";
  const filterChipBaseClass = "h-9 px-3.5 rounded-xl text-[12px] font-semibold transition-all";

  // 주간 날짜 생성 (weekOffset 적용)
  const getWeekDates = () => {
    const dates = [];
    const current = new Date(today);
    
    // weekOffset만큼 주를 이동
    current.setDate(current.getDate() + (weekOffset * 7));
    
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      date.setDate(diff + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // 이전 주로 이동
  const previousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  // 다음 주로 이동
  const nextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  // 오늘로 돌아가기
  const goToToday = () => {
    setWeekOffset(0);
    setSelectedDate(today);
  };

  const renderRoutineListItem = (routine: (typeof selectedDateRoutines)[number], tone: "purple" | "indigo" = "purple") => {
    const displayCount = routine.completedCount;
    const isCompleted = routine.isCompleted;
    const showDailyCompletionStyle = isRoutineDoneForSelectedDate(routine);
    const hasProgress = displayCount > 0;
    const overAchieved = Math.max(0, displayCount - routine.targetCount);
    const progressPercent = Math.min(100, Math.round((displayCount / routine.targetCount) * 100));
    const linkedGoal = routine.linkedGoalId
      ? goals.find((goal) => goal.id === routine.linkedGoalId)
      : null;

    return (
      <div
        key={routine.id}
        className={`${itemCardClass} ${showDailyCompletionStyle ? "opacity-70" : ""} ${hasProgress && !showDailyCompletionStyle ? "ring-1 ring-indigo-200/70 bg-indigo-50/40" : ""}`}
      >
        <button
          onClick={() =>
            toggleRoutineForDate(routine.id, toDateKey(selectedDate))
          }
          className="w-full flex items-center gap-2.5 p-2.5"
        >
          {showDailyCompletionStyle ? (
            <CheckCircle2 className={`w-4.5 h-4.5 flex-shrink-0 ${tone === "indigo" ? "text-indigo-500" : "text-purple-500"}`} />
          ) : hasProgress ? (
            <CircleDashed className={`w-4.5 h-4.5 flex-shrink-0 ${tone === "indigo" ? "text-indigo-400" : "text-purple-400"}`} />
          ) : (
            <Circle className="w-4.5 h-4.5 text-gray-300 flex-shrink-0" />
          )}
          <div className="flex-1 text-left min-w-0">
            {linkedGoal && (
              <p
                className={`text-[10px] leading-tight font-medium truncate mb-0.5 ${
                  showDailyCompletionStyle ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {linkedGoal.title}
              </p>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`text-[13px] leading-snug font-medium truncate ${
                    showDailyCompletionStyle ? "text-gray-400 line-through" : "text-gray-900"
                  }`}
                >
                  {routine.icon} {routine.title}
                </p>
                {showDailyCompletionStyle && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 mt-1 text-[10px] font-bold text-emerald-700">
                    오늘 완료!
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] leading-tight font-semibold flex-shrink-0 ${
                  showDailyCompletionStyle ? "text-gray-400" : hasProgress ? "text-indigo-600" : "text-gray-600"
                }`}
              >
                {displayCount}/{routine.targetCount}
              </span>
            </div>
            {overAchieved > 0 && (
              <p className="text-[10px] text-indigo-600 mt-1 font-semibold">초과 달성 +{overAchieved}</p>
            )}
            {routine.targetCount > 1 && (
              <div className="mt-1.5">
                <div className="w-full h-1.5 rounded-full bg-gray-200/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${tone === "indigo" ? "bg-indigo-500" : "bg-purple-500"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header - 간결하게 */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">{greeting()} 👋</h1>
            <p className="text-[12px] text-gray-600 mt-0.5">
              {today.getMonth() + 1}월 {today.getDate()}일 {['일', '월', '화', '수', '목', '금', '토'][today.getDay()]}요일
            </p>
          </div>
          <button
            onClick={() => setShowMenu(true)}
            className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Menu className="w-4.5 h-4.5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 주간 캘린더 - 더 컴팩트하게 */}
      <div className="px-4 mt-4">
        <div className={`${surfaceCardClass} p-3`}>
        <div className="flex gap-1.5 justify-between">
          {weekDates.map((date, index) => {
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, selectedDate);
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dayOfWeek = date.getDay();
            
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedDate(date);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : isToday
                    ? 'bg-white/70 text-blue-600 border border-blue-200/50'
                    : 'bg-white/50 text-gray-700'
                }`}
              >
                <span className={`text-[9px] font-semibold ${ 
                  isSelected ? 'text-white/70' : dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {dayNames[dayOfWeek]}
                </span>
                <span className={`text-[14px] font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            onClick={previousWeek}
            className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center hover:bg-white/90 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="text-[11px] text-gray-600 font-semibold hover:text-gray-800 transition-colors px-2"
          >
            오늘
          </button>
          <button
            onClick={nextWeek}
            className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center hover:bg-white/90 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="px-4 mt-4">
        <div className={`${surfaceCardClass} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-bold text-gray-800">{progressTitle}</h3>
            <span className="text-[16px] font-bold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-2">
            {completedItems} / {totalItems} 완료
          </p>
        </div>
      </div>

      {/* 선택한 날짜의 할일과 루틴 */}
      <div className="px-4 mt-4">
        <div className={`${surfaceCardClass} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-gray-900">
            {isSelectedToday ? "오늘 할일" : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
          </h2>
          <button
            onClick={() => onNavigate("todos")}
            className="flex items-center gap-0.5 text-[12px] text-blue-700 font-semibold"
          >
            전체
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`${filterChipBaseClass} ${
              activeFilter === "all"
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            통합
          </button>
          <button
            onClick={() => setActiveFilter("todo")}
            className={`${filterChipBaseClass} ${
              activeFilter === "todo"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            할일
          </button>
          <button
            onClick={() => setActiveFilter("routine")}
            className={`${filterChipBaseClass} ${
              activeFilter === "routine"
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            루틴
          </button>
        </div>

        <div className="space-y-1.5">
          {(activeFilter === "all" || activeFilter === "todo") && (
            <>
          {/* 할일 소제목 */}
          {incompleteTodos.length > 0 && (
            <h3 className="text-[12px] font-bold text-gray-600 mt-2 mb-1 px-1">할일</h3>
          )}

          {/* 미완료 할일 먼저 표시 */}
          {incompleteTodos.map((todo) => (
            <div
              key={todo.id}
              className={itemCardClass}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-full flex items-center gap-2.5 p-3"
              >
                <Circle className="w-4.5 h-4.5 text-gray-300 flex-shrink-0" />
                
                <div className="flex-1 text-left min-w-0">
                  {todo.projectId && (() => {
                    const project = projects.find((p) => p.id === todo.projectId);
                    if (!project) return null;

                    return (
                      <p className="text-[11px] text-gray-500 font-medium truncate mb-0.5">
                        목표 · {project.title}
                      </p>
                    );
                  })()}
                  <p className="text-[14px] leading-snug text-gray-900 font-medium">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${getCategoryStyle(todo.category).bg} ${getCategoryStyle(todo.category).text} text-[10px] font-bold mr-1`}>
                      {todo.category}
                    </span>
                    {todo.title}
                  </p>
                </div>

                {todo.time && (
                  <span className="flex-shrink-0 text-[11px] text-gray-600">
                    {todo.time}
                  </span>
                )}
              </button>
            </div>
          ))}

          {/* 완료한 할일 소제목 */}
          {completedTodos.length > 0 && (
            <h3 className="text-[12px] font-bold text-gray-500 mt-4 mb-1 px-1">완료</h3>
          )}

          {/* 완료한 할일 하단에 표시 */}
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`${itemCardClass} opacity-60`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-full flex items-center gap-2.5 p-3"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" />
                
                <div className="flex-1 text-left min-w-0">
                  {todo.projectId && (() => {
                    const project = projects.find((p) => p.id === todo.projectId);
                    if (!project) return null;

                    return (
                      <p className="text-[11px] text-gray-400 font-medium truncate mb-0.5 line-through">
                        목표 · {project.title}
                      </p>
                    );
                  })()}
                  <p className="text-[13.5px] leading-snug text-gray-400 line-through">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${getCategoryStyle(todo.category).bg} ${getCategoryStyle(todo.category).text} text-[10px] font-bold mr-1 opacity-70`}>
                      {todo.category}
                    </span>
                    {todo.title}
                  </p>
                </div>

                {todo.time && (
                  <span className="flex-shrink-0 text-[11px] text-gray-500">
                    {todo.time}
                  </span>
                )}
              </button>
            </div>
          ))}

          {/* 할일과 루틴이 모두 없을 때 */}
          {selectedDateTodos.length === 0 && activeFilter === "todo" && (
            <div className={`${itemCardClass} p-8 text-center`}>
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-[13px]">할일 없음</p>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="mt-3 text-blue-700 text-[13px] font-semibold"
              >
                할일 추가하기
              </button>
            </div>
          )}
            </>
          )}

          {(activeFilter === "all" || activeFilter === "routine") && (
            <>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[12px] font-bold text-gray-600">오늘 루틴</h3>
                <button
                  onClick={() => onNavigate("goals-routines")}
                  className="text-[11px] text-purple-700 font-semibold"
                >
                  루틴 관리
                </button>
              </div>

              {incompleteTodayRoutines.map((routine) => renderRoutineListItem(routine))}

              {completedTodayRoutines.length > 0 && (
                <h4 className="text-[11px] font-bold text-emerald-700 mt-2 px-1">오늘 완료한 루틴</h4>
              )}
              {completedTodayRoutines.map((routine) => renderRoutineListItem(routine))}

              {todayRoutines.length === 0 && weeklyCountRoutines.length === 0 && monthlyCountRoutines.length === 0 && activeFilter === "routine" && (
                <div className={`${itemCardClass} p-6 text-center`}>
                  <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-[13px]">오늘 할 루틴 없음</p>
                  <button
                    onClick={() => onNavigate("goals-routines")}
                    className="mt-3 text-purple-700 text-[13px] font-semibold"
                  >
                    루틴 추가하기
                  </button>
                </div>
              )}

              {(activeFilter === "all" || activeFilter === "routine") && (
                <>
                  <div className="flex items-center justify-between px-1 pt-2">
                    <h3 className="text-[12px] font-bold text-gray-600">이번주 루틴</h3>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {weeklyCountRoutines.length}개
                    </span>
                  </div>
                  {weeklyCountRoutines.length > 0 ? (
                    weeklyCountRoutines.map((routine) => renderRoutineListItem(routine, "indigo"))
                  ) : (
                    <p className="px-1 text-[11px] text-gray-500">이번주 카운팅 루틴이 없습니다.</p>
                  )}

                  <div className="flex items-center justify-between px-1 pt-2">
                    <h3 className="text-[12px] font-bold text-gray-600">이번달 루틴</h3>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {monthlyCountRoutines.length}개
                    </span>
                  </div>
                  {monthlyCountRoutines.length > 0 ? (
                    monthlyCountRoutines.map((routine) => renderRoutineListItem(routine, "indigo"))
                  ) : (
                    <p className="px-1 text-[11px] text-gray-500">이번달 카운팅 루틴이 없습니다.</p>
                  )}
                </>
              )}
            </>
          )}

          {activeFilter === "all" && totalItems === 0 && weeklyCountRoutines.length === 0 && monthlyCountRoutines.length === 0 && (
            <div className={`${itemCardClass} p-8 text-center`}>
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 text-[13px]">항목 없음</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-[calc(var(--app-bottom-space)+18px)] right-4 sm:right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Quick Add Inline */}
      {showQuickAdd && (
        <div className="fixed bottom-[calc(var(--app-bottom-space)+92px)] left-4 right-4 z-40 sm:left-auto sm:right-6 sm:w-[420px]">
          <div className={`${surfaceCardClass} p-3`}>
            <p className="text-[11px] text-gray-600 mb-2">빠른 할일 입력 (기본: 오늘/기본 카테고리/프로젝트 없음)</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickAddText}
                onChange={(e) => {
                  setQuickAddText(e.target.value);
                  if (quickAddError) setQuickAddError("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                onBlur={handleQuickAdd}
                placeholder="할일을 입력하세요..."
                autoFocus
                aria-invalid={Boolean(quickAddError)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-[14px]"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onNavigate("todos", { openAddModal: true })}
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                title="상세 설정"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            {quickAddError && <p className="text-[11px] text-red-500 mt-1">{quickAddError}</p>}
            </div>
          </div>
      )}

      {/* Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-gray-900">메뉴</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  onNavigate('goals-routines');
                }}
                className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
              >
                <Target className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">목표 설정</p>
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  onNavigate('todos');
                }}
                className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
              >
                <CheckSquare className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">할일 관리</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
