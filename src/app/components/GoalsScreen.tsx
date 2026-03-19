import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  Calendar as CalendarIcon,
  MoreVertical,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Target,
  X,
  Link2,
  Grid3x3,
  List,
  Settings,
  Edit2,
  Trash2,
} from "lucide-react";
import { useData } from "../context/DataContext";
import type { Goal, LinkedRoutine } from "../context/DataContext";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar' | 'ai';

interface GoalsScreenProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
  shouldOpenAddModal?: boolean;
  hideHeader?: boolean;
}

export function GoalsScreen({ onNavigate, shouldOpenAddModal, hideHeader }: GoalsScreenProps) {
  const { goals, addGoal, updateGoal, deleteGoal, addRoutine, deleteRoutine, updateRoutine, goalCategories, addGoalCategory, updateGoalCategory, deleteGoalCategory } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedCellIndex, setSelectedCellIndex] = useState<number>(-1); // 만다라트에서 선택된 셀
  const [viewMode, setViewMode] = useState<'list' | 'mandala'>('list'); // 리스트 vs 만다라트
  const [showRoutineMenu, setShowRoutineMenu] = useState<string | null>(null); // 루틴 메뉴
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null); // 수정 중인 루틴 ID
  const [showEditRoutineModal, setShowEditRoutineModal] = useState(false);
  const [showSubGoalModal, setShowSubGoalModal] = useState(false); // 세부 목표 추가 모달
  const [parentGoalForSubGoal, setParentGoalForSubGoal] = useState<string>(""); // 세부 목표를 추가할 부모 목표
  const [selectedGoalForMandala, setSelectedGoalForMandala] = useState<Goal | null>(null); // 만다라트로 볼 목표
  const [showCategoryManage, setShowCategoryManage] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showGoalMenu, setShowGoalMenu] = useState<string | null>(null); // 목표 메뉴
  const [showEditGoalModal, setShowEditGoalModal] = useState(false); // 목표 수정 모달
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null); // 수정 중인 목표

  // shouldOpenAddModal이 true면 모달 열기
  useEffect(() => {
    if (shouldOpenAddModal) {
      setShowAddModal(true);
    }
  }, [shouldOpenAddModal]);
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "건강",
    endDate: "",
    color: "from-blue-100 to-blue-200",
  });
  
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    icon: "🎯",
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    trackingType: "count" as "count" | "days",
    targetCount: 7,
    selectedDays: [] as number[], // 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
  });

  const colorOptions = [
    { name: "파랑", value: "from-blue-100 to-blue-200" },
    { name: "보라", value: "from-purple-100 to-purple-200" },
    { name: "핑크", value: "from-pink-100 to-pink-200" },
    { name: "초록", value: "from-green-100 to-green-200" },
    { name: "청록", value: "from-cyan-100 to-cyan-200" },
    { name: "주황", value: "from-orange-100 to-orange-200" },
  ];

  const iconOptions = ["🎯", "💪", "📚", "💧", "🧘", "🏃", "📖", "✍️", "🎨", "💻"];

  const toggleExpand = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, { expanded: !goal.expanded });
  };

  const calculateRoutinesProgress = (routines: LinkedRoutine[]) => {
    if (routines.length === 0) return 0;
    const totalProgress = routines.reduce((sum, r) => sum + r.currentProgress, 0);
    return Math.round(totalProgress / routines.length);
  };

  const calculateGoalProgress = (goal: Goal) => {
    return calculateRoutinesProgress(goal.linkedRoutines);
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      startDate: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").slice(0, -1),
      endDate: newGoal.endDate,
      color: newGoal.color,
      linkedRoutines: [],
      expanded: false,
    };

    addGoal(goal);
    setShowAddModal(false);
    setNewGoal({
      title: "",
      description: "",
      category: "건강",
      endDate: "",
      color: "from-blue-100 to-blue-200",
    });
  };

  const handleAddRoutine = () => {
    if (!newRoutine.title.trim() || !selectedGoalId) return;

    // Create routine object
    const routine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      icon: newRoutine.icon,
      frequency: newRoutine.frequency,
      targetCount: newRoutine.targetCount,
      currentCount: 0,
      trackingType: newRoutine.trackingType,
      selectedDays: newRoutine.selectedDays,
      linkedGoalId: selectedGoalId,
      color: "bg-blue-500",
      streak: 0,
      timeOfDay: "anytime" as const, // 루틴 탭에서도 표시되도록 timeOfDay 추가
      weeklyCount: newRoutine.frequency === "weekly" ? 0 : undefined,
      monthlyCount: newRoutine.frequency === "monthly" ? 0 : undefined,
      bestStreak: 0,
    };

    // Add routine to DataContext (this will also update the goal's linkedRoutines)
    addRoutine(routine);

    setShowAddRoutineModal(false);
    setNewRoutine({ title: "", icon: "🎯", frequency: "weekly", trackingType: "count", targetCount: 7, selectedDays: [] });
    setSelectedGoalId("");
    setSelectedCellIndex(-1);
  };

  const openAddRoutineModal = (goalId: string, cellIndex: number = -1) => {
    setSelectedGoalId(goalId);
    setSelectedCellIndex(cellIndex);
    setShowAddRoutineModal(true);
  };

  const RoutineList = ({ routines }: { routines: LinkedRoutine[] }) => {
    if (routines.length === 0) return null;

    return (
      <div className="space-y-2 mt-2">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
          >
            <span className="text-2xl">{routine.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-gray-800 mb-1">
                {routine.title}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-1.5 transition-all"
                    style={{ width: `${routine.currentProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {routine.currentCount}/{routine.targetCount}
                </p>
              </div>
            </div>
            {routine.currentProgress >= 100 && (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = calculateGoalProgress(goal);
    const hasRoutines = goal.linkedRoutines.length > 0;

    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 overflow-hidden">
        {/* Goal Header */}
        <div className={`bg-gradient-to-br ${goal.color} p-2`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="bg-white/30 px-1.5 py-0.5 rounded text-[9px] font-medium text-gray-700">
                  {goal.category}
                </span>
                <span className="text-gray-600 text-[9px] flex items-center gap-0.5">
                  <CalendarIcon className="w-2.5 h-2.5" />
                  {goal.endDate}
                </span>
              </div>
              <h3 className="text-gray-800 font-bold text-[13px] truncate">
                {goal.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <span className="text-gray-800 font-bold text-[13px]">{progress}%</span>
              <button 
                onClick={() => setShowGoalMenu(showGoalMenu === goal.id ? null : goal.id)}
                className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors relative"
              >
                <MoreVertical className="w-3 h-3 text-gray-700" />
                
                {/* Goal Menu */}
                {showGoalMenu === goal.id && (
                  <div className="absolute right-0 top-6 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] min-w-[100px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGoal(goal);
                        setShowEditGoalModal(true);
                        setShowGoalMenu(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3 h-3" />
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`"${goal.title}" 목표를 삭제하시겠습니까?\n연결된 루틴도 함께 삭제됩니다.`)) {
                          deleteGoal(goal.id);
                        }
                        setShowGoalMenu(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/40 rounded-full h-1 mt-1.5">
            <div
              className="bg-white rounded-full h-1 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content Section */}
        {hasRoutines && (
          <div className="p-4">
            <button
              onClick={() => toggleExpand(goal.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-500" />
                <span className="text-[13px] font-semibold text-gray-700">
                  연결된 루틴 {goal.linkedRoutines.length}개
                </span>
              </div>
              {goal.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {goal.expanded && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[12px] font-semibold text-gray-600">연결된 루틴</p>
                    <button
                      onClick={() => openAddRoutineModal(goal.id)}
                      className="text-[11px] text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      추가
                    </button>
                  </div>
                  <RoutineList routines={goal.linkedRoutines} />
                </div>
              </div>
            )}
          </div>
        )}

        {!hasRoutines && (
          <div className="p-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 mb-2">
              <Target className="w-4 h-4 text-gray-400" />
              <p className="text-[13px] text-gray-500">
                루틴을 추가해보세요
              </p>
            </div>
            <button
              onClick={() => openAddRoutineModal(goal.id)}
              className="w-full py-2 rounded-lg bg-purple-50 text-purple-600 text-[13px] font-medium hover:bg-purple-100 transition-colors"
            >
              + 루틴 추가
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Header */}
      {!hideHeader && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-5 pt-12 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => onNavigate('home')}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">목표</h1>
              <div className="w-9 h-9" />
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="px-5 py-6">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-600 text-[13px] mb-1 font-medium">진행중인 목표</p>
              <p className="text-purple-900 text-3xl font-bold">{goals.length}개</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-purple-700" />
            </div>
          </div>
          <p className="text-purple-700 text-[12px]">
            목표와 루틴을 직접 연결하여 체계적으로 관리하세요 🎯
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-gray-900">내 목표</h2>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'mandala' : 'list')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'list' ? (
              <>
                <Grid3x3 className="w-4 h-4 text-purple-600" />
                <span className="text-[13px] font-semibold text-gray-700">만다라트 보기</span>
              </>
            ) : (
              <>
                <List className="w-4 h-4 text-purple-600" />
                <span className="text-[13px] font-semibold text-gray-700">리스트 보기</span>
              </>
            )}
          </button>
        </div>

        {/* Goals Content */}
        {viewMode === 'list' ? (
          /* Goals List */
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          /* Mandala View - 3x3 Grid */
          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                <h3 className="text-[15px] font-bold text-gray-900 mb-3 text-center">
                  {goal.title}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {/* Center Cell - Main Goal */}
                  <div className={`col-start-2 row-start-2 aspect-square rounded-xl bg-gradient-to-br ${goal.color} p-3 flex flex-col items-center justify-center border-2 border-purple-300 shadow-md`}>
                    <p className="text-[11px] font-bold text-gray-800 text-center leading-tight">
                      {goal.title}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {calculateGoalProgress(goal)}%
                    </p>
                  </div>

                  {/* Surrounding Cells - Routines */}
                  <>
                    {goal.linkedRoutines.slice(0, 8).map((routine, index) => {
                      const positions = [
                        { col: 1, row: 1 },
                        { col: 2, row: 1 },
                        { col: 3, row: 1 },
                        { col: 1, row: 2 },
                        { col: 3, row: 2 },
                        { col: 1, row: 3 },
                        { col: 2, row: 3 },
                        { col: 3, row: 3 },
                      ];
                      const pos = positions[index];
                      let pressTimer: NodeJS.Timeout;

                      return (
                        <div
                          key={routine.id}
                          className="aspect-square rounded-lg bg-white p-2 flex flex-col items-center justify-center shadow-sm border border-gray-200 relative"
                          style={{ gridColumn: pos.col, gridRow: pos.row }}
                          onTouchStart={(e) => {
                            pressTimer = setTimeout(() => {
                              setShowRoutineMenu(routine.id);
                            }, 500);
                          }}
                          onTouchEnd={() => {
                            clearTimeout(pressTimer);
                          }}
                          onMouseDown={() => {
                            pressTimer = setTimeout(() => {
                              setShowRoutineMenu(routine.id);
                            }, 500);
                          }}
                          onMouseUp={() => {
                            clearTimeout(pressTimer);
                          }}
                          onMouseLeave={() => {
                            clearTimeout(pressTimer);
                          }}
                        >
                          <span className="text-lg mb-1">{routine.icon}</span>
                          <p className="text-[9px] font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                            {routine.title}
                          </p>
                          <p className="text-[8px] text-purple-600 font-bold mt-1">
                            {routine.currentProgress}%
                          </p>
                          
                          {/* Routine Menu */}
                          {showRoutineMenu === routine.id && (
                            <div className="absolute inset-0 bg-white rounded-lg shadow-lg z-50 flex flex-col p-2 gap-1">
                              <button
                                onClick={() => {
                                  setEditingRoutineId(routine.id);
                                  setShowEditRoutineModal(true);
                                  setShowRoutineMenu(null);
                                }}
                                className="flex-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`"${routine.title}" 루틴을 삭제하시겠습니까?`)) {
                                    deleteRoutine(routine.id);
                                  }
                                  setShowRoutineMenu(null);
                                }}
                                className="flex-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                삭제
                              </button>
                              <button
                                onClick={() => setShowRoutineMenu(null)}
                                className="flex-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              >
                                취소
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty cells with Add Button */}
                    {Array.from({ length: Math.max(0, 8 - goal.linkedRoutines.length) }).map((_, index) => {
                      const positions = [
                        { col: 1, row: 1 },
                        { col: 2, row: 1 },
                        { col: 3, row: 1 },
                        { col: 1, row: 2 },
                        { col: 3, row: 2 },
                        { col: 1, row: 3 },
                        { col: 2, row: 3 },
                        { col: 3, row: 3 },
                      ];
                      const posIndex = goal.linkedRoutines.length + index;
                      const pos = positions[posIndex];

                      return (
                        <button
                          key={`empty-${index}`}
                          onClick={() => openAddRoutineModal(goal.id, posIndex)}
                          className="aspect-square rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-purple-300 transition-all"
                          style={{ gridColumn: pos.col, gridRow: pos.row }}
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-5 pt-4 pb-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">새 목표 추가</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pb-4">
                {/* Title Input */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">목표 제목</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="예: 건강한 생활 습관 만들기"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">설명</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="목표에 대한 간단한 설명을 입력하세요"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">카테고리</label>
                  <div className="flex gap-2 flex-wrap">
                    {goalCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setNewGoal({ ...newGoal, category })}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                          newGoal.category === category
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-150"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">목표 달성일</label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">색상</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewGoal({ ...newGoal, color: color.value })}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.value} transition-all ${
                          newGoal.color === color.value
                            ? "ring-2 ring-purple-400 scale-110"
                            : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[12px] text-blue-700 leading-relaxed">
                    💡 목표를 추가한 후, 루틴을 직접 연결할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-[14px] hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium text-[14px] hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Routine Modal */}
      {showAddRoutineModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-5 pt-4 pb-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">루틴 추가</h2>
                <button
                  onClick={() => {
                    setShowAddRoutineModal(false);
                    setSelectedGoalId("");
                    setSelectedCellIndex(-1);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">루틴 제목</label>
                  <input
                    type="text"
                    value={newRoutine.title}
                    onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                    placeholder="예: 운동하기"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">아이콘</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewRoutine({ ...newRoutine, icon })}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          newRoutine.icon === icon
                            ? "bg-purple-100 ring-2 ring-purple-400 scale-110"
                            : "bg-gray-100 hover:scale-105"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">반복 주기</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'daily', label: '일일' },
                      { value: 'weekly', label: '주간' },
                      { value: 'monthly', label: '월간' }
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setNewRoutine({ ...newRoutine, frequency: freq.value as any })}
                        className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          newRoutine.frequency === freq.value
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking Type Selection */}
                {(newRoutine.frequency === 'weekly' || newRoutine.frequency === 'monthly') && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-2 block">추적 방식</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewRoutine({ ...newRoutine, trackingType: 'count' })}
                        className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          newRoutine.trackingType === 'count'
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        횟수 기반
                      </button>
                      <button
                        onClick={() => setNewRoutine({ ...newRoutine, trackingType: 'days' })}
                        className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          newRoutine.trackingType === 'days'
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        요일 지정
                      </button>
                    </div>
                  </div>
                )}

                {/* Days Selection (for 'days' tracking type) */}
                {(newRoutine.frequency === 'weekly' || newRoutine.frequency === 'monthly') && newRoutine.trackingType === 'days' && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-2 block">요일 선택</label>
                    <div className="flex gap-1">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
                        const isSelected = newRoutine.selectedDays.includes(index);
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const days = isSelected
                                ? newRoutine.selectedDays.filter(d => d !== index)
                                : [...newRoutine.selectedDays, index].sort();
                              setNewRoutine({ ...newRoutine, selectedDays: days });
                            }}
                            className={`flex-1 aspect-square rounded-lg text-[12px] font-semibold transition-all ${
                              isSelected
                                ? index === 0 ? "bg-red-500 text-white" : index === 6 ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Target Count (for 'count' tracking type or daily) */}
                {(newRoutine.frequency === 'daily' || newRoutine.trackingType === 'count') && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-2 block">
                      {newRoutine.frequency === 'daily' ? '일일 목표 횟수' : 
                       newRoutine.frequency === 'weekly' ? '주간 목표 횟수' : '월간 목표 횟수'}
                    </label>
                    <input
                      type="number"
                      value={newRoutine.targetCount}
                      onChange={(e) => setNewRoutine({ ...newRoutine, targetCount: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="30"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[12px] text-blue-700 leading-relaxed">
                    💡 {newRoutine.trackingType === 'days' 
                      ? '선택한 요일에 루틴을 수행하세요.' 
                      : `${newRoutine.frequency === 'daily' ? '매일' : newRoutine.frequency === 'weekly' ? '이번 주' : '이번 달'} ${newRoutine.targetCount}회를 목표로 합니다.`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowAddRoutineModal(false);
                    setSelectedGoalId("");
                    setSelectedCellIndex(-1);
                  }}
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
      )}

      {/* Edit Routine Modal */}
      {showEditRoutineModal && editingRoutineId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="px-5 pt-4 pb-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">루틴 수정</h2>
                <button
                  onClick={() => {
                    setShowEditRoutineModal(false);
                    setEditingRoutineId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">루틴 제목</label>
                  <input
                    type="text"
                    value={goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId))?.linkedRoutines.find(r => r.id === editingRoutineId)?.title || ""}
                    onChange={(e) => {
                      const goal = goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId));
                      if (goal) {
                        const routine = goal.linkedRoutines.find(r => r.id === editingRoutineId);
                        if (routine) {
                          updateRoutine(routine.id, { title: e.target.value });
                        }
                      }
                    }}
                    placeholder="예: 운동하기"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 mb-2 block">아이콘</label>
                  <div className="flex gap-2 flex-wrap">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => {
                          const goal = goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId));
                          if (goal) {
                            const routine = goal.linkedRoutines.find(r => r.id === editingRoutineId);
                            if (routine) {
                              updateRoutine(routine.id, { icon });
                            }
                          }
                        }}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId))?.linkedRoutines.find(r => r.id === editingRoutineId)?.icon === icon
                            ? "bg-purple-100 ring-2 ring-purple-400 scale-110"
                            : "bg-gray-100 hover:scale-105"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowEditRoutineModal(false);
                    setEditingRoutineId(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-[14px] hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId))?.linkedRoutines.find(r => r.id === editingRoutineId)?.title.trim()) {
                      setShowEditRoutineModal(false);
                      setEditingRoutineId(null);
                    }
                  }}
                  disabled={!goals.find(g => g.linkedRoutines.some(r => r.id === editingRoutineId))?.linkedRoutines.find(r => r.id === editingRoutineId)?.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 text-white font-medium text-[14px] hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}