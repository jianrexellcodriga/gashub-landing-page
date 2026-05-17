'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm GasBot 👋 I'm here to help you with GasHub — your fuel price intelligence app for Davao City. Ask me anything or pick a question below!",
};

const FAQ_PROMPTS = [
  'How do I update fuel prices?',
  'Do I need to create an account?',
  'Where can I download the app?',
  'How does the app verify price updates?',
  'Can I update prices from home?',
  'What map features does the app use?',
];

export default function GasBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const [showFAQs, setShowFAQs] = useState(false);

  const sendToAPI = async (history: Message[]) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error('API error');
      const data: Message = await res.json();
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.content !== '__loading__');
        return [...filtered, data];
      });
    } catch {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.content !== '__loading__');
        return [
          ...filtered,
          { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = (text: string) => {
    if (isLoading) return;
    const userMessage: Message = { role: 'user', content: text };
    const loadingMessage: Message = { role: 'assistant', content: '__loading__' };
    const updated = [...messages, userMessage, loadingMessage];
    setMessages(updated);
    setShowFAQs(false);
    sendToAPI([...messages, userMessage]);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMessage: Message = { role: 'user', content: trimmed };
    const loadingMessage: Message = { role: 'assistant', content: '__loading__' };
    const updated = [...messages, userMessage, loadingMessage];
    setMessages(updated);
    setInput('');
    setShowFAQs(false);
    sendToAPI([...messages, userMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] flex flex-col rounded-2xl chatbot-window overflow-hidden"
          role="dialog"
          aria-label="GasBot chat window"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Icon name="ChatBubbleLeftRightIcon" size={16} variant="solid" className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">GasBot</p>
                <p className="text-xs opacity-80">Fuel Price Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close chat"
            >
              <Icon name="XMarkIcon" size={18} className="text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 min-h-0 bg-white/95">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.content === '__loading__' ? (
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-caption text-muted-foreground ml-1">GasBot is thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-body-sm leading-relaxed ${
                      msg.role === 'user' ?'bg-primary text-primary-foreground rounded-br-sm' :'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Prompts */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-border bg-white/95 px-5 flex-shrink-0 ${showFAQs ? 'opacity-100 py-3' : 'opacity-0'}`}
            style={{ height: showFAQs ? '180px' : '0px' }}
          >
            <p className="text-caption text-muted-foreground mb-2 font-medium">Quick questions:</p>
            <div
              className="flex flex-wrap gap-1.5 overflow-y-auto scrollbar-thin"
              style={{ height: 'calc(100% - 28px)' }}
            >
              {FAQ_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleFAQClick(prompt)}
                  disabled={isLoading}
                  className="text-caption font-medium px-3 py-1.5 rounded-full border border-border bg-white hover:bg-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[32px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-white flex items-center gap-2">
            <button
              onClick={() => setShowFAQs(!showFAQs)}
              className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-container transition-transform active:scale-95 flex-shrink-0"
              aria-label={showFAQs ? 'Hide FAQs' : 'Show FAQs'}
            >
              <Icon name={showFAQs ? 'ChevronDownIcon' : 'ChevronUpIcon'} size={20} variant="solid" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onFocus={() => setShowFAQs(true)}
              onBlur={() => setTimeout(() => setShowFAQs(false), 150)}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask GasBot about GasHub app..."
              disabled={isLoading}
              className="flex-1 text-base placeholder:text-xs bg-muted rounded-md px-3 py-2 border border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground disabled:opacity-50 min-h-[40px]"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0"
              aria-label="Send message"
            >
              <Icon name="PaperAirplaneIcon" size={16} variant="solid" className="text-primary-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary-container transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isOpen ? 'Close GasBot' : 'Open GasBot'}
      >
        {isOpen ? (
          <Icon name="XMarkIcon" size={22} variant="solid" className="text-primary-foreground" />
        ) : (
          <Icon name="ChatBubbleLeftRightIcon" size={22} variant="solid" className="text-primary-foreground" />
        )}
      </button>
    </>
  );
}