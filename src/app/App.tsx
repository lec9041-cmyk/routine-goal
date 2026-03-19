import { useState } from "react";
import { Home, CheckSquare, Target, Calendar } from "lucide-react";
import { MainDashboard } from "./components/MainDashboard";
import { TodoScreen } from "./components/TodoScreen";
import { GoalRoutineScreen } from "./components/GoalRoutineScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { DataProvider } from "./context/DataContext";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'todos' | 'goals-routines' | 'calendar'>('home');
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 9)); // March 9, 2026

  const handleNavigate = (screen: 'home' | 'todos' | 'goals-routines' | 'calendar', options?: { openAddModal?: boolean; date?: Date }) => {
    setCurrentScreen(screen);
    setShouldOpenAddModal(options?.openAddModal || false);
    
    if (options?.date) {
      setSelectedDate(options.date);
    }
    
    // 모달을 열고 나면 즉시 리셋 (다음 렌더링 사이클에서)
    if (options?.openAddModal) {
      setTimeout(() => setShouldOpenAddModal(false), 100);
    }
  };

  const tabs = [
    { id: "home" as const, label: "홈", icon: Home },
    { id: "todos" as const, label: "할일", icon: CheckSquare },
    { id: "goals-routines" as const, label: "목표·루틴", icon: Target },
    { id: "calendar" as const, label: "달력", icon: Calendar },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <MainDashboard onNavigate={handleNavigate} />;
      case 'todos':
        return <TodoScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case 'goals-routines':
        return <GoalRoutineScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case 'calendar':
        return <CalendarScreen onNavigate={handleNavigate} selectedDate={selectedDate} />;
      default:
        return <MainDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <DataProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                  <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DataProvider>
  );
}
