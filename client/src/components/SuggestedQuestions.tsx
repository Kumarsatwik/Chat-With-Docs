
import { Button } from '@/components/ui/button';
import { FollowUpQuestion } from '@/services/api';
import { cn } from '@/lib/utils';

interface SuggestedQuestionsProps {
  questions: FollowUpQuestion[];
  onQuestionClick: (question: FollowUpQuestion) => void;
  className?: string;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ 
  questions, 
  onQuestionClick,
  className
}) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-2", className)}>
      <p className="text-xs text-muted-foreground mb-2">Suggested follow-up questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            size="sm"
            className="text-xs bg-background hover:bg-assistant-surface/50 text-left justify-start h-auto py-1.5"
            onClick={() => onQuestionClick(question)}
          >
            {question.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
