import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { useData } from "../context/DataContext";
import { Switch } from "./ui/switch";
import { getCurrentUser, signInWithEmail, signOutUser, signUpWithEmail } from "../supabase";

const APP_NAME = "Routine Goal";
const APP_VERSION = "v1.0.0";
const FEEDBACK_EMAIL = "feedback@routine-goal.app";

type AuthMode = "signin" | "signup";

export function SettingsScreen() {
  const { resetAllData } = useData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const refreshCurrentUser = async () => {
    const { user, error } = await getCurrentUser();

    if (error) {
      setCurrentUserEmail(null);
      return;
    }

    setCurrentUserEmail(user?.email ?? null);
  };

  useEffect(() => {
    void refreshCurrentUser();
  }, []);

  const handleResetData = () => {
    const shouldReset = window.confirm("모든 목표/루틴/할일 데이터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.");

    if (!shouldReset) {
      return;
    }

    resetAllData();
  };

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setAuthMessage("");

    const action = authMode === "signin" ? signInWithEmail : signUpWithEmail;
    const { error } = await action(email.trim(), password);

    if (error) {
      setAuthMessage(error.message ?? "인증 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      return;
    }

    if (authMode === "signup") {
      setAuthMessage("회원가입 성공! 이메일 인증이 필요할 수 있습니다.");
    } else {
      setAuthMessage("로그인 성공!");
    }

    await refreshCurrentUser();
    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOutUser();

    if (error) {
      setAuthMessage(error.message ?? "로그아웃 중 오류가 발생했습니다.");
      return;
    }

    setAuthMessage("로그아웃 되었습니다.");
    setCurrentUserEmail(null);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 pt-12 pb-28 max-w-md mx-auto">
        <h1 className="text-[22px] font-bold text-gray-900 mb-5">설정</h1>

        <div className="bg-white/95 rounded-2xl overflow-hidden border border-gray-100">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left min-h-[72px]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-gray-900">계정 연동</p>
              <p className="text-[12px] text-gray-500 mt-1">
                {currentUserEmail ? `연결됨: ${currentUserEmail}` : "로그인 / 회원가입으로 계정을 연결하세요."}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="h-px bg-gray-100" />

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

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">계정 생성 / 연동</h2>
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  authMode === "signin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setAuthMode("signin")}
              >
                로그인
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  authMode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setAuthMode("signup")}
              >
                회원가입
              </button>
            </div>

            <label className="block text-sm text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3"
              placeholder="you@example.com"
            />

            <label className="block text-sm text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4"
              placeholder="6자 이상 입력"
            />

            {authMessage && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2 mb-3">{authMessage}</p>}

            <button
              type="button"
              onClick={handleAuthSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "처리 중..." : authMode === "signin" ? "로그인" : "회원가입"}
            </button>

            {currentUserEmail && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full mt-2 bg-gray-200 text-gray-800 rounded-lg py-2.5 text-sm font-semibold"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
