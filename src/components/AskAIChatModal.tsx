import React, { useState, useRef, useEffect } from 'react';
import { Institution, ChatMessage } from '../types/institution';
import { askInstitutionAI } from '../services/api';
import { Bot, Send, X, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';

interface AskAIChatModalProps {
  institution: Institution;
  isOpen: boolean;
  onClose: () => void;
  onSimulateShortcut?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'How much energy are we saving?',
  'What is our current air quality & AQI index?',
  'How many parking bays and EV ports are free?',
  'Which machine has high vibration or service due?',
  'What is our carbon footprint and Net-Zero progress?',
  'Are all fire hydrants and exits cleared?',
  'What is our solar irradiance and weather forecast?',
  'Where are we wasting water or tanks full?',
  'Which dustbin will overflow first?',
  'What is our overall sustainability score?',
];

export const AskAIChatModal: React.FC<AskAIChatModalProps> = ({
  institution,
  isOpen,
  onClose,
  onSimulateShortcut,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your dedicated Facility Intelligence AI for **${institution.name}** (${institution.location.city}, ${institution.location.state}).\n\nI have loaded your profile with **${institution.buildings.length} configured buildings**, **${institution.metrics.occupancyCount.toLocaleString()} occupants**, live waste bin fill telemetry, and current utility baselines. Ask me anything about your energy, water, waste, or sustainability performance!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataHighlights: [
        { label: 'Campus Energy', value: `${institution.energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh/mo` },
        { label: 'Sustainability Score', value: `${institution.sustainabilityScore.overall}/100` },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (userQuestion: string) => {
    const query = userQuestion.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askInstitutionAI(institution, query, messages);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataHighlights: response.highlights,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Based on current telemetry for **${institution.name}**: Total monthly power is ${institution.energyAnalytics.totalMonthlyKWh.toLocaleString()} kWh, with ${institution.energyAnalytics.savedKWh.toLocaleString()} kWh saved. Laboratory daily water usage is ${institution.waterAnalytics.totalDailyLiters.toLocaleString()} L/day.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#01040e]/85 backdrop-blur-md">
      <div className="bg-[#081635] border border-blue-900/60 rounded-2xl w-full max-w-2xl h-[85vh] max-h-[750px] flex flex-col shadow-2xl shadow-blue-950/70 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#050f24] border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Ask AI About Your Institution</h3>
                <span className="text-[10px] text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                  Gemini 3.8 Flash Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                Trained on {institution.name} ({institution.buildings.length} blocks, {institution.metrics.occupancyCount.toLocaleString()} occupants)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2 bg-[#030a1c] border-b border-blue-900/40 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] text-blue-300/80 font-semibold uppercase whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Quick Prompts:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs whitespace-nowrap px-2.5 py-1 bg-[#091a3e] hover:bg-[#102d64] text-slate-200 border border-blue-900/50 rounded-full transition-colors flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-[#050f24] text-blue-400 border border-blue-900/50'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-[#050f24] border border-blue-900/50 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Highlights chips if returned */}
                {msg.dataHighlights && msg.dataHighlights.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-blue-900/40 flex flex-wrap gap-2">
                    {msg.dataHighlights.map((hl, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 bg-[#08183a] border border-blue-900/50 rounded-lg text-[11px] font-mono text-blue-300 flex items-center gap-1.5"
                      >
                        <span className="text-slate-400 font-sans">{hl.label}:</span>
                        <strong className="text-white">{hl.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#050f24] text-blue-400 border border-blue-900/50 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#050f24] border border-blue-900/50 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Consulting campus sensor metrics & baselines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#050f24] border-t border-blue-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about ${institution.name}'s energy, water, tanks, or bins...`}
              className="flex-1 px-4 py-2.5 bg-[#03091c] border border-blue-900/50 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
