import { useState, useEffect, useRef } from "react";
import { CheckSquare, Target, Calendar as CalendarIcon, ChevronRight, Circle, CheckCircle2, Flame, Award, Menu, X, User, Settings, Bell, LogOut, Palette, Plus, TrendingUp, Clock, BarChart3, GripVertical, Trash2, Edit } from "lucide-react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar';

interface MainDashboardProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean; date?: Date }) => void;
}

type WidgetType = 'progress' | 'todos' | 'routines' | 'goals' | 'timer' | 'stats';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: any;
  order: number;
}

interface DraggableWidgetProps {
  widget: Widget;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}

const ITEM_TYPE = 'WIDGET';

const DraggableWidget = ({ widget, index, moveWidget, onRemove, children }: DraggableWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveWidget(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="relative group"
    >
      {/* Drag Handle & Remove Button */}
      <div className="absolute -top-2 -right-2 z-10 flex gap-1">
        <button
          onClick={() => onRemove(widget.id)}
          className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="cursor-move p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      {children}
    </div>
  );
};

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'default';
  });

  // 위젯 관리
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('homeWidgets');
    if (saved) return JSON.parse(saved);
    
    // 기본 위젯
    return [
      { id: '1', type: 'progress' as const, title: '오늘 진행률', icon: TrendingUp, order: 0 },
      { id: '2', type: 'todos' as const, title: '오늘 할일', icon: CheckSquare, order: 1 },
      { id: '3', type: 'routines' as const, title: '오늘 루틴', icon: Flame, order: 2 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('homeWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const availableWidgets: { type: WidgetType; title: string; icon: any; description: string }[] = [
    { type: 'progress', title: '오늘 진행률', icon: TrendingUp, description: '오늘의 할일과 루틴 진행률을 표시합니다' },
    { type: 'todos', title: '오늘 할일', icon: CheckSquare, description: '오늘 완료해야 할 작업 목록입니다' },
    { type: 'routines', title: '오늘 루틴', icon: Flame, description: '오늘의 습관 체크리스트입니다' },
    { type: 'goals', title: '목표 진행도', icon: Target, description: '진행중인 목표들의 현황을 표시합니다' },
    { type: 'timer', title: '집중 타이머', icon: Clock, description: '뽀모도로 집중 타이머입니다' },
    { type: 'stats', title: '주간 통계', icon: BarChart3, description: '이번 주 통계를 한눈에 볼 수 있습니다' },
  ];

  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    const newWidgets = [...widgets];
    const dragWidget = newWidgets[dragIndex];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(hoverIndex, 0, dragWidget);
    newWidgets.forEach((w, i) => w.order = i);
    setWidgets(newWidgets);
  };

  const addWidget = (type: WidgetType) => {
    const widgetInfo = availableWidgets.find(w => w.type === type);
    if (!widgetInfo) return;
    if (widgets.some(w => w.type === type)) return; // 중복 방지

    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: widgetInfo.title,
      icon: widgetInfo.icon,
      order: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetSelector(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const today = new Date();
  const dateString = today.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 테마 옵션
  const themes = [
    { 
      id: 'default', 
      name: '기본 (파스텔 블루)', 
      bg: 'from-blue-50 via-purple-50 to-pink-50',
      primary: 'from-blue-600 to-purple-600',
      secondary: 'from-orange-500 to-orange-600',
      accent: 'from-blue-100 to-blue-200',
    },
    { 
      id: 'green', 
      name: '민트 그린', 
      bg: 'from-green-50 via-teal-50 to-cyan-50',
      primary: 'from-green-500 to-teal-500',
      secondary: 'from-cyan-500 to-blue-500',
      accent: 'from-green-100 to-green-200',
    },
    { 
      id: 'purple', 
      name: '라벤더 퍼플', 
      bg: 'from-purple-50 via-pink-50 to-rose-50',
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-rose-500 to-pink-500',
      accent: 'from-purple-100 to-purple-200',
    },
    { 
      id: 'warm', 
      name: '따뜻한 오렌지', 
      bg: 'from-orange-50 via-amber-50 to-yellow-50',
      primary: 'from-orange-500 to-amber-500',
      secondary: 'from-amber-500 to-yellow-500',
      accent: 'from-orange-100 to-orange-200',
    },
    { 
      id: 'cool', 
      name: '쿨 블루', 
      bg: 'from-cyan-50 via-blue-50 to-indigo-50',
      primary: 'from-cyan-500 to-blue-500',
      secondary: 'from-indigo-500 to-purple-500',
      accent: 'from-cyan-100 to-cyan-200',
    },
    { 
      id: 'monochrome', 
      name: '모노크롬', 
      bg: 'from-gray-50 via-slate-50 to-gray-100',
      primary: 'from-gray-700 to-gray-800',
      secondary: 'from-slate-600 to-slate-700',
      accent: 'from-gray-200 to-gray-300',
    },
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('appTheme', themeId);
  };

  // 오늘의 할일
  const todayTodos = [
    { 
      id: "1", 
      title: "프로젝트 기획서 작성", 
      time: "10:00", 
      completed: false,
      subtasks: [
        { id: "1-1", title: "목차 정리", completed: true },
        { id: "1-2", title: "내용 작성", completed: false },
      ]
    },
    { 
      id: "2", 
      title: "디자인 리뷰 미팅", 
      time: "14:00", 
      completed: false,
      subtasks: []
    },
    { 
      id: "3", 
      title: "운동하기", 
      time: "18:00", 
      completed: true,
      subtasks: []
    },
  ];

  // 진행중인 목표
  const activeGoals = [
    { 
      id: "goal1", 
      title: "건강한 생활 습관 만들기", 
      progress: 65,
      color: "blue"
    },
    { 
      id: "goal2", 
      title: "영어 실력 향상", 
      progress: 42,
      color: "purple"
    },
    { 
      id: "goal3", 
      title: "자기계발", 
      progress: 28,
      color: "green"
    },
  ];

  // 오늘의 루틴
  const [routines] = useState([
    { id: "1", title: "아침 명상", completed: true, streak: 18 },
    { id: "2", title: "영어 공부 30분", completed: false, streak: 12 },
    { id: "3", title: "운동하기 30분", completed: false, streak: 8 },
    { id: "4", title: "물 2L 마시기", completed: true, streak: 15 },
  ]);

  // 집중 타이머
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setIsTimerRunning(false);
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  // 주간 통계
  const weeklyStats = {
    todosCompleted: 24,
    routinesCompleted: 18,
    bestStreak: 12,
    totalGoalProgress: 28,
  };

  const completedTodos = todayTodos.filter(t => t.completed).length;
  const completedRoutines = routines.filter(r => r.completed).length;

  // 위젯 렌더링
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'progress':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-gray-600">할일</span>
                  <span className="text-[13px] font-bold text-blue-600">{completedTodos}/{todayTodos.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-2 transition-all"
                    style={{ width: `${(completedTodos / todayTodos.length) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-gray-600">루틴</span>
                  <span className="text-[13px] font-bold text-orange-600">{completedRoutines}/{routines.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-full h-2 transition-all"
                    style={{ width: `${(completedRoutines / routines.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'todos':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
                <span className="text-[13px] text-gray-500">({completedTodos}/{todayTodos.length})</span>
              </div>
              <button
                onClick={() => onNavigate("todos")}
                className="text-[13px] text-blue-600 font-medium hover:text-blue-700"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-1">
              {todayTodos.slice(0, 3).map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-white/50">
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <p className={`text-[14px] flex-1 ${todo.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {todo.title}
                  </p>
                  {todo.time && <span className="text-[12px] text-gray-500">{todo.time}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'routines':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
                <span className="text-[13px] text-gray-500">({completedRoutines}/{routines.length})</span>
              </div>
              <button
                onClick={() => onNavigate("goals-routines")}
                className="text-[13px] text-orange-600 font-medium hover:text-orange-700"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-1">
              {routines.map((routine) => (
                <div key={routine.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-white/50">
                  {routine.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <p className={`text-[14px] flex-1 ${routine.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {routine.title}
                  </p>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[12px] text-orange-600 font-medium">{routine.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
              </div>
              <button
                onClick={() => onNavigate("goals-routines")}
                className="text-[13px] text-purple-600 font-medium hover:text-purple-700"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-2">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-3 rounded-xl bg-white/60 border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-medium text-gray-900">{goal.title}</p>
                    <span className="text-[13px] font-semibold text-purple-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-full h-1.5 transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-gray-900 mb-4">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-6 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
                >
                  {isTimerRunning ? '일시정지' : '시작'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerMinutes(25);
                    setTimerSeconds(0);
                  }}
                  className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all"
                >
                  리셋
                </button>
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h2 className="text-[16px] font-bold text-gray-900">{widget.title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-50">
                <p className="text-[11px] text-blue-600 mb-1">완료된 할일</p>
                <p className="text-[20px] font-bold text-blue-700">{weeklyStats.todosCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <p className="text-[11px] text-orange-600 mb-1">완료된 루틴</p>
                <p className="text-[20px] font-bold text-orange-700">{weeklyStats.routinesCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <p className="text-[11px] text-purple-600 mb-1">최고 연속</p>
                <p className="text-[20px] font-bold text-purple-700">{weeklyStats.bestStreak}일</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <p className="text-[11px] text-green-600 mb-1">목표 진행률</p>
                <p className="text-[20px] font-bold text-green-700">{weeklyStats.totalGoalProgress}%</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} pb-24`}>
        {/* Top Bar */}
        <div className="px-5 pt-3 flex justify-between items-center">
          <button
            onClick={() => setShowWidgetSelector(true)}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => setShowMenu(true)}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <Menu className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Weekly Calendar */}
        <div className="px-5 pt-3 pb-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white/60 shadow-sm">
            <div className="grid grid-cols-7 gap-1.5">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + index);
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <button
                    key={day}
                    onClick={() => onNavigate('calendar', { date })}
                    className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl transition-all ${isToday ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-transparent text-gray-700 hover:bg-white/50'}`}
                  >
                    <span className={`text-[10px] font-medium mb-0.5 ${isToday ? 'text-white' : index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                      {day}
                    </span>
                    <span className={`text-[16px] font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Widgets */}
        <div className="px-5 space-y-4">
          {widgets.sort((a, b) => a.order - b.order).map((widget, index) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              index={index}
              moveWidget={moveWidget}
              onRemove={removeWidget}
            >
              {renderWidget(widget)}
            </DraggableWidget>
          ))}

          {widgets.length === 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/60 shadow-sm text-center">
              <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-[14px] mb-3">위젯을 추가해보세요</p>
              <button
                onClick={() => setShowWidgetSelector(true)}
                className="px-6 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
              >
                위젯 추가
              </button>
            </div>
          )}
        </div>

        {/* Widget Selector Modal */}
        {showWidgetSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-gray-900">위젯 추가</h2>
                <button
                  onClick={() => setShowWidgetSelector(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                {availableWidgets.map((w) => {
                  const isAdded = widgets.some(widget => widget.type === w.type);
                  const Icon = w.icon;
                  return (
                    <button
                      key={w.type}
                      onClick={() => !isAdded && addWidget(w.type)}
                      disabled={isAdded}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        isAdded
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-gray-900 mb-0.5">{w.title}</p>
                        <p className="text-[12px] text-gray-500">{w.description}</p>
                        {isAdded && (
                          <p className="text-[11px] text-blue-600 font-medium mt-1">✓ 이미 추가됨</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
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
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                <button className="flex items-center gap-4 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left">
                  <User className="w-5 h-5 text-gray-600" />
                  <p className="text-[15px] font-medium text-gray-900">프로필</p>
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowSettings(true); }}
                  className="flex items-center gap-4 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <p className="text-[15px] font-medium text-gray-900">설정</p>
                </button>
                <button className="flex items-center gap-4 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <p className="text-[15px] font-medium text-gray-900">알림</p>
                </button>
                <button className="flex items-center gap-4 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left">
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
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="w-5 h-5 text-gray-600" />
                  <p className="text-[15px] font-medium text-gray-900">색상 테마 선택</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`aspect-square rounded-2xl bg-gradient-to-br ${theme.primary} flex items-center justify-center shadow-md hover:shadow-lg transition-all ${selectedTheme === theme.id ? 'ring-4 ring-blue-400 scale-105' : ''}`}
                    >
                      <span className="text-white text-2xl">🎯</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">{themes.find(t => t.id === selectedTheme)?.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
