import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Upload } from "lucide-react";
import UploadPanel from "@/components/UploadPanel";

const UploadPage = () => {


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="p-6 border-b flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Document AI Assistant
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Upload Your Documents
            </h2>
            <p className="text-muted-foreground text-lg">
              Upload your PDF documents and start chatting with your AI
              assistant
            </p>
          </div>

          <div className="bg-card rounded-lg border p-8 shadow-lg">
            <UploadPanel onUploadComplete={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
