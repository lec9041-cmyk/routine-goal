import { useState } from "react";
import { ChevronLeft, Send, Sparkles, Lightbulb, TrendingUp, Calendar } from "lucide-react";

type ScreenId = 'home' | 'todos' | 'goals-routines' | 'ai';

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export function AIScreen({ onNavigate }: AIScreenProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "안녕하세요! 저는 루티너의 AI 플래너입니다. 일정 관리, 목표 설정, 생산성 향상을 도와드릴게요. 무엇을 도와드릴까요?",
      timestamp: new Date(),
      suggestions: [
        "오늘 할일 추천해줘",
        "이번 주 목표 정리",
        "루틴 분석해줘",
        "생산성 팁 알려줘",
      ],
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "좋은 질문이네요! 분석한 결과를 바탕으로 다음과 같이 제안드립니다:\n\n1. 오전에 집중력이 필요한 작업 배치\n2. 오후에는 미팅과 협업 작업\n3. 저녁에는 루틴과 자기계발\n\n이렇게 하루를 구성하면 더 효율적일 것 같아요!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const quickActions = [
    { icon: Lightbulb, label: "오늘 계획", color: "from-yellow-500 to-yellow-600" },
    { icon: TrendingUp, label: "생산성 분석", color: "from-green-500 to-green-600" },
    { icon: Calendar, label: "일정 정리", color: "from-blue-500 to-blue-600" },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 sticky top-0 z-10">
        <div className="px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h1 className="text-xl font-bold text-white">AI 플래너</h1>
            </div>
            <div className="w-9 h-9" />
          </div>
          <p className="text-white/90 text-[14px] text-center">
            스마트한 일정 관리를 도와드릴게요
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`flex-shrink-0 bg-gradient-to-br ${action.color} rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow-md transition-all`}
              >
                <Icon className="w-4 h-4 text-white" />
                <span className="text-white text-[13px] font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "ai" ? (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100">
                      <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-[12px] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-[80%]">
                    <p className="text-[14px] text-white leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-5 py-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="w-full bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              input.trim()
                ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-200"
            }`}
          >
            <Send className={`w-5 h-5 ${input.trim() ? "text-white" : "text-gray-400"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}