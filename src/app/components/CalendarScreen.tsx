import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Circle, CheckCircle2, Calendar as CalendarIcon, MoreHorizontal, X } from "lucide-react";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'calendar';

interface CalendarEvent {
  id: string;
  title: string;
  type: "todo" | "routine" | "goal" | "event";
  color: string;
  completed?: boolean;
}

interface CalendarScreenProps {
  onNavigate: (screen: ScreenId) => void;
  selectedDate?: Date;
}

export function CalendarScreen({ onNavigate, selectedDate: propSelectedDate }: CalendarScreenProps) {
  const [currentDate, setCurrentDate] = useState(propSelectedDate || new Date(2026, 2, 9));
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<CalendarEvent["type"]>("event");

  useEffect(() => {
    if (propSelectedDate) {
      setCurrentDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 오늘 날짜
  const today = new Date(2026, 2, 9);
  const todayDate = today.getDate();

  const colorByType: Record<CalendarEvent["type"], string> = {
    todo: "bg-blue-500",
    routine: "bg-orange-500",
    goal: "bg-green-500",
    event: "bg-purple-500",
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getEventChips = (day: number) => {
    const events = eventsByDate[getDateKey(day)] || [];
    return events;
  };

  // 선택된 날짜의 이벤트
  const selectedDayEvents = selectedDate ? eventsByDate[getDateKey(selectedDate)] || [] : [];

  const handleAddEvent = () => {
    if (!eventTitle.trim()) return;

    const targetDay = selectedDate ?? todayDate;
    const dateKey = getDateKey(targetDay);
    const newEvent: CalendarEvent = {
      id: `${Date.now()}`,
      title: eventTitle.trim(),
      type: eventType,
      color: colorByType[eventType],
    };

    setEventsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent],
    }));
    setSelectedDate(targetDay);
    setEventTitle("");
    setEventType("event");
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[24px] font-bold text-gray-900">집관적인 일정관리</h1>
          <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/50">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <p className="text-[14px] text-gray-600">모든 일정을 한눈에 확히 알다</p>
      </div>

      {/* Calendar Container */}
      <div className="px-5">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 p-4 mb-4 shadow-sm">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
              <CalendarIcon className="w-4 h-4 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={previousMonth}
                className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <h2 className="text-[16px] font-bold text-gray-900 min-w-[60px] text-center">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center">
                <span className={`text-[11px] font-semibold ${
                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-500"
                }`}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isToday = day === todayDate && currentDate.getMonth() === today.getMonth();
              const isSelected = day === selectedDate;
              const events = getEventChips(day);
              const hasMoreEvents = events.length > 2;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square rounded-lg p-1 flex flex-col items-start justify-start relative transition-all ${
                    isSelected
                      ? "bg-blue-100 ring-2 ring-blue-500"
                      : isToday
                      ? "bg-blue-200/50"
                      : "hover:bg-white/50"
                  }`}
                >
                  {/* 날짜 숫자 */}
                  <span className={`text-[13px] font-semibold mb-0.5 ${
                    isToday ? "text-blue-700" : "text-gray-800"
                  }`}>
                    {day}
                  </span>

                  {/* 이벤트 칩 (최대 2개) */}
                  <div className="w-full space-y-0.5">
                    {events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`${event.color} rounded px-1 py-0.5 text-white text-[7px] font-medium truncate leading-tight`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {hasMoreEvents && (
                      <div className="text-[7px] text-gray-500 font-medium px-1">
                        +{events.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 하단 이벤트 목록 (날짜 선택 시) */}
        {selectedDate && selectedDayEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 mb-3 px-1">
              {currentDate.getMonth() + 1}월 {selectedDate}일
            </h3>
            <div className="space-y-2">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/60 flex items-center gap-3"
                >
                  <div className={`w-1 h-10 rounded-full ${event.color}`} />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-gray-900">{event.title}</p>
                    <p className="text-[12px] text-gray-500 capitalize">{event.type}</p>
                  </div>
                  {event.completed !== undefined && (
                    event.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오늘 리스트 섹션 제목만 (내용은 제거) */}
        <div className="mt-6">
          <p className="text-[13px] text-gray-500 px-1">오늘</p>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-[calc(var(--app-bottom-space)+12px)] right-4 sm:right-6 w-14 h-14 rounded-full bg-blue-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5">
            <h3 className="text-[17px] font-bold text-gray-900 mb-3">일정 추가</h3>
            <p className="text-[12px] text-gray-500 mb-3">
              {currentDate.getMonth() + 1}월 {selectedDate ?? todayDate}일
            </p>
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              placeholder="이벤트 내용을 입력하세요"
              autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
            />
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as CalendarEvent["type"])}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4 bg-white"
            >
              <option value="event">일정</option>
              <option value="todo">할일</option>
              <option value="routine">루틴</option>
              <option value="goal">목표</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// X 아이콘 컴포넌트
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
