import { useCallback, useState } from "react";
import { MainDashboard } from "./components/MainDashboard";
import { TodoScreen } from "./components/TodoScreen";
import { GoalRoutineScreen } from "./components/GoalRoutineScreen";
import { BottomTabBar } from "./components/BottomTabBar";
import { DataProvider } from "./context/DataContext";
import { ReminderManager } from "./components/ReminderManager";
import { SettingsScreen } from "./components/SettingsScreen";

type ScreenId = "home" | "todos" | "goals-routines" | "settings";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>("home");
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);

  const handleNavigate = useCallback((screen: ScreenId, options?: { openAddModal?: boolean }) => {
      setCurrentScreen(screen);
      setShouldOpenAddModal(options?.openAddModal || false);

      if (options?.openAddModal) {
        setTimeout(() => setShouldOpenAddModal(false), 100);
      }
    }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <MainDashboard onNavigate={handleNavigate} />;
      case "todos":
        return <TodoScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case "goals-routines":
        return <GoalRoutineScreen onNavigate={handleNavigate} shouldOpenAddModal={shouldOpenAddModal} />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <MainDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <DataProvider>
      <ReminderManager />
      <div className="app-shell bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <main className="app-scroll">{renderScreen()}</main>
        <BottomTabBar currentScreen={currentScreen} onNavigate={handleNavigate} />
      </div>
    </DataProvider>
  );
}
