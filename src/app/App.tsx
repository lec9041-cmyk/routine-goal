import { useCallback, useState } from "react";
import { MainDashboard } from "./components/MainDashboard";
import { TodoScreen } from "./components/TodoScreen";
import { GoalRoutineScreen } from "./components/GoalRoutineScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { BottomTabBar } from "./components/BottomTabBar";
import { DataProvider } from "./context/DataContext";

type ScreenId = "home" | "todos" | "goals-routines" | "calendar";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("home");
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleNavigate = useCallback(
    (screen: ScreenId, options?: { openAddModal?: boolean; date?: Date }) => {
      setCurrentScreen(screen);
      setShouldOpenAddModal(options?.openAddModal || false);

      if (options?.date) {
        setSelectedDate(options.date);
      }

      if (options?.openAddModal) {
        setTimeout(() => setShouldOpenAddModal(false), 100);
      }
    },
    []
  );

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
      <div className="app-shell bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <main className="app-scroll">{renderScreen()}</main>
        <BottomTabBar currentScreen={currentScreen} onNavigate={handleNavigate} />
      </div>
    </DataProvider>
  );
}
