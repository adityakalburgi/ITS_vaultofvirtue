
import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Code, LightbulbIcon, Play, RotateCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CChallengeProps {
  challenge: Challenge;
}

const CChallenge = ({ challenge }: CChallengeProps) => {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [input, setInput] = useState("AAAAAAAAAAAAAAAAAAAAAA");
  const [output, setOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  
  const isCompleted = hasCompletedChallenge(challenge.id);
  
  useEffect(() => {
    // If the challenge is already completed, show success message
    if (isCompleted) {
      setOutput([
        "gcc -Wall -Wextra -o program program.c",
        "Program compiled successfully.",
        "> ./program",
        `Enter your input: ${input}`,
        `Input processed: ${input.substring(0, 9)}`,
        "Challenge already completed!"
      ]);
    }
  }, [isCompleted, input]);
  
  const handleRunCode = () => {
    // Simulate C code execution with buffer overflow detection
    
    setOutput(["Compiling C code..."]);
    
    // Simulate processing delay
    setTimeout(() => {
      const newOutput = ["gcc -Wall -Wextra -o program program.c"];
      
      if (code.includes("strncpy") && code.includes("sizeof(buffer)")) {
        // Correct solution using proper bounds checking
        newOutput.push("Program compiled successfully.");
        newOutput.push("> ./program");
        newOutput.push(`Enter your input: ${input}`);
        newOutput.push(`Input processed: ${input.substring(0, 9)}`);
        handleSuccess();
      } else if (code.includes("strcpy(buffer, input)")) {
        // Vulnerability still present
        newOutput.push("Program compiled with warnings.");
        newOutput.push("> ./program");
        newOutput.push(`Enter your input: ${input}`);
        newOutput.push("Input processed: AAAAAAAAA");
        newOutput.push("*** stack smashing detected ***: terminated");
        newOutput.push("Segmentation fault (core dumped)");
      } else {
        // Other attempt
        newOutput.push("Compilation finished with warnings.");
        newOutput.push("Warning: buffer overflow possible in function 'vulnerable_function'");
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
          <h2 className="text-xl font-bold text-terminal-green">Memory Corruption Challenge</h2>
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
          <p className="text-terminal-green text-sm">{challenge.hint || "Remember to check the size of the input before copying it to the buffer. Consider using strncpy() instead of strcpy()."}</p>
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
          
          <div className="relative h-80">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-black border border-terminal-green rounded p-4 font-mono text-terminal-green resize-none focus:outline-none focus:ring-1 focus:ring-terminal-green"
              spellCheck="false"
              readOnly={isCompleted}
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-terminal-green mb-1">Test Input:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-black border border-terminal-green rounded px-4 py-2 font-mono text-terminal-green"
                readOnly={isCompleted}
              />
              
              <Button 
                onClick={handleRunCode}
                className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
                disabled={isCompleted}
              >
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
            </div>
          </div>
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

export default CChallenge;
