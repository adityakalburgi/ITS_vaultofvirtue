
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Terminal, Clock, Shield } from "lucide-react";
import MatrixBackground from "@/components/MatrixBackground";

const Guidelines = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startTimer } = useAuth();
  const navigate = useNavigate();

  const handleAccept = () => {
    console.log("Guidelines: handleAccept called");
    setIsLoading(true);
    // Start the timer when user accepts guidelines
    startTimer();
    console.log("Guidelines: startTimer called");
    // Delay navigation slightly to ensure state updates propagate
    setTimeout(() => {
      console.log("Guidelines: navigating to /challenges");
      navigate("/challenges");
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MatrixBackground />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-terminal-black border border-terminal-green rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-terminal-green bg-opacity-20 p-3 rounded-full">
                <Terminal className="h-8 w-8 text-terminal-green" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-terminal-green mb-4 text-center">Vault of Virtue Challenge Guidelines</h1>
            
            <div className="space-y-6 text-terminal-green mb-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Time Limit</h3>
                  <p className="text-opacity-80">You have exactly 1 hour to complete all challenges. The timer will start once you click the "I Accept" button below.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Tab Switching Restriction</h3>
                  <p className="text-opacity-80">Switching browser tabs or windows during the challenge is strictly prohibited. You are allowed a maximum of {3} tab switches. Exceeding this limit will result in immediate disqualification.</p>
                </div>
              </div>
              
              <div className="border-t border-terminal-green border-opacity-30 pt-4">
                <h3 className="font-semibold mb-2">Additional Rules:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Do not attempt to bypass the tab detection system</li>
                  <li>Complete challenges honestly without external help</li>
                  <li>Submit your solutions before the timer expires</li>
                  <li>Points are awarded based on challenge difficulty</li>
                </ul>
              </div>
            </div>
            
            <Button
              onClick={handleAccept}
              className="w-full bg-terminal-green text-terminal-black hover:bg-opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "I Accept These Guidelines"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
