
import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Code, LightbulbIcon, Play, RotateCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PythonChallengeProps {
  challenge: Challenge;
}

const PythonChallenge = ({ challenge }: PythonChallengeProps) => {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [output, setOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  
  const isCompleted = hasCompletedChallenge(challenge.id);
  
  useEffect(() => {
    // If the challenge is already completed, show success message
    if (isCompleted) {
      setOutput(["Python 3.9.7", "HELLO WORLD!", "Challenge already completed!"]);
    }
  }, [isCompleted]);

  const handleRunCode = () => {
    // In a real app, this would be sent to a backend for execution
    // For demo, we'll simulate output based on the code content
    
    setOutput(["Running Python code..."]);
    
    // Simulate processing delay
    setTimeout(() => {
      const newOutput = ["Python 3.9.7"];
      
      // Check if code defines a function named sum_two_numbers with a return statement adding two parameters
      const functionRegex = /def\s+sum_two_numbers\s*\(\s*\w+\s*,\s*\w+\s*\)\s*:\s*return\s+\w+\s*\+\s*\w+/;
      if (functionRegex.test(code)) {
        // Correct solution
        newOutput.push("Challenge completed!");
        newOutput.push("Points awarded: " + challenge.points);
        handleSuccess();
      } else {
        // Other attempt
        newOutput.push("Output: [garbled text]");
        newOutput.push("Tip: Check the function definition and return statement!");
      }
      
      setOutput(newOutput);
    }, 1000);
  };

  const handleResetCode = () => {
    setCode(challenge.initialCode || '');
    setOutput([]);
  };

  const handleSuccess = () => {
    // Only complete the challenge if it hasn't been completed yet
    if (!isCompleted) {
      completeChallenge(challenge.id, challenge.points);
    }
  };

  return (
    <div className="bg-terminal-black border border-terminal-green rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-terminal-green" />
          <h2 className="text-xl font-bold text-terminal-green">Python Puzzle</h2>
          {isCompleted && (
            <span className="bg-green-600 bg-opacity-20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHint(!showHint)}
            className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
          >
            <LightbulbIcon className="h-4 w-4 mr-2" />
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>
        </div>
      </div>
      
      {showHint && (
        <div className="bg-terminal-green bg-opacity-10 border border-terminal-green border-opacity-30 rounded p-4 mb-4">
          <p className="text-terminal-green text-sm">{challenge.hint || "Check how the characters are being shifted in the decryption function. The current shift might not be correct."}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-terminal-green font-medium">Code Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCode}
              className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
              disabled={isCompleted}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="relative h-96">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-black border border-terminal-green rounded p-4 font-mono text-terminal-green resize-none focus:outline-none focus:ring-1 focus:ring-terminal-green"
              spellCheck="false"
              readOnly={isCompleted}
            />
          </div>
          
          <Button 
            onClick={handleRunCode}
            className="mt-4 bg-terminal-green text-terminal-black hover:bg-opacity-80"
            disabled={isCompleted}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Code
          </Button>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-terminal-green font-medium mb-2">Output</h3>
          <div className="bg-black border border-terminal-green rounded h-96 p-4 font-mono text-terminal-green overflow-y-auto">
            {output.map((line, index) => (
              <div key={index} className="mb-1">{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonChallenge;
