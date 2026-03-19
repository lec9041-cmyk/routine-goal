import { useState, useEffect } from "react";
import { CheckSquare, Target, Calendar as CalendarIcon, Circle, CheckCircle2, Flame, Menu, X, User, Settings, Bell, LogOut, Palette, Plus, ChevronRight, Clock, ChevronDown, ChevronUp } from "lucide-react";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar';

interface MainDashboardProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean; date?: Date }) => void;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Todo {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  subtasks?: SubTask[];
}

interface Routine {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  category: string;
  goalId?: string;
  goalColor?: string;
}

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'default';
  });

  // 오늘의 할일 (서브태스크 포함)
  const [todos, setTodos] = useState<Todo[]>([
    { 
      id: "1", 
      title: "프로젝트 기획서 작성", 
      time: "10:00", 
      completed: false,
      subtasks: [
        { id: "1-1", title: "목차 정리", completed: true },
        { id: "1-2", title: "내용 작성", completed: false },
        { id: "1-3", title: "검토 및 수정", completed: false },
      ]
    },
    { 
      id: "2", 
      title: "디자인 리뷰 미팅", 
      time: "14:00", 
      completed: false,
      subtasks: [
        { id: "2-1", title: "자료 준비", completed: true },
        { id: "2-2", title: "발표", completed: false },
      ]
    },
    { 
      id: "3", 
      title: "운동하기", 
      time: "18:00", 
      completed: true,
      subtasks: []
    },
    { 
      id: "4", 
      title: "장보기", 
      completed: false,
      subtasks: [
        { id: "4-1", title: "채소", completed: false },
        { id: "4-2", title: "과일", completed: false },
        { id: "4-3", title: "우유", completed: false },
      ]
    },
  ]);

  // 오늘의 루틴 (카테고리별)
  const [routines, setRoutines] = useState<Routine[]>([
    // 건강 카테고리
    { id: "1", title: "아침 명상 10분", completed: true, streak: 18, category: "건강", goalId: "goal1", goalColor: "green" },
    { id: "2", title: "운동 30분", completed: true, streak: 8, category: "건강", goalId: "goal1", goalColor: "green" },
    { id: "3", title: "물 2L 마시기", completed: false, streak: 15, category: "건강", goalId: "goal1", goalColor: "green" },
    
    // 학습 카테고리
    { id: "4", title: "영어 공부 30분", completed: false, streak: 12, category: "학습", goalId: "goal2", goalColor: "blue" },
    { id: "5", title: "독서 30분", completed: false, streak: 7, category: "학습", goalId: "goal3", goalColor: "purple" },
    
    // 생산성 카테고리
    { id: "6", title: "일일 계획 세우기", completed: true, streak: 22, category: "생산성" },
    { id: "7", title: "정리 정돈 10분", completed: false, streak: 5, category: "생산성" },
  ]);

  // 루틴 카테고리별 그룹화
  const routinesByCategory = routines.reduce((acc, routine) => {
    if (!acc[routine.category]) {
      acc[routine.category] = [];
    }
    acc[routine.category].push(routine);
    return acc;
  }, {} as Record<string, Routine[]>);

  // 카테고리별 아이콘 및 색상
  const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
    "건강": { icon: "💪", color: "text-green-700", bgColor: "bg-green-50" },
    "학습": { icon: "📚", color: "text-blue-700", bgColor: "bg-blue-50" },
    "생산성": { icon: "⚡", color: "text-purple-700", bgColor: "bg-purple-50" },
    "취미": { icon: "🎨", color: "text-pink-700", bgColor: "bg-pink-50" },
  };

  const completedTodos = todos.filter(t => t.completed).length;
  const completedRoutines = routines.filter(r => r.completed).length;
  const totalProgress = Math.round(((completedTodos + completedRoutines) / (todos.length + routines.length)) * 100);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleSubTask = (todoId: string, subtaskId: string) => {
    setTodos(todos.map(t => {
      if (t.id === todoId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    }));
  };

  const toggleRoutine = (id: string) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const toggleTodoExpand = (id: string) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTodos(newExpanded);
  };

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: quickAddText,
      completed: false,
      subtasks: [],
    };
    setTodos([...todos, newTodo]);
    setQuickAddText("");
    setShowQuickAdd(false);
  };

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 18) return "좋은 오후에요";
    return "좋은 저녁이에요";
  };

  // 테마
  const themes = [
    { 
      id: 'default', 
      name: '파스텔 블루', 
      bg: 'from-blue-50 via-purple-50 to-pink-50',
    },
    { 
      id: 'green', 
      name: '민트 그린', 
      bg: 'from-green-50 via-teal-50 to-cyan-50',
    },
    { 
      id: 'purple', 
      name: '라벤더', 
      bg: 'from-purple-50 via-pink-50 to-rose-50',
    },
    { 
      id: 'warm', 
      name: '따뜻한 오렌지', 
      bg: 'from-orange-50 via-amber-50 to-yellow-50',
    },
    { 
      id: 'cool', 
      name: '쿨 블루', 
      bg: 'from-cyan-50 via-blue-50 to-indigo-50',
    },
    { 
      id: 'monochrome', 
      name: '모노크롬', 
      bg: 'from-gray-50 via-slate-50 to-gray-100',
    },
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('appTheme', themeId);
  };

  // 주간 날짜 생성
  const getWeekDates = () => {
    const dates = [];
    const current = new Date(selectedDate);
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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} pb-24`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-[28px] font-bold text-gray-900">{greeting()} 👋</h1>
          </div>
          <button
            onClick={() => setShowMenu(true)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 주간 날짜 선택 (가로 스크롤) */}
      <div className="px-6 pb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white/60 shadow-sm overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-blue-500 text-white shadow-md scale-105' 
                      : isToday
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-transparent text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <span className={`text-[11px] font-medium ${
                    isSelected ? 'text-white' : index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {dayNames[index]}
                  </span>
                  <span className={`text-[18px] font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </span>
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 오늘의 진행률 */}
      <div className="px-6 pb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-gray-900">오늘 진행률</h2>
            <span className="text-[28px] font-bold text-blue-600">{totalProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-3 transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${totalProgress}%` }}
            >
              {totalProgress > 10 && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[13px] text-gray-600">
            <span>할일 {completedTodos}/{todos.length}</span>
            <span>•</span>
            <span>루틴 {completedRoutines}/{routines.length}</span>
          </div>
        </div>
      </div>

      {/* 오늘 할일 (3~4개 미리보기) */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-bold text-gray-900">오늘 할일</h2>
          <button
            onClick={() => onNavigate("todos")}
            className="flex items-center gap-1 text-[14px] text-blue-600 font-medium hover:text-blue-700"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/60 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">오늘 할일이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.slice(0, 4).map((todo) => {
              const isExpanded = expandedTodos.has(todo.id);
              const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
              const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
              const totalSubtasks = todo.subtasks?.length || 0;

              return (
                <div
                  key={todo.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] ${todo.completed ? "text-gray-400 line-through" : "text-gray-900 font-medium"}`}>
                        {todo.title}
                      </p>
                      {todo.time && (
                        <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span className="text-[12px]">{todo.time}</span>
                        </div>
                      )}
                    </div>

                    {hasSubtasks && (
                      <button
                        onClick={() => toggleTodoExpand(todo.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0"
                      >
                        <span className="text-[12px] font-semibold text-blue-700">
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* 서브태스크 */}
                  {hasSubtasks && isExpanded && (
                    <div className="px-3 pb-3 space-y-1">
                      {todo.subtasks!.map((subtask) => (
                        <button
                          key={subtask.id}
                          onClick={() => toggleSubTask(todo.id, subtask.id)}
                          className="w-full flex items-center gap-2 pl-9 pr-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <p className={`text-[13px] text-left ${subtask.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                            {subtask.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 오늘 루틴 (카테고리별 그룹화) */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-bold text-gray-900">오늘 루틴</h2>
          <button
            onClick={() => onNavigate("goals-routines")}
            className="flex items-center gap-1 text-[14px] text-orange-600 font-medium hover:text-orange-700"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(routinesByCategory).map(([category, categoryRoutines]) => {
            const config = categoryConfig[category] || { icon: "📌", color: "text-gray-700", bgColor: "bg-gray-50" };
            const completedCount = categoryRoutines.filter(r => r.completed).length;

            return (
              <div key={category} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm overflow-hidden">
                {/* 카테고리 헤더 */}
                <div className={`${config.bgColor} px-4 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">{config.icon}</span>
                    <h3 className={`text-[15px] font-bold ${config.color}`}>{category}</h3>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600">
                    {completedCount}/{categoryRoutines.length}
                  </span>
                </div>

                {/* 루틴 목록 */}
                <div className="p-2 space-y-1">
                  {categoryRoutines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={() => toggleRoutine(routine.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {routine.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <p className={`text-[14px] flex-1 text-left ${routine.completed ? "text-gray-400 line-through" : "text-gray-900 font-medium"}`}>
                        {routine.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-[13px] text-orange-600 font-semibold">{routine.streak}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-gray-900">빠른 추가</h2>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
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
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
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
              <button className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                <User className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">프로필</p>
              </button>
              <button
                onClick={() => { setShowMenu(false); setShowSettings(true); }}
                className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">테마 설정</p>
              </button>
              <button className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                <Bell className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">알림</p>
              </button>
              <button className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-all text-left">
                <LogOut className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">로그아웃</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-gray-900">테마 설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <p className="text-[15px] font-medium text-gray-900">색상 테마</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${theme.bg} flex items-center justify-center shadow-md hover:shadow-lg transition-all ${selectedTheme === theme.id ? 'ring-4 ring-blue-400 scale-105' : ''}`}
                  >
                    <span className="text-2xl">✓</span>
                  </button>
                ))}
              </div>
              <p className="text-[13px] text-gray-500 text-center mt-3">{themes.find(t => t.id === selectedTheme)?.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
