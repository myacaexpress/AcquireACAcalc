
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, AlertTriangleIcon, MessageSquarePlus, User, Brain } from 'lucide-react';
import { askJohn, type AskJohnInput, type AskJohnOutput } from '@/ai/flows/ask-john-flow';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AskJohnChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const prePrompts = [
    "Carrier bonuses from 2024",
    "What is SEP?",
    "Do I need to wait till open enrollment?"
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim()) return;

    const newUserMessage: Message = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    const historyForGenkit = messages.map(msg => ({
        role: msg.sender === 'user' ? ('user' as const) : ('model'as const),
        parts: [{ text: msg.text }],
    }));

    setMessages(prev => [...prev, newUserMessage]);
    if (!queryText) {
        setInputValue('');
    }
    setIsLoading(true);
    setError(null);

    try {
      const flowInput: AskJohnInput = { query: textToSend, chatHistory: historyForGenkit };
      const result: AskJohnOutput = await askJohn(flowInput);
      
      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        sender: 'ai',
        text: result.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to get a response. Please try again.";
      setError(errorMessage);
      const aiErrorMessage: Message = {
        id: `${Date.now()}-ai-error`,
        sender: 'ai',
        text: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground border-b pb-3 flex items-center">
          <Brain className="mr-2 h-6 w-6 text-primary" />
          Ask John
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Brain size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={`p-3 rounded-lg max-w-[70%] text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card text-card-foreground border border-border rounded-bl-none'
                }`}
              >
                {msg.text.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
                <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={18}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 p-3">
              <Avatar className="h-8 w-8">
                 <AvatarFallback><Brain size={18}/></AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-muted shadow-md">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
           {messages.length === 0 && !isLoading && (
             <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                <MessageSquarePlus size={48} className="mx-auto mb-4" />
                <p className="text-lg">Ask me anything!</p>
                <p>How can I help you today?</p>
             </div>
           )}
        </ScrollArea>
        
        {error && (
          <div className="p-4 border-t border-border">
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-4 border-t border-border bg-background">
          <div className="flex flex-wrap gap-2 mb-3">
            {prePrompts.map(prompt => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-xs hover:bg-accent/50"
              >
                {prompt}
              </Button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your question to John..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
              aria-label="Chat input"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Send message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AskJohnChat;
