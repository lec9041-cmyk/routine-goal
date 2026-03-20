import { useState, useEffect, useRef, type FocusEvent } from "react";
import {
  Plus,
  ChevronLeft,
  Circle,
  CheckCircle2,
  Clock,
  Bell,
  BellOff,
  Flag,
  MoreVertical,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Trash2,
  Edit2,
  Settings,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useData } from "../context/DataContext";
import type { Todo, Project } from "../context/DataContext";
import { ProjectManageModal } from "./ProjectManageModal";
import { ModalPortal } from "./common/ModalPortal";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar' | 'ai';

interface TodoScreenProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
  shouldOpenAddModal?: boolean;
}

export function TodoScreen({ onNavigate, shouldOpenAddModal }: TodoScreenProps) {
  const { todos, addTodo, updateTodo, deleteTodo, deleteCompletedTodos, toggleTodo, todoCategories, addTodoCategory, updateTodoCategory, deleteTodoCategory, projects, addProject, updateProject, deleteProject } = useData();
  
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("today");
  const [newSubTaskId, setNewSubTaskId] = useState<string | null>(null);
  const [newSubTaskText, setNewSubTaskText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInlineQuickAdd, setShowInlineQuickAdd] = useState(false);
  const [quickTodoTitle, setQuickTodoTitle] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showCategoryManage, setShowCategoryManage] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showAddSubTask, setShowAddSubTask] = useState<string | null>(null); // 서브태스크 추가 UI 표시할 할일 ID
  const [showProjectManage, setShowProjectManage] = useState(false);
  const [newTodoError, setNewTodoError] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const newTodoTitleRef = useRef<HTMLInputElement>(null);
  const [newTodo, setNewTodo] = useState({
    title: "",
    category: "업무",
    time: "",
    notificationEnabled: false,
    priority: "medium" as const,
    dueDate: "오늘",
    projectId: "",
  });
  
  // shouldOpenAddModal이 true면 모달 열기
  useEffect(() => {
    if (shouldOpenAddModal) {
      setShowAddModal(true);
    }
  }, [shouldOpenAddModal]);

  useEffect(() => {
    if (!showAddModal) {
      setNewTodoError("");
      setIsAddingTodo(false);
    }
  }, [showAddModal]);

  useEffect(() => {
    if (!showInlineQuickAdd) {
      setQuickTodoTitle("");
      setIsQuickAdding(false);
    }
  }, [showInlineQuickAdd]);

  const priorityColors = {
    high: "bg-red-400",
    medium: "bg-yellow-400",
    low: "bg-blue-400",
  };
  const modalFieldClass = "w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[14px]";
  const modalChipClass = "min-h-10 px-4 rounded-xl text-[12px] font-medium transition-all";

  const toggleSubTask = (todoId: string, subTaskId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || !todo.subTasks) return;
    
    updateTodo(todoId, {
      subTasks: todo.subTasks.map((st) =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const toggleExpand = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    updateTodo(id, { expanded: !todo.expanded });
  };

  const handleAddTodo = async () => {
    if (isAddingTodo) return;
    if (!newTodo.title.trim()) {
      setNewTodoError("할일 제목은 필수입니다.");
      newTodoTitleRef.current?.focus();
      return;
    }

    setIsAddingTodo(true);
    setNewTodoError("");
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      category: newTodo.category,
      time: newTodo.time || undefined,
      notificationEnabled: newTodo.time ? newTodo.notificationEnabled : false,
      completed: false,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate,
      projectId: newTodo.projectId,
    };

    try {
      addTodo(todo);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setNewTodo({
        title: "",
        category: "업무",
        time: "",
        notificationEnabled: false,
        priority: "medium",
        dueDate: "오늘",
        projectId: "",
      });
      setShowAddModal(false);
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleQuickAddTodo = async () => {
    if (isQuickAdding) return;
    const title = quickTodoTitle.trim();
    if (!title) {
      setShowInlineQuickAdd(false);
      return;
    }

    setIsQuickAdding(true);
    try {
      addTodo({
        id: Date.now().toString(),
        title,
        category: "업무",
        completed: false,
        priority: "medium",
        dueDate: "오늘",
        projectId: "",
      });
      setShowInlineQuickAdd(false);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleUpdateTodo = () => {
    if (!editingTodo) return;

    updateTodo(editingTodo.id, editingTodo);
    setShowEditModal(false);
    setEditingTodo(null);
    setShowDeleteMenu(null);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
    setShowDeleteMenu(null);
  };

  const handleDeleteAllCompleted = () => {
    deleteCompletedTodos();
    setShowDeleteAllConfirm(false);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowEditModal(true);
    setShowDeleteMenu(null);
  };

  const addSubTask = (todoId: string) => {
    if (!newSubTaskText.trim()) return;

    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const subTasks = todo.subTasks || [];
    updateTodo(todoId, {
      subTasks: [
        ...subTasks,
        {
          id: `${todoId}-${Date.now()}`,
          title: newSubTaskText,
          completed: false,
        },
      ]
    });
    setNewSubTaskText("");
    setNewSubTaskId(null);
  };

  const addCategory = () => {
    if (!newCategoryName.trim() || todoCategories.includes(newCategoryName)) return;
    
    addTodoCategory(newCategoryName);
    setNewCategoryName("");
    setShowCategoryInput(false);
  };

  const ensureFieldVisibleOnFocus = (event: FocusEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
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

  const filteredTodos = todos.filter((todo) => {
    if (filter === "today") return todo.dueDate === "오늘";
    if (filter === "upcoming") return todo.dueDate !== "오늘";
    return true;
  });

  const totalCount = filteredTodos.length;
  const completedCount = filteredTodos.filter(t => t.completed).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="px-4 pt-10 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => onNavigate('home')}
            className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm"
          >
            <ChevronLeft className="w-4.5 h-4.5 text-gray-700" />
          </button>
          <h1 className="text-[18px] font-bold text-gray-900">할일</h1>
          <div className="flex gap-1.5">
            <button 
              onClick={() => setShowProjectManage(true)}
              className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm"
            >
              <Folder className="w-4 h-4 text-blue-500" />
            </button>
            <button 
              onClick={() => setShowDeleteAllConfirm(true)}
              className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("today")}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              filter === "today"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white/60 text-gray-600 hover:bg-white/80"
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              filter === "upcoming"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white/60 text-gray-600 hover:bg-white/80"
            }`}
          >
            예정
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white/60 text-gray-600 hover:bg-white/80"
            }`}
          >
            전체
          </button>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-gray-500 font-medium">
                {completedCount}개 완료 / {totalCount}개
              </p>
              <p className="text-[12px] font-bold text-blue-600">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full bg-white/60 rounded-full h-1.5">
              <div
                className="bg-blue-500 rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Todo List */}
      <div className="px-4">
        <div className="space-y-1.5">
          {filteredTodos.map((todo) => {
            const hasSubTasks = todo.subTasks && todo.subTasks.length > 0;
            const completedSubTasks = todo.subTasks?.filter(st => st.completed).length || 0;
            const totalSubTasks = todo.subTasks?.length || 0;

            return (
              <div key={todo.id} className="relative z-10">
                {/* Main Todo */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 hover:bg-white/90 transition-all shadow-sm">
                  <div className="p-2.5">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-gray-300 hover:text-blue-500 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`text-[13.5px] font-medium flex-1 leading-snug ${
                              todo.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {!todo.completed && (
                            <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[todo.priority]} mt-1.5 flex-shrink-0`} />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md font-medium">
                            {todo.category}
                          </span>
                          {todo.projectId && (() => {
                            const project = projects.find(p => p.id === todo.projectId);
                            if (project) {
                              return (
                                <span className={`text-[10px] text-gray-700 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5 ${project.color}`}>
                                  <Folder className="w-2.5 h-2.5" />
                                  {project.title}
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {todo.time && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {todo.time}
                            </span>
                          )}
                          {todo.time && todo.notificationEnabled && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                              <Bell className="w-2.5 h-2.5" />
                              알림 ON
                            </span>
                          )}
                          {hasSubTasks && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-semibold">
                              {completedSubTasks}/{totalSubTasks}
                            </span>
                          )}
                          {!todo.completed && (
                            <button
                              onClick={() => {
                                setShowAddSubTask(showAddSubTask === todo.id ? null : todo.id);
                                setNewSubTaskId(null);
                              }}
                              className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-semibold hover:bg-purple-100 transition-colors flex items-center gap-0.5"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              서브
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 flex-shrink-0 relative">
                        {hasSubTasks && (
                          <button
                            onClick={() => toggleExpand(todo.id)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            {todo.expanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteMenu(showDeleteMenu === todo.id ? null : todo.id)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        
                        {/* Delete Menu */}
                        {showDeleteMenu === todo.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] min-w-[100px]">
                            <button
                              onClick={() => handleEditTodo(todo)}
                              className="w-full px-3 py-1.5 text-left text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" />
                              수정
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="w-full px-3 py-1.5 text-left text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add SubTask Input - 카드 하단 */}
                    {showAddSubTask === todo.id && !todo.completed && (
                      <div className="px-2.5 pb-2.5">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newSubTaskText}
                            onChange={(e) => setNewSubTaskText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addSubTask(todo.id);
                                setShowAddSubTask(null);
                              }
                            }}
                            placeholder="서브태스크 입력..."
                            autoFocus
                            className="flex-1 px-2 py-1.5 text-[12px] rounded-lg border border-gray-200 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            onClick={() => {
                              addSubTask(todo.id);
                              setShowAddSubTask(null);
                            }}
                            className="px-2.5 py-1.5 bg-purple-500 text-white rounded-lg text-[11px] font-medium"
                          >
                            추가
                          </button>
                          <button
                            onClick={() => {
                              setShowAddSubTask(null);
                              setNewSubTaskText("");
                            }}
                            className="px-2 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-[11px]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SubTasks */}
                  {todo.expanded && hasSubTasks && (
                    <div className="ml-8 mt-1 space-y-1">
                      {todo.subTasks!.map((subTask) => (
                        <div
                          key={subTask.id}
                          className="bg-white/50 rounded-lg p-2 flex items-center gap-2"
                        >
                          <button
                            onClick={() => toggleSubTask(todo.id, subTask.id)}
                            className="flex-shrink-0"
                          >
                            {subTask.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-gray-300" />
                            )}
                          </button>
                          <p
                            className={`text-[12px] flex-1 ${
                              subTask.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            }`}
                          >
                            {subTask.title}
                          </p>
                        </div>
                      ))}
                      {newSubTaskId === todo.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newSubTaskText}
                            onChange={(e) => setNewSubTaskText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSubTask(todo.id)}
                            placeholder="서브태스크 입력..."
                            autoFocus
                            className="flex-1 px-2 py-1 text-[12px] rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => addSubTask(todo.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded-lg text-[11px]"
                          >
                            추가
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewSubTaskId(todo.id)}
                          className="w-full py-1.5 text-[11px] text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          서브태스크 추가
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* SubTasks */}
                {todo.expanded && hasSubTasks && (
                  <div className="ml-8 mt-1 space-y-1">
                    {todo.subTasks!.map((subTask) => (
                      <div
                        key={subTask.id}
                        className="bg-white/50 rounded-lg p-2 flex items-center gap-2"
                      >
                        <button
                          onClick={() => toggleSubTask(todo.id, subTask.id)}
                          className="flex-shrink-0"
                        >
                          {subTask.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                        </button>
                        <p
                          className={`text-[12px] flex-1 ${
                            subTask.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          {subTask.title}
                        </p>
                      </div>
                    ))}
                    {newSubTaskId === todo.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newSubTaskText}
                          onChange={(e) => setNewSubTaskText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSubTask(todo.id)}
                          placeholder="서브태스크 입력..."
                          autoFocus
                          className="flex-1 px-2 py-1 text-[12px] rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => addSubTask(todo.id)}
                          className="px-2 py-1 bg-blue-500 text-white rounded-lg text-[11px]"
                        >
                          추가
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setNewSubTaskId(todo.id)}
                        className="w-full py-1.5 text-[11px] text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        서브태스크 추가
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowInlineQuickAdd(true)}
        className="fixed bottom-[calc(var(--app-bottom-space)+12px)] right-4 sm:right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showInlineQuickAdd && (
        <div className="fixed bottom-[calc(var(--app-bottom-space)+92px)] left-4 right-4 z-40 sm:left-auto sm:right-6 sm:w-[420px]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm p-3">
            <p className="text-[11px] text-gray-600 mb-2">빠른 할일 입력 (기본: 오늘/업무/프로젝트 없음)</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickTodoTitle}
                onChange={(e) => setQuickTodoTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickAddTodo()}
                onBlur={handleQuickAddTodo}
                placeholder="할일을 입력하세요..."
                autoFocus
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-[14px]"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowAddModal(true)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                title="상세 설정"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">완료된 할일 모두 삭제</h2>
            <p className="text-[14px] text-gray-600 mb-6">
              완료된 할일 {todos.filter(t => t.completed).length}개를 모두 삭제하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAllCompleted}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Modal */}
      {showAddModal && (
        <ModalPortal>
          <div className="modal-backdrop bg-black/50 flex items-end justify-center">
            <div className="modal-sheet bg-white rounded-t-3xl w-full max-w-md h-[min(90dvh,760px)] pb-0 flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-gray-900">새 할일</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  할일
                </label>
                <input
                  ref={newTodoTitleRef}
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => {
                    setNewTodo({ ...newTodo, title: e.target.value });
                    if (newTodoError) setNewTodoError("");
                  }}
                  onFocus={ensureFieldVisibleOnFocus}
                  placeholder="할일을 입력하세요"
                  aria-invalid={Boolean(newTodoError)}
                  className={modalFieldClass}
                />
                {newTodoError && (
                  <p className="mt-1.5 text-[12px] text-red-500">{newTodoError}</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  카테고리
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] text-gray-600">카테고리 관리:</span>
                  <button
                    onClick={() => setShowCategoryManage(!showCategoryManage)}
                    className="h-9 px-3 rounded-xl bg-gray-100 text-gray-600 text-[11px] font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    {showCategoryManage ? "닫기" : "편집"}
                  </button>
                </div>

                {/* Category Management */}
                {showCategoryManage && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl space-y-2">
                    {todoCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        {editingCategory === cat ? (
                          <>
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              onFocus={ensureFieldVisibleOnFocus}
                              className="flex-1 px-2 py-1 text-[12px] rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (editingCategoryName.trim() && editingCategoryName !== cat) {
                                  updateTodoCategory(cat, editingCategoryName);
                                }
                                setEditingCategory(null);
                                setEditingCategoryName("");
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded-lg text-[10px]"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditingCategoryName("");
                              }}
                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg text-[10px]"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-[12px] text-gray-700">{cat}</span>
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setEditingCategoryName(cat);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px]"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`"${cat}" 카테고리를 삭제하시겠습니까?\n이 카테고리를 사용하는 할일은 "기타"로 변경됩니다.`)) {
                                  deleteTodoCategory(cat);
                                }
                              }}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px]"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {todoCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewTodo({ ...newTodo, category: cat })}
                      className={`${modalChipClass} ${
                        newTodo.category === cat
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {showCategoryInput ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                        onFocus={ensureFieldVisibleOnFocus}
                        placeholder="카테고리명"
                        autoFocus
                        className="px-2 py-1 text-[12px] rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 w-24"
                      />
                      <button
                        onClick={addCategory}
                        className="px-2 py-1 bg-blue-500 text-white rounded-lg text-[11px]"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => {
                          setShowCategoryInput(false);
                          setNewCategoryName("");
                        }}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg text-[11px]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCategoryInput(true)}
                      className={`${modalChipClass} bg-gray-100 text-gray-400 flex items-center gap-1`}
                    >
                      <Plus className="w-3 h-3" />
                      추가
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    시간
                  </label>
                  <input
                    type="time"
                    value={newTodo.time}
                    onChange={(e) =>
                      setNewTodo({
                        ...newTodo,
                        time: e.target.value,
                        notificationEnabled: e.target.value ? newTodo.notificationEnabled : false,
                      })
                    }
                    onFocus={ensureFieldVisibleOnFocus}
                    className={modalFieldClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    우선순위
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                    className={modalFieldClass}
                  >
                    <option value="high">높음</option>
                    <option value="medium">중간</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  알림
                </label>
                <button
                  type="button"
                  disabled={!newTodo.time}
                  onClick={async () => {
                    if (!newTodo.time) return;
                    if (!newTodo.notificationEnabled) {
                      const granted = await requestNotificationPermission();
                      if (!granted) return;
                    }
                    setNewTodo({ ...newTodo, notificationEnabled: !newTodo.notificationEnabled });
                  }}
                  className={`w-full h-11 px-4 rounded-xl border-2 text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
                    !newTodo.time
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : newTodo.notificationEnabled
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {newTodo.notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  {newTodo.notificationEnabled ? "알림 켜짐" : "알림 꺼짐 (기본)"}
                </button>
                {!newTodo.time && (
                  <p className="text-[11px] text-gray-400 mt-1">시간을 먼저 설정하면 알림을 켤 수 있어요.</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  마감일
                </label>
                <div className="flex flex-wrap gap-2">
                  {["오늘", "내일", "이번주"].map((date) => (
                    <button
                      key={date}
                      onClick={() => setNewTodo({ ...newTodo, dueDate: date })}
                      className={`${modalChipClass} ${
                        newTodo.dueDate === date
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  프로젝트 (선택)
                </label>
                <select
                  value={newTodo.projectId}
                  onChange={(e) => setNewTodo({ ...newTodo, projectId: e.target.value })}
                  className={modalFieldClass}
                >
                  <option value="">프로젝트 없음</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="shrink-0 sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur px-5 pt-3 pb-[calc(14px+var(--safe-area-bottom)+var(--keyboard-inset))]">
              <button
                onClick={handleAddTodo}
                disabled={!newTodo.title.trim() || isAddingTodo}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isAddingTodo ? "추가 중..." : "추가하기"}
              </button>
            </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Edit Todo Modal */}
      {showEditModal && editingTodo && (
        <ModalPortal>
          <div className="modal-backdrop bg-black/50 flex items-end justify-center">
            <div className="modal-sheet bg-white rounded-t-3xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-gray-900">할일 수정</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTodo(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 overscroll-contain">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  할일
                </label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  onFocus={ensureFieldVisibleOnFocus}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  카테고리
                </label>
                <div className="flex gap-2 flex-wrap">
                  {todoCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditingTodo({ ...editingTodo, category: cat })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                        editingTodo.category === cat
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    시간
                  </label>
                  <input
                    type="time"
                    value={editingTodo.time || ''}
                    onChange={(e) =>
                      setEditingTodo({
                        ...editingTodo,
                        time: e.target.value,
                        notificationEnabled: e.target.value ? editingTodo.notificationEnabled : false,
                      })
                    }
                    onFocus={ensureFieldVisibleOnFocus}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    우선순위
                  </label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px]"
                  >
                    <option value="high">높음</option>
                    <option value="medium">중간</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  알림
                </label>
                <button
                  type="button"
                  disabled={!editingTodo.time}
                  onClick={async () => {
                    if (!editingTodo.time) return;
                    if (!editingTodo.notificationEnabled) {
                      const granted = await requestNotificationPermission();
                      if (!granted) return;
                    }
                    setEditingTodo({ ...editingTodo, notificationEnabled: !editingTodo.notificationEnabled });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border-2 text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${
                    !editingTodo.time
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : editingTodo.notificationEnabled
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {editingTodo.notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  {editingTodo.notificationEnabled ? "알림 켜짐" : "알림 꺼짐 (기본)"}
                </button>
                {!editingTodo.time && (
                  <p className="text-[11px] text-gray-400 mt-1">시간을 먼저 설정하면 알림을 켤 수 있어요.</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  프로젝트 (선택)
                </label>
                <select
                  value={editingTodo.projectId || ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-[13px]"
                >
                  <option value="">프로젝트 없음</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white/95 backdrop-blur px-6 pt-3 pb-[calc(12px+var(--safe-area-bottom))]">
              <button
                onClick={handleUpdateTodo}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
              >
                수정하기
              </button>
            </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Project Manage Modal */}
      {showProjectManage && (
        <ProjectManageModal
          onClose={() => setShowProjectManage(false)}
        />
      )}
    </div>
  );
}
