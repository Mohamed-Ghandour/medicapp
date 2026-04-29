import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { Bot, User, Send, X, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadHistory = () => {
    if (loaded) return;
    setIsLoading(true);
    api.get('/chatbot/history')
      .then((r) => {
        const history = r.data.slice().reverse().map((item) => ([
          { from: 'user', text: item.question, id: `q-${item.id}` },
          { from: 'bot', text: item.reponse, id: `r-${item.id}` },
        ])).flat();
        setMessages(history.length > 0 ? history : [welcome()]);
      })
      .catch(() => setMessages([welcome()]))
      .finally(() => { setIsLoading(false); setLoaded(true); });
  };

  const welcome = () => ({
    from: 'bot',
    text: "Hello! I'm your MedicApp assistant. Ask me anything about booking appointments, finding doctors, or using the platform.",
    id: 'welcome',
  });

  const handleOpen = () => {
    setIsOpen(true);
    loadHistory();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages((prev) => [...prev, { from: 'user', text: q, id: Date.now() }]);
    setIsSending(true);
    try {
      const r = await api.post('/chatbot/ask', { question: q });
      setMessages((prev) => [...prev, { from: 'bot', text: r.data.reponse, id: `bot-${r.data.id}` }]);
    } catch {
      toast.error('Failed to get a response');
      setMessages((prev) => [...prev, { from: 'bot', text: 'Sorry, I encountered an error. Please try again.', id: `err-${Date.now()}` }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">Ai Agent</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-primary-500 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    msg.from === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {msg.from === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isSending}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 bg-slate-50"
            />
            <Button type="submit" disabled={isSending || !input.trim()} size="icon">
              {isSending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Toggle assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};
