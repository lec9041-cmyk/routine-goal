import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRoutineCountForPeriod } from '../utils/routineProgress';
import { toDateKey } from '../utils/dateUtils';

// Types
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  color: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Todo {
  id: string;
  title: string;
  category: string;
  time?: string;
  notificationEnabled?: boolean;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  subTasks?: SubTask[];
  expanded?: boolean;
  projectId?: string;
}

export interface LinkedRoutine {
  id: string;
  title: string;
  icon: string;
  currentProgress: number;
  targetCount: number;
  currentCount: number;
  frequency?: "daily" | "weekly" | "monthly";
  trackingType?: "count" | "days";
  selectedDays?: number[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  color: string;
  linkedRoutines: LinkedRoutine[];
  expanded?: boolean;
  subGoals?: Goal[];
  parentGoalId?: string;
}

export interface Routine {
  id: string;
  title: string;
  icon: string;
  time?: string;
  notificationEnabled?: boolean;
  frequency: "daily" | "weekly" | "monthly";
  targetCount: number;
  currentCount: number;
  trackingType: "count" | "days";
  linkedGoalId?: string;
  color: string;
  selectedDays?: number[];
  completedDays?: number[];
  streak?: number;
  completedDates?: string[];
  category?: string;
  weeklyCount?: number;
  monthlyCount?: number;
  bestStreak?: number;
  timeOfDay?: "morning" | "afternoon" | "evening" | "anytime";
  repeatType?: "forever" | "period";
  startDate?: string;
  endDate?: string;
  scheduleType?: "count" | "specific";
  specificDays?: number[];
}

// Context type
export interface DataContextType {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  deleteCompletedTodos: () => void;
  toggleTodo: (id: string) => void;
  
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  incrementRoutine: (id: string) => void;
  toggleRoutineForDate: (id: string, dateString: string) => void;
  
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  todoCategories: string[];
  addTodoCategory: (category: string) => void;
  updateTodoCategory: (oldName: string, newName: string) => void;
  deleteTodoCategory: (category: string) => void;

  goalCategories: string[];
  addGoalCategory: (category: string) => void;
  updateGoalCategory: (oldName: string, newName: string) => void;
  deleteGoalCategory: (category: string) => void;

  resetAllData: () => void;
}

// Create context with undefined initial value
const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial data
const initialTodos: Todo[] = [];

const initialGoals: Goal[] = [];

const initialRoutines: Routine[] = [];

const initialProjects: Project[] = [];

const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);

  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved) as T;
  } catch {
    console.warn(`[DataContext] Failed to parse localStorage key: ${key}`);
    localStorage.removeItem(key);
    return fallback;
  }
};

const normalizeCompletedDates = (completedDates: string[] = []) => {
  return Array.from(new Set(completedDates)).sort((a, b) => a.localeCompare(b));
};

