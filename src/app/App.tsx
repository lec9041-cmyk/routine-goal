import { memo, useState } from "react";
import { Home, CheckSquare, Target, Calendar } from "lucide-react";
import { MainDashboard } from "./components/MainDashboard";
import { TodoScreen } from "./components/TodoScreen";
import { GoalRoutineScreen } from "./components/GoalRoutineScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { DataProvider } from "./context/DataContext";

type Screen = "home" | "todos" | "goals-routines" | "calendar";
type NavigateOptions = { openAddModal?: boolean; date?: Date };

type BottomTabNavProps = {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
};

const tabs = [
  { id: "home" as const, label: "홈", icon: Home },
  { id: "todos" as const, label: "할일", icon: CheckSquare },
  { id: "goals-routines" as const, label: "목표·루틴", icon: Target },
  { id: "calendar" as const, label: "달력", icon: Calendar },
];

const BottomTabNav = memo(function BottomTabNav({ currentScreen, onNavigate }: BottomTabNavProps) {
  return (
    <nav className="bottom-tab-nav fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleNavigate = (screen: Screen, options?: NavigateOptions) => {
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

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <MainDashboard onNavigate={handleNavigate} />;
      case "todos":
        return <TodoScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case "goals-routines":
        return <GoalRoutineScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case "calendar":
        return <CalendarScreen onNavigate={handleNavigate} selectedDate={selectedDate} />;
      default:
        return <MainDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <DataProvider>
      <div className="app-shell flex min-h-[100dvh] flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <main className="app-scroll-container flex-1 overflow-y-auto">{renderScreen()}</main>

        <BottomTabNav currentScreen={currentScreen} onNavigate={(screen) => handleNavigate(screen)} />
      </div>
    </DataProvider>
  );
}
