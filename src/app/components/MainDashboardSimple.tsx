import { useState, useEffect } from "react";
import { CheckSquare, Target, Calendar as CalendarIcon, Circle, CheckCircle2, Flame, Menu, X, User, Settings, Bell, LogOut, Palette, Plus, ChevronRight, Clock } from "lucide-react";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar';

interface MainDashboardProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean; date?: Date }) => void;
}

interface Todo {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
}

interface Routine {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
}

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'default';
  });

  // 오늘의 할일
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", title: "프로젝트 기획서 작성", time: "10:00", completed: false },
    { id: "2", title: "디자인 리뷰 미팅", time: "14:00", completed: false },
    { id: "3", title: "운동하기", time: "18:00", completed: true },
  ]);

  // 오늘의 루틴
  const [routines, setRoutines] = useState<Routine[]>([
    { id: "1", title: "아침 명상 10분", completed: true, streak: 18 },
    { id: "2", title: "영어 공부 30분", completed: false, streak: 12 },
    { id: "3", title: "운동 30분", completed: true, streak: 8 },
    { id: "4", title: "물 2L 마시기", completed: false, streak: 15 },
  ]);

  const completedTodos = todos.filter(t => t.completed).length;
  const completedRoutines = routines.filter(r => r.completed).length;
  const totalProgress = Math.round(((completedTodos + completedRoutines) / (todos.length + routines.length)) * 100);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleRoutine = (id: string) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: quickAddText,
      completed: false,
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

  const dateString = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 테마
  const themes = [
    { 
      id: 'default', 
      name: '파스텔 블루', 
      bg: 'from-blue-50 via-purple-50 to-pink-50',
      primary: 'blue',
      card: 'bg-white/80',
    },
    { 
      id: 'green', 
      name: '민트 그린', 
      bg: 'from-green-50 via-teal-50 to-cyan-50',
      primary: 'green',
      card: 'bg-white/80',
    },
    { 
      id: 'purple', 
      name: '라벤더', 
      bg: 'from-purple-50 via-pink-50 to-rose-50',
      primary: 'purple',
      card: 'bg-white/80',
    },
    { 
      id: 'warm', 
      name: '따뜻한 오렌지', 
      bg: 'from-orange-50 via-amber-50 to-yellow-50',
      primary: 'orange',
      card: 'bg-white/80',
    },
    { 
      id: 'cool', 
      name: '쿨 블루', 
      bg: 'from-cyan-50 via-blue-50 to-indigo-50',
      primary: 'cyan',
      card: 'bg-white/80',
    },
    { 
      id: 'monochrome', 
      name: '모노크롬', 
      bg: 'from-gray-50 via-slate-50 to-gray-100',
      primary: 'gray',
      card: 'bg-white/80',
    },
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('appTheme', themeId);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} pb-24`}>
      {/* Header - 매우 심플하게 */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <p className="text-[15px] text-gray-600 mb-1">{dateString}</p>
            <h1 className="text-[28px] font-bold text-gray-900">{greeting()} 👋</h1>
          </div>
          <button
            onClick={() => setShowMenu(true)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* 오늘의 진행률 - 심플하고 강조 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-semibold text-gray-900">오늘의 진행률</p>
            <p className="text-[32px] font-bold text-blue-600">{totalProgress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-3 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-[13px] text-gray-600">
            <span>할일 {completedTodos}/{todos.length}</span>
            <span>•</span>
            <span>루틴 {completedRoutines}/{routines.length}</span>
          </div>
        </div>
      </div>

      {/* 오늘 할일 */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-bold text-gray-900">오늘 할일</h2>
          <button
            onClick={() => onNavigate("todos")}
            className="flex items-center gap-1 text-[14px] text-blue-600 font-medium"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/60 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-[14px]">오늘 할일이 없습니다</p>
            <p className="text-gray-400 text-[12px] mt-1">+ 버튼을 눌러 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.slice(0, 5).map((todo) => (
              <button
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all"
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <p className={`text-[15px] ${todo.completed ? "text-gray-400 line-through" : "text-gray-900 font-medium"}`}>
                    {todo.title}
                  </p>
                </div>
                {todo.time && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[13px]">{todo.time}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 오늘 루틴 */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-bold text-gray-900">오늘 루틴</h2>
          <button
            onClick={() => onNavigate("goals-routines")}
            className="flex items-center gap-1 text-[14px] text-orange-600 font-medium"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {routines.slice(0, 5).map((routine) => (
            <button
              key={routine.id}
              onClick={() => toggleRoutine(routine.id)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all"
            >
              {routine.completed ? (
                <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className={`text-[15px] ${routine.completed ? "text-gray-400 line-through" : "text-gray-900 font-medium"}`}>
                  {routine.title}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-[14px] text-orange-600 font-semibold">{routine.streak}</span>
              </div>
            </button>
          ))}
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
