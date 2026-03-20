import { useState } from "react";
import { GoalsScreen } from "./GoalsScreen";
import { RoutineScreen } from "./RoutineScreen";
import { HelpCircle, X } from "lucide-react";

type ScreenId = 'home' | 'todos' | 'goals-routines';

interface GoalRoutineScreenProps {
  onNavigate: (screen: ScreenId, options?: { openAddModal?: boolean }) => void;
  shouldOpenAddModal?: boolean;
}

export function GoalRoutineScreen({ onNavigate, shouldOpenAddModal }: GoalRoutineScreenProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'routines'>('goals');
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Tab Switch Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm p-1 rounded-full max-w-xs border border-white/50">
              <button
                onClick={() => setActiveTab('goals')}
                className={`flex-1 py-2.5 px-4 rounded-full text-[13px] font-semibold transition-all ${
                  activeTab === 'goals'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                목표
              </button>
              <button
                onClick={() => setActiveTab('routines')}
                className={`flex-1 py-2.5 px-4 rounded-full text-[13px] font-semibold transition-all ${
                  activeTab === 'routines'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                루틴
              </button>
            </div>
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-7 h-7 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Pass hideHeader prop to child screens */}
      <div>
        {activeTab === 'goals' ? (
          <GoalsScreen onNavigate={onNavigate} shouldOpenAddModal={shouldOpenAddModal} hideHeader={true} />
        ) : (
          <RoutineScreen onNavigate={onNavigate} shouldOpenAddModal={shouldOpenAddModal} hideHeader={true} />
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-900">사용 가이드</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-[12px] font-semibold text-purple-900 mb-1">목표 탭</p>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    목표에 루틴을 직접 연결하여 관리할 수 있습니다. 
                    루틴의 진행률이 목표의 진행률이 됩니다.
                    만다라트 보기로 시각적 관리가 가능합니다.
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-[12px] font-semibold text-orange-900 mb-1">루틴 탭</p>
                  <p className="text-[11px] text-orange-700 leading-relaxed">
                    일일/주간/월간 루틴을 설정하고 목표와 연결할 수 있습니다.
                    루틴을 추가할 때 연결할 목표를 선택하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
