
import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, LightbulbIcon, Send, RotateCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BinaryChallengeProps {
  challenge: Challenge;
}

const BinaryChallenge = ({ challenge }: BinaryChallengeProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  
  // The secret flag
  const correctFlag = "FLAG{b1n4ry_hack3r}";
  
  const isCompleted = hasCompletedChallenge(challenge.id);
  
  useEffect(() => {
    // If the challenge is already completed, show success message
    if (isCompleted) {
      setInput(correctFlag);
      setOutput([
        "[*] Running binary with input: FLAG{b1n4ry_hack3r}",
        "[*] Checking authentication...",
        "[+] Authentication successful!",
        "[+] Access granted!",
        "[+] Flag verified: FLAG{b1n4ry_hack3r}",
        "Challenge already completed!"
      ]);
    }
  }, [isCompleted, correctFlag]);
  
  const handleSubmit = () => {
    if (isCompleted) return;
    
    setAttempts(attempts + 1);
    
    // Clear previous output
    setOutput([]);
    
    // Add new output
    const newOutput = [
      `[*] Running binary with input: ${input}`,
      "[*] Checking authentication..."
    ];
    
    // Simulate processing delay
    setTimeout(() => {
      if (input === correctFlag) {
        newOutput.push("[+] Authentication successful!");
        newOutput.push("[+] Access granted!");
        newOutput.push("[+] Flag verified: FLAG{b1n4ry_hack3r}");
        setOutput(newOutput);
        handleSuccess();
      } else {
        // Give hints based on how close they are
        let correctChars = 0;
        for (let i = 0; i < Math.min(input.length, correctFlag.length); i++) {
          if (input[i] === correctFlag[i]) {
            correctChars++;
          } else {
            break;
          }
        }
        
        newOutput.push("[-] Authentication failed!");
        
        // Provide more detailed feedback based on attempts
        if (attempts >= 3) {
          newOutput.push(`[*] Debug: First ${correctChars} characters match.`);
          if (input.length !== correctFlag.length) {
            newOutput.push(`[*] Debug: Expected length ${correctFlag.length}, got ${input.length}.`);
          }
        }
        
        setOutput(newOutput);
      }
    }, 500);
  };
  
  const handleReset = () => {
    if (isCompleted) return;
    setInput("");
    setOutput([]);
    setAttempts(0);
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
          <ShieldAlert className="h-5 w-5 text-terminal-green" />
          <h2 className="text-xl font-bold text-terminal-green">Binary Breaker</h2>
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
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
            disabled={isCompleted}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
      
      {showHint && (
        <div className="bg-terminal-green bg-opacity-10 border border-terminal-green border-opacity-30 rounded p-4 mb-4">
          <p className="text-terminal-green text-sm">{challenge.hint || "The binary compares the flag to your input character by character. Try to determine each character one by one."}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1 bg-black border border-terminal-green rounded p-4">
          <h3 className="text-terminal-green font-medium mb-2">Output</h3>
          <div className="h-64 font-mono text-terminal-green overflow-y-auto">
            {output.map((line, index) => (
              <div key={index} className="mb-1">{line}</div>
            ))}
            {output.length === 0 && !isCompleted && (
              <div className="text-terminal-green opacity-50">
                Run the binary to see output...
              </div>
            )}
            {/* Add blinking cursor when there's output */}
            {output.length > 0 && !isCompleted && (
              <span className="inline-block w-2 h-4 bg-terminal-green animate-text-blink"></span>
            )}
          </div>
        </div>
        
        <div className="order-1 lg:order-2">
          <div className="mb-8">
            <h3 className="text-terminal-green font-medium mb-2">Binary Analysis</h3>
            <div className="bg-black border border-terminal-green rounded p-4">
              <p className="text-terminal-green text-sm mb-4">
                This binary requires a specific input to bypass authentication. Analyzing the disassembled code reveals a character-by-character comparison algorithm.
              </p>
              <pre className="bg-terminal-black p-2 overflow-x-auto text-xs text-terminal-green opacity-70">
{`0x00401000 <+0>:    push   %rbp
0x00401001 <+1>:    mov    %rsp,%rbp
0x00401004 <+4>:    sub    $0x20,%rsp
0x00401008 <+8>:    mov    %rdi,-0x18(%rbp)
0x0040100c <+12>:   movl   $0x0,-0x4(%rbp)
0x00401013 <+19>:   jmp    0x401025 <check+37>
0x00401015 <+21>:   mov    -0x4(%rbp),%eax
0x00401018 <+24>:   mov    -0x18(%rbp),%rdx
0x0040101c <+28>:   add    %rdx,%rax
0x0040101f <+31>:   movzbl (%rax),%eax
0x00401022 <+34>:   cmp    SECRET,%al
0x00401025 <+37>:   cmpb   $0x0,(%rax)
0x00401028 <+40>:   jne    0x401015 <check+21>
0x0040102a <+42>:   mov    $0x1,%eax
0x0040102f <+47>:   leave  
0x00401030 <+48>:   ret`}</pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-terminal-green font-medium mb-2">Input Payload</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter flag value..."
                className="flex-grow bg-black border border-terminal-green rounded px-4 py-2 text-terminal-green"
                readOnly={isCompleted}
              />
              
              <Button 
                onClick={handleSubmit}
                className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
                disabled={isCompleted}
              >
                <Send className="h-4 w-4 mr-2" />
                Run
              </Button>
            </div>
            
            <div className="mt-4 text-terminal-green opacity-70 text-sm">
              <p>Attempts: {attempts}/10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryChallenge;
