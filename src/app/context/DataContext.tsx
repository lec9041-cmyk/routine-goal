import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

// Create context with undefined initial value
const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial data
const initialTodos: Todo[] = [];

const initialGoals: Goal[] = [];

const initialRoutines: Routine[] = [];

const initialProjects: Project[] = [];

const getRoutineTrackedCount = (routine: Routine) => {
  if (routine.frequency === 'weekly') {
    return routine.weeklyCount ?? 0;
  }

  if (routine.frequency === 'monthly') {
    return routine.monthlyCount ?? 0;
  }

  return routine.currentCount;
};

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('routiner-todos');
    return saved ? JSON.parse(saved) : initialTodos;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('routiner-goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('routiner-routines');
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('routiner-projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [todoCategories, setTodoCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('routiner-todo-categories');
    return saved ? JSON.parse(saved) : ["업무", "개인", "학습", "건강", "기타"];
  });

  const [goalCategories, setGoalCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('routiner-goal-categories');
    return saved ? JSON.parse(saved) : ["건강", "학습", "업무", "개인", "기타"];
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
    setRoutines(prev => [...prev, routine]);
    
    if (routine.linkedGoalId) {
      const trackedCount = getRoutineTrackedCount(routine);
      setGoals(prev => prev.map(g => {
        if (g.id === routine.linkedGoalId) {
          const linkedRoutine: LinkedRoutine = {
            id: routine.id,
            title: routine.title,
            icon: routine.icon,
            currentProgress: (trackedCount / routine.targetCount) * 100,
            targetCount: routine.targetCount,
            currentCount: trackedCount,
            frequency: routine.frequency,
            trackingType: routine.trackingType,
            selectedDays: routine.selectedDays,
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
        updatedRoutine = { ...r, ...updates };
        return updatedRoutine;
      }
      return r;
    }));
    
    setGoals(prev => prev.map(g => ({
      ...g,
      linkedRoutines: g.linkedRoutines.map(lr => {
        if (lr.id === id) {
          const targetCount = updates.targetCount ?? lr.targetCount;
          const trackedCount = updatedRoutine ? getRoutineTrackedCount(updatedRoutine) : (updates.currentCount ?? lr.currentCount);
          return {
            ...lr,
            title: updates.title ?? lr.title,
            icon: updates.icon ?? lr.icon,
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
    let updatedRoutine: Routine | null = null;
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        if (r.frequency === 'weekly') {
          const nextCount = Math.min((r.weeklyCount ?? 0) + 1, r.targetCount);
          updatedRoutine = { ...r, weeklyCount: nextCount };
          return updatedRoutine;
        }

        if (r.frequency === 'monthly') {
          const nextCount = Math.min((r.monthlyCount ?? 0) + 1, r.targetCount);
          updatedRoutine = { ...r, monthlyCount: nextCount };
          return updatedRoutine;
        }

        const nextCount = Math.min(r.currentCount + 1, r.targetCount);
        updatedRoutine = { ...r, currentCount: nextCount };
        return updatedRoutine;
      }
      return r;
    }));
    
    setGoals(prev => prev.map(g => ({
      ...g,
      linkedRoutines: g.linkedRoutines.map(lr => {
        if (lr.id === id) {
          const nextCount = updatedRoutine
            ? getRoutineTrackedCount(updatedRoutine)
            : Math.min(lr.currentCount + 1, lr.targetCount);
          return {
            ...lr,
            currentCount: nextCount,
            currentProgress: (nextCount / lr.targetCount) * 100,
          };
        }
        return lr;
      })
    })));
  };

  const toggleRoutineForDate = (id: string, dateString: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const completedDates = r.completedDates || [];
        const index = completedDates.indexOf(dateString);
        const newCompletedDates = index > -1 
          ? completedDates.filter(d => d !== dateString)
          : [...completedDates, dateString];
        return { ...r, completedDates: newCompletedDates };
      }
      return r;
    }));
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
