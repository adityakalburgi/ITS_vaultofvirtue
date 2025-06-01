import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import GenericChallenge from "@/components/challenges/GenericChallenge";
import { toast } from "sonner";
import Timer from "@/components/Timer";

const ChallengePage = () => {
  const { id } = useParams<{ id: string }>();
  const { getChallengeById } = useData();
  const { isAuthenticated, hasCompletedChallenge, isSessionExpired } = useAuth();
  const navigate = useNavigate();

  let challenge = getChallengeById(id || "");
  const isCompleted = challenge ? hasCompletedChallenge(challenge.id) : false;

  // Sanitize challenge description to remove answers or sensitive info
  if (challenge && challenge.description) {
    // Remove any text starting with "Answer:" or "Answer -" till end of line
    challenge = {
      ...challenge,
      description: challenge.description.replace(/Answer[:\-].*$/im, "").trim()
    };
  }

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to access challenges");
      navigate("/login");
      return;
    }

    if (isSessionExpired) {
      toast.error("Your challenge session has expired!");
      navigate("/");
      return;
    }

    if (!challenge) {
      toast.error("Challenge not found");
      navigate("/challenges");
      return;
    }
  }, [isAuthenticated, isSessionExpired, challenge, navigate]);

  const handleBack = () => {
    navigate("/challenges");
  };

  if (!challenge || isSessionExpired) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Challenges
          </Button>

          <Timer />
        </div>

        <div className="bg-terminal-black border border-terminal-green rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-terminal-green">{challenge.title}</h1>

            {isCompleted && (
              <span className="bg-green-600 bg-opacity-20 text-green-500 px-3 py-1 rounded-full text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 bg-terminal-green bg-opacity-20 text-terminal-green text-sm rounded-full">
              {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
            </span>
            <span className="px-3 py-1 bg-terminal-green bg-opacity-20 text-terminal-green text-sm rounded-full">
              {challenge.difficulty}
            </span>
            <span className="px-3 py-1 bg-terminal-green bg-opacity-20 text-terminal-green text-sm rounded-full">
              {challenge.points} points
            </span>
          </div>
          <p className="text-terminal-green text-opacity-80 mb-6">{challenge.description}</p>
        </div>

        {/* Render GenericChallenge for all challenge types */}
        <GenericChallenge challenge={challenge} />
      </div>
    </div>
  );
};

export default ChallengePage;
