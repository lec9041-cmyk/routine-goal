import { useState } from "react";
import { CheckSquare, Target, Calendar as CalendarIcon, Circle, CheckCircle2, Plus, X, ChevronRight, ChevronLeft, Menu, Folder } from "lucide-react";
import { useData } from "../context/DataContext";
import {
  getRoutineDisplayCount,
  isRoutineCompleted,
} from "../utils/routineProgress";
import { formatDateString, isSameDay, matchesDueDate, toDateKey } from "../utils/dateUtils";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar';

interface MainDashboardProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean; date?: Date }) => void;
}

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const { todos, routines, projects, toggleTodo, addTodo, toggleRoutineForDate } = useData();
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "todo" | "routine">("all");
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0); // 주 단위 오프셋

  const selectedDateString = formatDateString(selectedDate);

  // 선택한 날짜의 할일 (완료/미완료 모두 포함)
  const selectedDateTodos = todos.filter((todo) => matchesDueDate(todo.dueDate, selectedDate, today));

  // 미완료 할일과 완료 할일 분리
  const incompleteTodos = selectedDateTodos.filter(t => !t.completed);
  const completedTodos = selectedDateTodos.filter(t => t.completed);
  const selectedDateRoutines = routines.map((routine) => {
    const completedCount = getRoutineDisplayCount(routine, selectedDate);
    const isCompleted = isRoutineCompleted(routine, selectedDate);

    return {
      ...routine,
      completedCount,
      isCompleted,
    };
  });

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
  const totalRoutines = selectedDateRoutines.length;
  const completedRoutinesCount = selectedDateRoutines.filter((routine) => routine.isCompleted).length;
  const totalItems = totalTodos + totalRoutines;
  const completedItems = completedTodosCount + completedRoutinesCount;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const progressTitle = isSelectedToday
    ? "오늘 진행률"
    : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 진행률`;

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    
    addTodo({
      id: Date.now().toString(),
      title: quickAddText,
      category: "개인",
      completed: false,
      priority: "medium",
      dueDate: selectedDateString, // 선택한 날짜로 할일 추가
    });
    
    setQuickAddText("");
    setShowQuickAdd(false);
  };

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "좋은 아침";
    if (hour < 18) return "좋은 오후";
    return "좋은 저녁";
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header - 간결하게 */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">{greeting()} 👋</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
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
      <div className="px-3 pb-3">
        <div className="flex gap-1 justify-between">
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
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all ${
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
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <button
            onClick={previousWeek}
            className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="text-[10px] text-gray-500 font-semibold hover:text-gray-700 transition-colors px-2"
          >
            오늘
          </button>
          <button
            onClick={nextWeek}
            className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="px-4 pb-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[13px] font-bold text-gray-700">{progressTitle}</h3>
            <span className="text-[16px] font-bold text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            {completedItems} / {totalItems} 완료
          </p>
        </div>
      </div>

      {/* 선택한 날짜의 할일과 루틴 */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-bold text-gray-900">
            {isSelectedToday ? "오늘 할일" : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
          </h2>
          <button
            onClick={() => onNavigate("todos")}
            className="flex items-center gap-0.5 text-[12px] text-blue-600 font-semibold"
          >
            전체
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-indigo-500 text-white"
                : "bg-white/70 text-gray-600"
            }`}
          >
            통합
          </button>
          <button
            onClick={() => setActiveFilter("todo")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              activeFilter === "todo"
                ? "bg-blue-500 text-white"
                : "bg-white/70 text-gray-600"
            }`}
          >
            할일
          </button>
          <button
            onClick={() => setActiveFilter("routine")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              activeFilter === "routine"
                ? "bg-purple-500 text-white"
                : "bg-white/70 text-gray-600"
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
            <h3 className="text-[12px] font-bold text-gray-500 mt-2 mb-1 px-1">할일</h3>
          )}

          {/* 미완료 할일 먼저 표시 */}
          {incompleteTodos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-full flex items-center gap-2.5 p-2.5"
              >
                <Circle className="w-4.5 h-4.5 text-gray-300 flex-shrink-0" />
                
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13.5px] leading-snug text-gray-900 font-medium">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${getCategoryStyle(todo.category).bg} ${getCategoryStyle(todo.category).text} text-[10px] font-bold mr-1`}>
                      {todo.category}
                    </span>
                    {todo.title}
                  </p>
                  {todo.projectId && (() => {
                    const project = projects.find(p => p.id === todo.projectId);
                    if (project) {
                      return (
                        <span className={`inline-flex mt-1 text-[10px] text-gray-700 px-1.5 py-0.5 rounded-md font-semibold items-center gap-0.5 ${project.color}`}>
                          <Folder className="w-2.5 h-2.5" />
                          {project.title}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {todo.time && (
                  <span className="flex-shrink-0 text-[11px] text-gray-500">
                    {todo.time}
                  </span>
                )}
              </button>
            </div>
          ))}

          {/* 완료한 할일 소제목 */}
          {completedTodos.length > 0 && (
            <h3 className="text-[12px] font-bold text-gray-400 mt-4 mb-1 px-1">완료</h3>
          )}

          {/* 완료한 할일 하단에 표시 */}
          {completedTodos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm opacity-60"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="w-full flex items-center gap-2.5 p-2.5"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" />
                
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13.5px] leading-snug text-gray-400 line-through">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${getCategoryStyle(todo.category).bg} ${getCategoryStyle(todo.category).text} text-[10px] font-bold mr-1 opacity-70`}>
                      {todo.category}
                    </span>
                    {todo.title}
                  </p>
                  {todo.projectId && (() => {
                    const project = projects.find(p => p.id === todo.projectId);
                    if (project) {
                      return (
                        <span className={`inline-flex mt-1 text-[10px] text-gray-700 px-1.5 py-0.5 rounded-md font-semibold items-center gap-0.5 opacity-70 ${project.color}`}>
                          <Folder className="w-2.5 h-2.5" />
                          {project.title}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>

                {todo.time && (
                  <span className="flex-shrink-0 text-[11px] text-gray-400">
                    {todo.time}
                  </span>
                )}
              </button>
            </div>
          ))}

          {/* 할일과 루틴이 모두 없을 때 */}
          {selectedDateTodos.length === 0 && activeFilter === "todo" && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-[13px]">할일 없음</p>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="mt-3 text-blue-600 text-[13px] font-semibold"
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
                <h3 className="text-[12px] font-bold text-gray-500">루틴</h3>
                <button
                  onClick={() => onNavigate("goals-routines")}
                  className="text-[11px] text-purple-600 font-semibold"
                >
                  전체 보기
                </button>
              </div>

              {selectedDateRoutines.map((routine) => {
                const displayCount = routine.completedCount;
                const isCompleted = routine.isCompleted;

                return (
                  <div
                    key={routine.id}
                    className={`bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm ${
                      isCompleted ? "opacity-70" : ""
                    }`}
                  >
                    <button
                      onClick={() =>
                        toggleRoutineForDate(routine.id, toDateKey(selectedDate))
                      }
                      className="w-full flex items-center gap-2.5 p-2.5"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-purple-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-gray-300 flex-shrink-0" />
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p
                          className={`text-[13.5px] leading-snug font-medium ${
                            isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                          }`}
                        >
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-[10px] font-bold mr-1">
                            {routine.frequency === "daily"
                              ? "daily"
                              : routine.frequency === "weekly"
                              ? "weekly"
                              : "monthly"}
                          </span>
                          {routine.icon} {routine.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {displayCount} / {routine.targetCount}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}

              {selectedDateRoutines.length === 0 && activeFilter === "routine" && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-[13px]">루틴 없음</p>
                  <button
                    onClick={() => onNavigate("goals-routines")}
                    className="mt-3 text-purple-600 text-[13px] font-semibold"
                  >
                    루틴 추가하기
                  </button>
                </div>
              )}
            </>
          )}

          {activeFilter === "all" && totalItems === 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-[13px]">항목 없음</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-[calc(var(--app-bottom-space)+12px)] right-4 sm:right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-gray-900">할일 추가</h2>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mb-3">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일에 추가됩니다
            </p>
            <input
              type="text"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
              placeholder="할일을 입력하세요..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[15px] mb-4"
            />
            <button
              onClick={handleQuickAdd}
              disabled={!quickAddText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가하기
            </button>
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
                  onNavigate('calendar');
                }}
                className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
              >
                <CalendarIcon className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">캘린더</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
