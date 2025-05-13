'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you be more eco-friendly today?', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    // In a real app, you would call your Genkit flow here:
    // const aiResponseText = await callEcoPlannerAssistantFlow(inputValue);
    setTimeout(() => {
      const aiResponseText = `I'm still learning! For now, I can tell you that "${userMessage.text}" is an interesting topic. Soon, I'll be able to give you eco-friendly advice!`;
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <h1 className="text-3xl font-bold text-primary mb-6">AI Eco-Planner Assistant</h1>
      
      <Alert className="mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Your Eco-Friendly Guide!</AlertTitle>
        <AlertDescription>
          Ask for tips on reducing waste, planning sustainable events, or finding eco-friendly product alternatives. This feature is under development.
        </AlertDescription>
      </Alert>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" /> Chat with EcoBot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-grow p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="font-bold mr-2">{msg.sender === 'user' ? <User className="inline h-4 w-4" /> : <Bot className="inline h-4 w-4" />}</span>
                  {msg.text}
                </div>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for eco-friendly advice..."
              disabled={isLoading}
              aria-label="Chat input"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? 'Sending...' : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
