
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Send, Loader } from 'lucide-react';
import { apiService, ChatMessage, FollowUpQuestion } from '@/services/api';
import SuggestedQuestions from './SuggestedQuestions';
import ChartViewer from './ChartViewer';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setFollowUpQuestions([]);
    setChartData(null);

    try {
      const response = await apiService.sendChatMessage(input, messages);
      
      setMessages((prev) => [...prev, response.message]);
      
      if (response.followUpQuestions) {
        setFollowUpQuestions(response.followUpQuestions);
      }
      
      if (response.chartData) {
        setChartData(response.chartData);
      }
    } catch (error) {
      toast.error('Failed to get response', {
        description: 'Please try again.'
      });
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: FollowUpQuestion) => {
    setInput(question.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <div className="rounded-full bg-assistant-surface p-6 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-assistant-primary h-10 w-10"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <h3 className="font-medium text-lg">How can I help you?</h3>
            <p className="max-w-sm mt-2">
              Upload documents and ask questions about them. I'll analyze them and provide insights.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div 
                className={cn(
                  message.role === 'user' ? 'user-bubble' : 'assistant-bubble'
                )}
              >
                <div className="flex items-center mb-1">
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 mr-2">
                      <div className={cn(
                        "flex items-center justify-center h-full w-full text-xs font-medium",
                        message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-assistant-primary text-white"
                      )}>
                        {message.role === 'user' ? 'U' : 'AI'}
                      </div>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <span className="text-xs ml-auto opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="mt-1 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
              
              {message.role === 'assistant' && message.id === messages[messages.length - 1].id && (
                <>
                  {chartData && (
                    <ChartViewer 
                      chartType={chartData.type} 
                      chartData={chartData} 
                      onChartGenerated={(newChartData) => setChartData(newChartData)} 
                    />
                  )}
                  
                  {followUpQuestions.length > 0 && (
                    <SuggestedQuestions 
                      questions={followUpQuestions} 
                      onQuestionClick={handleQuestionClick} 
                      className="ml-2" 
                    />
                  )}
                </>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="assistant-bubble flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-assistant-primary animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-assistant-primary animate-pulse delay-150" />
            <div className="w-2 h-2 rounded-full bg-assistant-primary animate-pulse delay-300" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            className="shrink-0" 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
