'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import GasBotMessage from '@/components/GasBotMessage';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
  /** Kept in the conversation history sent to the API, but not drawn as a bubble. */
  hidden?: boolean;
};

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hi! I'm GasBot 👋 I'm here to help you with GasHub — your fuel price intelligence app for Davao City. Ask me anything or pick a question below!",
};

const FAQ_PROMPTS = [
  'How do I update fuel prices?',
  'Do I need to create an account?',
  'Where can I download the app?',
  'How does the app verify price updates?',
  'Can I update prices from home?',
  'What map features does the app use?',
];

const ROBOT_ASSISTANT_ICON = '/assets/icons/robot-assistant.svg';
const STREAM_DELAY_MS = 30;
// Long answers (station cards) are revealed in bigger chunks so any reply finishes streaming in ~2s.
const MAX_STREAM_TICKS = 70;

const INITIAL_FOLLOW_UPS = [
  'How does GasHub predict fuel prices?',
  'How do I contribute a price update?',
  'Where can I download GasHub?',
];

export default function GasBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { ...INITIAL_MESSAGE, followUps: INITIAL_FOLLOW_UPS },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    };
  }, []);

  const [showFAQs, setShowFAQs] = useState(false);

  const streamAssistantMessage = (content: string, followUps: string[]) =>
    new Promise<void>((resolve) => {
      const tokens = content.match(/\S+\s*/g) ?? [content];
      const tokensPerTick = Math.max(1, Math.ceil(tokens.length / MAX_STREAM_TICKS));
      const assistantMessage: Message = { role: 'assistant', content: '' };
      let currentToken = 0;

      setMessages((prev) => [
        ...prev.filter((m) => m.content !== '__loading__'),
        assistantMessage,
      ]);

      const typeNextToken = () => {
        currentToken = Math.min(tokens.length, currentToken + tokensPerTick);
        const streamedContent = tokens.slice(0, currentToken).join('');

        setMessages((prev) => {
          const next = [...prev];
          const lastMessage = next[next.length - 1];

          if (lastMessage?.role === 'assistant') {
            next[next.length - 1] = {
              ...lastMessage,
              content: streamedContent,
              followUps: currentToken === tokens.length ? followUps : undefined,
            };
          }

          return next;
        });

        if (currentToken < tokens.length) {
          streamTimeoutRef.current = setTimeout(typeNextToken, STREAM_DELAY_MS);
          return;
        }

        streamTimeoutRef.current = null;
        resolve();
      };

      streamTimeoutRef.current = setTimeout(typeNextToken, STREAM_DELAY_MS);
    });

  const hideFollowUps = (items: Message[]) =>
    items.map((message) =>
      message.followUps ? { ...message, followUps: undefined } : message
    );

  const sendToAPI = async (history: Message[], backgroundPrompt?: string) => {
    setIsLoading(true);
    const apiMessages = backgroundPrompt
      ? [...history, { role: 'user', content: backgroundPrompt }]
      : history;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok) throw new Error('API error');
      const data: Message = await res.json();
      await streamAssistantMessage(data.content, data.followUps ?? []);
    } catch {
      await streamAssistantMessage('Sorry, I had trouble connecting. Please try again.', [
        'Do you want me to try that same question again?',
        'Would you like to ask a shorter version?',
        'Are you asking about prices, maps, or downloads?',
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitUserPrompt = (text: string) => {
    if (isLoading) return;
    const userMessage: Message = { role: 'user', content: text };
    const loadingMessage: Message = { role: 'assistant', content: '__loading__' };
    const history = [
      ...hideFollowUps(messages.filter((m) => m.content !== '__loading__')),
      userMessage,
    ];
    const updated = [...history, loadingMessage];
    setMessages(updated);
    setShowFAQs(false);
    sendToAPI(history);
  };

  const submitFollowUpPrompt = (text: string) => {
    if (isLoading) return;
    const loadingMessage: Message = { role: 'assistant', content: '__loading__' };
    // Keep the tapped suggestion in the stored history (hidden from the UI) so the model always
    // sees a proper user -> assistant alternation and keeps context on the next turn.
    const followUpMessage: Message = { role: 'user', content: text, hidden: true };
    const history = [
      ...hideFollowUps(messages.filter((m) => m.content !== '__loading__')),
      followUpMessage,
    ];

    setIsLoading(true);
    setShowFAQs(false);
    setMessages([...history, loadingMessage]);
    sendToAPI(history);
  };

  const handleFAQClick = (text: string) => {
    submitUserPrompt(text);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    submitUserPrompt(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[26rem] max-h-[78vh] flex flex-col rounded-2xl chatbot-window overflow-hidden"
          role="dialog"
          aria-label="GasBot chat window"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <img
                  src={ROBOT_ASSISTANT_ICON}
                  alt=""
                  className="h-7 w-7 object-contain"
                  aria-hidden="true"
                />
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
            {messages.map((msg, i) => {
              const isStreamingMessage =
                isLoading &&
                msg.role === 'assistant' &&
                msg.content !== '__loading__' &&
                !msg.followUps &&
                i === messages.length - 1;

              if (msg.hidden) return null;

              return (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-end justify-start gap-2'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      <img
                        src={ROBOT_ASSISTANT_ICON}
                        alt=""
                        className="h-6 w-6 object-contain"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {msg.content === '__loading__' ? (
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                        <span className="text-caption text-muted-foreground ml-1">
                          GasBot is thinking
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`min-w-0 rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'max-w-[80%] bg-primary text-primary-foreground rounded-br-sm'
                          : 'max-w-[calc(100%-2.25rem)] bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <GasBotMessage
                        content={msg.content}
                        role={msg.role}
                        showCursor={isStreamingMessage}
                      />
                      {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5 border-t border-border/70 pt-2">
                          {msg.followUps.map((prompt) => (
                            <button
                              key={prompt}
                              type="button"
                              onClick={() => submitFollowUpPrompt(prompt)}
                              disabled={isLoading}
                              className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-left text-caption font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
              <Icon
                name={showFAQs ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                size={20}
                variant="solid"
              />
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
              <Icon
                name="PaperAirplaneIcon"
                size={16}
                variant="solid"
                className="text-primary-foreground"
              />
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
          <img
            src={ROBOT_ASSISTANT_ICON}
            alt=""
            className="h-9 w-9 object-contain"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
