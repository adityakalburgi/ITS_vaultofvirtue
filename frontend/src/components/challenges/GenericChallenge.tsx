import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GenericChallengeProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    hint?: string;
    points: number;
    category: string;
    difficulty: string;
    imageUrl?: string; // Optional image URL
  };
}

const GenericChallenge = ({ challenge }: GenericChallengeProps) => {
  const [answer, setAnswer] = useState("");
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  const { isAuthenticated, token } = useAuth();

  const isCompleted = hasCompletedChallenge(challenge.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated || !token) {
      toast.error("You must be logged in to submit the challenge.");
      return;
    }
    if (isCompleted) {
      toast.success("Challenge already completed.");
      return;
    }
    if (!answer.trim()) {
      toast.error("Please enter an answer.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Call backend API to validate answer and mark challenge completed
      await completeChallenge(challenge.id, answer.trim());
    } catch (error) {}
    finally {
      setIsSubmitting(false);
    }
  };

  // Remove answer from description if present
  const sanitizedDescription = challenge.description.replace(/Answer[:\-].*$/im, "").trim();

  return (
    <div className="bg-terminal-black border border-terminal-green rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-terminal-green mb-2">{challenge.title}</h2>
      <p className="text-terminal-green mb-4">{sanitizedDescription}</p>

      {/* Image section if imageUrl is provided */}
      {challenge.imageUrl && (
        <div className="mb-4">
          <img
            src={challenge.imageUrl}
            alt={`${challenge.title} image`}
            className="max-w-full rounded border border-terminal-green"
          />
        </div>
      )}

      {challenge.hint && (
        <div className="bg-terminal-green bg-opacity-10 border border-terminal-green rounded p-3 mb-4">
          <strong className="text-terminal-green">Hint: </strong>
          <span className="text-terminal-green">{challenge.hint}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer here"
          disabled={isCompleted || isSubmitting}
          className="bg-transparent border-terminal-green text-terminal-green"
        />
        <Button
          onClick={handleSubmit}
          disabled={isCompleted || isSubmitting}
          className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
        >
          Submit
        </Button>
      </div>

      {isCompleted && (
        <div className="mt-2 text-green-500 flex items-center">
          <CheckCircle className="mr-1" /> Challenge Completed
        </div>
      )}
    </div>
  );
};

export default GenericChallenge;
