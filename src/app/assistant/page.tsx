'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ecoPlannerAssistant, type EcoPlannerInput, type EcoPlannerOutput } from '@/ai/flows/eco-planner-assistant';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sourceLinks?: string[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you be more eco-friendly today?', sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse: EcoPlannerOutput = await ecoPlannerAssistant({ userQuery: currentInput });
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        text: aiResponse.recommendation, 
        sender: 'ai',
        sourceLinks: aiResponse.sourceLinks 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't connect to the assistant.";
      toast({
        variant: 'destructive',
        title: 'Assistant Error',
        description: errorMessage,
      });
      // Optionally add an error message to the chat
      const errorAiMessage: Message = { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting right now. Please try again later.", sender: 'ai' };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">AI Eco-Planner Assistant</h1>
      
      <Alert className="mb-4 sm:mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Your Eco-Friendly Guide!</AlertTitle>
        <AlertDescription>
          Ask for tips on reducing waste, planning sustainable events, or finding eco-friendly product alternatives.
        </AlertDescription>
      </Alert>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Chat with EcoBot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="font-bold mr-2 text-sm">
                    {msg.sender === 'user' ? 
                      <User className="inline h-3 w-3 sm:h-4 sm:w-4 relative -top-px" /> : 
                      <Bot className="inline h-3 w-3 sm:h-4 sm:w-4 relative -top-px" />}
                  </span>
                  <span className="text-sm sm:text-base">{msg.text}</span>
                  {msg.sender === 'ai' && msg.sourceLinks && msg.sourceLinks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                      <p className="text-xs font-semibold mb-1">Sources:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {msg.sourceLinks.map((link, index) => (
                          <li key={index} className="text-xs">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground/80 break-all">
                              {link.length > 50 ? link.substring(0, 50) + "..." : link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t flex gap-1 sm:gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for eco-friendly advice..."
              disabled={isLoading}
              aria-label="Chat input"
              className="text-sm sm:text-base"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2">
              <Send className="h-4 w-4 sm:mr-0" /> <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
