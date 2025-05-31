
import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Code, LightbulbIcon, Play, RotateCw, CheckCircle, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface WebChallengeProps {
  challenge: Challenge;
}

const WebChallenge = ({ challenge }: WebChallengeProps) => {
  const [code, setCode] = useState(challenge.initialCode || '');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  
  const isCompleted = hasCompletedChallenge(challenge.id);
  
  useEffect(() => {
    // If the challenge is already completed, show success message
    if (isCompleted) {
      setOutput([
        "Challenge already completed!",
        "Login successful: admin",
        "Database contents:",
        "- User data extracted",
        "- Credit card information accessed",
        "- Sensitive records downloaded",
        "FLAG{sql_injection_master}"
      ]);
    }
  }, [isCompleted]);
  
  const handleSubmit = () => {
    setOutput(["Attempting login with provided credentials..."]);
    
    // Simulate processing delay
    setTimeout(() => {
      // Check if the SQL injection attempt would work
      const successfulInjections = [
        "' OR '1'='1", 
        "' OR 1=1 --", 
        "' OR '1'='1' --",
        "admin' --"
      ];
      
      if (successfulInjections.some(injection => 
          username.includes(injection) || 
          password.includes(injection))) {
        setOutput([
          "Login successful: admin",
          "Database contents:",
          "- User data extracted",
          "- Credit card information accessed",
          "- Sensitive records downloaded",
          "FLAG{sql_injection_master}"
        ]);
        
        handleSuccess();
      } else if (username === "admin" && password === "password") {
        setOutput([
          "Login successful: admin",
          "But you used a normal login instead of SQL injection.",
          "Try again with an injection attack to complete the challenge."
        ]);
      } else {
        setOutput([
          "Login failed.",
          "Query executed: SELECT * FROM users WHERE username = '" + 
          username + "' AND password = '" + password + "'",
          "Hint: This query looks vulnerable to injection."
        ]);
      }
    }, 1000);
  };

  const handleReset = () => {
    setUsername("");
    setPassword("");
    setCode(challenge.initialCode || '');
    setOutput([]);
  };

  const handleSuccess = () => {
    // Only complete the challenge if it hasn't been completed yet
    if (!isCompleted) {
      completeChallenge(challenge.id, challenge.points);
      toast.success(`Congratulations! You've earned ${challenge.points} points!`);
    }
  };

  return (
    <div className="bg-terminal-black border border-terminal-green rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-terminal-green" />
          <h2 className="text-xl font-bold text-terminal-green">Web Exploitation Challenge</h2>
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
          <p className="text-terminal-green text-sm">{challenge.hint}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-terminal-green font-medium">Vulnerable Code</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
              disabled={isCompleted}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="relative h-60">
            <textarea
              value={code}
              className="w-full h-full bg-black border border-terminal-green rounded p-4 font-mono text-terminal-green resize-none focus:outline-none focus:ring-1 focus:ring-terminal-green"
              spellCheck="false"
              readOnly={true}
            />
          </div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-terminal-green mb-2">Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-terminal-green rounded px-4 py-2 font-mono text-terminal-green"
                placeholder="Enter username with injection"
                disabled={isCompleted}
              />
            </div>
            
            <div>
              <label className="block text-terminal-green mb-2">Password:</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-terminal-green rounded px-4 py-2 font-mono text-terminal-green"
                placeholder="Enter password with injection"
                disabled={isCompleted}
              />
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full bg-terminal-green text-terminal-black hover:bg-opacity-80"
              disabled={isCompleted}
            >
              <Play className="h-4 w-4 mr-2" />
              Test Injection
            </Button>
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

export default WebChallenge;
