
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { upload } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';

const Chat = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Document AI Assistant - Chat</h1>
        
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </header>

      {/* Chat window */}
      <ChatWindow className="flex-1" />
    </div>
  );
};

export default Chat;
