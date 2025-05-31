import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Terminal, LightbulbIcon, CheckCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

interface ShellChallengeProps {
  challenge: Challenge;
}

const ShellChallenge = ({ challenge }: ShellChallengeProps) => {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([
    "Welcome to Terminal Explorer!",
    "Find the hidden flag by navigating through the file system.",
    "Type 'help' to see available commands."
  ]);
  const [showHint, setShowHint] = useState(false);
  const { markChallengeCompleted, hasCompletedChallenge } = useData();
  const { token, isAuthenticated } = useAuth();

  const isCompleted = hasCompletedChallenge(challenge.id);

  useEffect(() => {
    // If the challenge is already completed, show success message
    if (isCompleted) {
      setHistory(prev => [
        ...prev,
        "Challenge already completed!",
        "FLAG{shell_master_2023}"
      ]);
    }
  }, [isCompleted]);

  // Mock file system structure
  const fileSystem = {
    "/": {
      "home": {
        "user": {
          "documents": {
            "secret.txt": "Try looking in the hidden directories!"
          },
          "downloads": {},
          ".hidden": {
            ".secret": {
              "flag.txt": "FLAG{shell_master_2023}"
            }
          }
        }
      },
      "var": {
        "log": {
          "system.log": "System running normally. No issues detected."
        }
      }
    }
  };

  const handleCommand = () => {
    if (!command.trim() || isCompleted) return;

    const newHistory = [...history, `$ ${command}`];

    // Process command
    const lcCommand = command.toLowerCase().trim();

    if (lcCommand === "help") {
      newHistory.push(
        "Available commands:",
        "ls - List directory contents",
        "cd [dir] - Change directory",
        "cat [file] - Display file contents",
        "pwd - Print working directory",
        "find [filename] - Search for files",
        "grep [pattern] [file] - Search for patterns in files",
        "clear - Clear terminal"
      );
    } else if (lcCommand === "ls -la" || lcCommand.includes("hidden")) {
      newHistory.push("Found hidden directory: .hidden");
    } else if (lcCommand.includes("find") && lcCommand.includes("flag")) {
      newHistory.push("Searching for flag files...", "/home/user/.hidden/.secret/flag.txt");
    } else if (lcCommand.includes("cat") && lcCommand.includes("flag.txt")) {
      newHistory.push("FLAG{shell_master_2023}");
      handleSuccess();
    } else if (lcCommand === "clear") {
      setHistory([]);
      setCommand("");
      return;
    } else {
      // Generic response for simulation
      newHistory.push("Command executed. Try exploring more!");
    }

    setHistory(newHistory);
    setCommand("");
  };

  const handleSuccess = () => {
    console.log("ShellChallenge: isAuthenticated =", isAuthenticated, "token =", token);
    // Only complete the challenge if it hasn't been completed yet
    if (!isCompleted) {
      if (!isAuthenticated || !token) {
        toast.error("You must be logged in to submit the challenge.");
        return;
      }
      // Pass the flag as solution string to markChallengeCompleted
      markChallengeCompleted(challenge.id, "FLAG{shell_master_2023}").then(() => {
        toast.success("Challenge completed! Your score has been updated.");
      }).catch(() => {
        toast.error("Failed to update challenge completion.");
      });
    }
  };

  return (
    <div className="bg-terminal-black border border-terminal-green rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-terminal-green" />
          <h2 className="text-xl font-bold text-terminal-green">Terminal Explorer</h2>
          {isCompleted && (
            <span className="bg-green-600 bg-opacity-20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </span>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHint(!showHint)}
          className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
        >
          <LightbulbIcon className="h-4 w-4 mr-2" />
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>
      </div>

      {showHint && (
        <div className="bg-terminal-green bg-opacity-10 border border-terminal-green border-opacity-30 rounded p-4 mb-4">
          <p className="text-terminal-green text-sm">{challenge.hint || "Try using ls, cd, and cat commands to explore the file system. Don't forget to look for hidden files and directories!"}</p>
        </div>
      )}

      <div className="bg-terminal-black border border-terminal-green rounded h-80 overflow-y-auto p-4 font-mono mb-4">
        {history.map((line, index) => (
          <div key={index} className="text-terminal-green whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-grow">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommand();
            }}
            className="bg-transparent border-terminal-green text-terminal-green font-mono"
            placeholder="Type your command..."
            disabled={isCompleted}
          />
        </div>
        <Button 
          onClick={handleCommand}
          className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
          disabled={isCompleted}
        >
          Run
        </Button>
      </div>
    </div>
  );
};

export default ShellChallenge;
