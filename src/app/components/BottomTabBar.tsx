import { memo } from "react";
import { Home, CheckSquare, Target, Calendar } from "lucide-react";

type ScreenId = "home" | "todos" | "goals-routines" | "calendar";

interface BottomTabBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const tabs = [
  { id: "home" as const, label: "홈", icon: Home },
  { id: "todos" as const, label: "할일", icon: CheckSquare },
  { id: "goals-routines" as const, label: "목표·루틴", icon: Target },
  { id: "calendar" as const, label: "달력", icon: Calendar },
];

const BottomTabBarComponent = ({ currentScreen, onNavigate }: BottomTabBarProps) => {
  return (
    <nav className="bottom-tab-bar bg-white border-t border-gray-200">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
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
    </nav>
  );
};

export const BottomTabBar = memo(BottomTabBarComponent);