const getRoutineTrackedCount = (routine: Routine, referenceDate: Date = new Date()) => {
  return getRoutineCountForPeriod(routine, referenceDate);
};

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    return loadFromLocalStorage('routiner-todos', initialTodos);
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    return loadFromLocalStorage('routiner-goals', initialGoals);
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    return loadFromLocalStorage('routiner-routines', initialRoutines);
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    return loadFromLocalStorage('routiner-projects', initialProjects);
  });

  const [todoCategories, setTodoCategories] = useState<string[]>(() => {
    return loadFromLocalStorage('routiner-todo-categories', ["업무", "개인", "학습", "건강", "기타"]);
  });

  const [goalCategories, setGoalCategories] = useState<string[]>(() => {
    return loadFromLocalStorage('routiner-goal-categories', ["건강", "학습", "업무", "개인", "기타"]);
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('routiner-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('routiner-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('routiner-routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('routiner-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('routiner-todo-categories', JSON.stringify(todoCategories));
  }, [todoCategories]);

  useEffect(() => {
    localStorage.setItem('routiner-goal-categories', JSON.stringify(goalCategories));
  }, [goalCategories]);

  // Todo functions
  const addTodo = (todo: Todo) => {
    setTodos(prev => [...prev, todo]);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const deleteCompletedTodos = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Goal functions
  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Routine functions
  const addRoutine = (routine: Routine) => {
    const normalizedRoutine = {
      ...routine,
      completedDates: normalizeCompletedDates(routine.completedDates),
    };

    setRoutines(prev => [...prev, normalizedRoutine]);
    
    if (normalizedRoutine.linkedGoalId) {
      const trackedCount = getRoutineTrackedCount(normalizedRoutine);
      setGoals(prev => prev.map(g => {
        if (g.id === normalizedRoutine.linkedGoalId) {
          const linkedRoutine: LinkedRoutine = {
            id: normalizedRoutine.id,
            title: normalizedRoutine.title,
            icon: normalizedRoutine.icon,
            currentProgress: (trackedCount / normalizedRoutine.targetCount) * 100,
            targetCount: normalizedRoutine.targetCount,
            currentCount: trackedCount,
            frequency: normalizedRoutine.frequency,
            trackingType: normalizedRoutine.trackingType,
            selectedDays: normalizedRoutine.selectedDays,
          };
          return {
            ...g,
            linkedRoutines: [...g.linkedRoutines, linkedRoutine]
          };
        }
        return g;
      }));
    }
  };

  const updateRoutine = (id: string, updates: Partial<Routine>) => {
    let updatedRoutine: Routine | null = null;
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        updatedRoutine = {
          ...r,
          ...updates,
          completedDates: normalizeCompletedDates(updates.completedDates ?? r.completedDates),
        };
        return updatedRoutine;
      }
      return r;
    }));
    
    setGoals(prev => prev.map(g => ({
      ...g,
      linkedRoutines: g.linkedRoutines.map(lr => {
        if (lr.id === id) {
          const targetCount = updates.targetCount ?? lr.targetCount;
          const trackedCount = updatedRoutine ? getRoutineTrackedCount(updatedRoutine) : lr.currentCount;
          return {
            ...lr,
            title: updates.title ?? lr.title,
            icon: updates.icon ?? lr.icon,
            frequency: updates.frequency ?? lr.frequency,
            trackingType: updates.trackingType ?? lr.trackingType,
            currentCount: trackedCount,
            targetCount,
            currentProgress: (trackedCount / targetCount) * 100,
            selectedDays: updates.selectedDays ?? lr.selectedDays,
          };
        }
        return lr;
      })
    })));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    
    setGoals(prev => prev.map(g => ({
      ...g,
      linkedRoutines: g.linkedRoutines.filter(lr => lr.id !== id)
    })));
  };

  const incrementRoutine = (id: string) => {
    const todayKey = toDateKey(new Date());

    setRoutines(prev => {
      const updatedRoutines = prev.map(r => {
        if (r.id !== id) return r;

        const completedDates = normalizeCompletedDates(r.completedDates);
        if (completedDates.includes(todayKey)) {
          return r;
        }

        return { ...r, completedDates: normalizeCompletedDates([...completedDates, todayKey]) };
      });

      setGoals(currentGoals => currentGoals.map(g => ({
        ...g,
        linkedRoutines: g.linkedRoutines.map(lr => {
          const updatedRoutine = updatedRoutines.find(r => r.id === lr.id);
          if (!updatedRoutine) {
            return lr;
          }

          const currentCount = getRoutineTrackedCount(updatedRoutine);
          return {
            ...lr,
            currentCount,
            currentProgress: (currentCount / lr.targetCount) * 100,
          };
        })
      })));

      return updatedRoutines;
    });
  };

  const toggleRoutineForDate = (id: string, dateString: string) => {
    setRoutines(prev => {
      const updatedRoutines = prev.map(r => {
        if (r.id !== id) {
          return r;
        }

        const completedDates = normalizeCompletedDates(r.completedDates);
        const hasDate = completedDates.includes(dateString);
        const toggledDates = hasDate
          ? completedDates.filter(d => d !== dateString)
          : [...completedDates, dateString];

        return {
          ...r,
          completedDates: normalizeCompletedDates(toggledDates),
        };
      });

      setGoals(currentGoals => currentGoals.map(g => ({
        ...g,
        linkedRoutines: g.linkedRoutines.map(lr => {
          const updatedRoutine = updatedRoutines.find(r => r.id === lr.id);
          if (!updatedRoutine) {
            return lr;
          }

          const currentCount = getRoutineTrackedCount(updatedRoutine);
          return {
            ...lr,
            currentCount,
            currentProgress: (currentCount / lr.targetCount) * 100,
          };
        })
      })));

      return updatedRoutines;
    });
  };

  // Project functions
  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Todo Category functions
  const addTodoCategory = (category: string) => {
    if (!todoCategories.includes(category)) {
      setTodoCategories(prev => [...prev, category]);
    }
  };

  const updateTodoCategory = (oldName: string, newName: string) => {
    setTodoCategories(prev => prev.map(c => c === oldName ? newName : c));
    setTodos(prev => prev.map(t => t.category === oldName ? { ...t, category: newName } : t));
  };

  const deleteTodoCategory = (category: string) => {
    setTodoCategories(prev => prev.filter(c => c !== category));
    setTodos(prev => prev.map(t => t.category === category ? { ...t, category: "기타" } : t));
  };

  // Goal Category functions
  const addGoalCategory = (category: string) => {
    if (!goalCategories.includes(category)) {
      setGoalCategories(prev => [...prev, category]);
    }
  };

  const updateGoalCategory = (oldName: string, newName: string) => {
    setGoalCategories(prev => prev.map(c => c === oldName ? newName : c));
    setGoals(prev => prev.map(g => g.category === oldName ? { ...g, category: newName } : g));
  };

  const deleteGoalCategory = (category: string) => {
    setGoalCategories(prev => prev.filter(c => c !== category));
    setGoals(prev => prev.map(g => g.category === category ? { ...g, category: "기타" } : g));
  };

  const resetAllData = () => {
    setTodos(initialTodos);
    setGoals(initialGoals);
    setRoutines(initialRoutines);
    setProjects(initialProjects);
  };

  const value: DataContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    deleteCompletedTodos,
    toggleTodo,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    routines,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    incrementRoutine,
    toggleRoutineForDate,
    projects,
    addProject,
    updateProject,
    deleteProject,
    todoCategories,
    addTodoCategory,
    updateTodoCategory,
    deleteTodoCategory,
    goalCategories,
    addGoalCategory,
    updateGoalCategory,
    deleteGoalCategory,
    resetAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook to use the context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
