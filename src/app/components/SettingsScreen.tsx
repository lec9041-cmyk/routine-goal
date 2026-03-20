import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useData } from "../context/DataContext";
import { Switch } from "./ui/switch";

const APP_NAME = "Routine Goal";
const APP_VERSION = "v1.0.0";
const FEEDBACK_EMAIL = "feedback@routine-goal.app";

export function SettingsScreen() {
  const { resetAllData } = useData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleResetData = () => {
    const shouldReset = window.confirm("모든 목표/루틴/할일 데이터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.");

    if (!shouldReset) {
      return;
    }

    resetAllData();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 pt-12 pb-28 max-w-md mx-auto">
        <h1 className="text-[22px] font-bold text-gray-900 mb-5">설정</h1>

        <div className="bg-white/95 rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-4 py-4 flex items-center justify-between gap-3 min-h-[72px]">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900">알림 설정</p>
              <p className="text-[12px] text-gray-500 mt-1">알림 표시 여부만 저장됩니다.</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} aria-label="알림 설정" />
          </div>

          <div className="h-px bg-gray-100" />

          <button
            type="button"
            onClick={handleResetData}
            className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left min-h-[72px]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900">데이터 초기화</p>
              <p className="text-[12px] text-gray-500 mt-1">모든 데이터 삭제</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="h-px bg-gray-100" />

          <div className="px-4 py-4 flex items-center justify-between gap-3 min-h-[72px]">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900">앱 정보</p>
              <p className="text-[12px] text-gray-500 mt-1">{APP_NAME}</p>
            </div>
            <span className="text-[13px] text-gray-500 font-medium">{APP_VERSION}</span>
          </div>

          <div className="h-px bg-gray-100" />

          <a
            href={`mailto:${FEEDBACK_EMAIL}`}
            className="px-4 py-4 flex items-center justify-between gap-3 min-h-[72px] no-underline"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900">문의/피드백</p>
              <p className="text-[12px] text-gray-500 mt-1">기본 메일 앱으로 연결됩니다.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
