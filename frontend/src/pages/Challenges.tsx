import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData, Challenge, ChallengeType } from "@/contexts/DataContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Terminal, Code, Network, Database, ShieldAlert, 
  Search, Filter, ArrowRight, CheckCircle, Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Timer from "@/components/Timer";
import { toast } from "sonner";

const ChallengeCard = ({ challenge, onClick, isCompleted }: { challenge: Challenge, onClick: () => void, isCompleted: boolean }) => {
  const getIcon = (type: ChallengeType) => {
    switch (type) {
      case "shell":
        return <Terminal className="h-5 w-5" />;
      case "python":
      case "c":
        return <Code className="h-5 w-5" />;
      case "network":
        return <Network className="h-5 w-5" />;
      case "binary":
        return <ShieldAlert className="h-5 w-5" />;
      case "web":
        return <Globe className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 bg-opacity-20 text-green-500";
      case "medium":
        return "bg-yellow-500 bg-opacity-20 text-yellow-500";
      case "hard":
        return "bg-red-500 bg-opacity-20 text-red-500";
      default:
        return "bg-blue-500 bg-opacity-20 text-blue-500";
    }
  };
  
  return (
    <div 
      className={`bg-terminal-black border ${isCompleted ? 'border-green-500' : 'border-terminal-green'} rounded-lg p-5 hover:border-terminal-green hover:shadow-[0_0_10px_rgba(33,250,44,0.3)] transition-all cursor-pointer ${isCompleted ? 'shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-full border ${isCompleted ? 'border-green-500' : 'border-terminal-green'} mr-3`}>
            {getIcon(challenge.type)}
          </div>
          <h3 className="text-lg font-semibold text-terminal-green">{challenge.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="bg-green-600 bg-opacity-20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </span>
          )}
          <Badge className={`uppercase text-xs ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </Badge>
        </div>
      </div>
      
      <p className="text-terminal-green text-opacity-70 mb-4 line-clamp-2">
        {challenge.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-terminal-green font-mono">{challenge.points} pts</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
        >
          {isCompleted ? 'View' : 'Start'} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Challenges = () => {
  const { challenges } = useData();
  const navigate = useNavigate();
  const { isAuthenticated, hasCompletedChallenge, isSessionExpired } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ChallengeType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Check for session expiration
  useEffect(() => {
    if (isSessionExpired && isAuthenticated) {
      toast.error("Your challenge session has expired!");
      navigate("/");
    }
  }, [isSessionExpired, isAuthenticated, navigate]);
  
  // Filter challenges based on search and filters
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || challenge.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const matchesCompletion = showCompleted || !hasCompletedChallenge(challenge.id);
    
    return matchesSearch && matchesType && matchesDifficulty && matchesCompletion;
  });
  
  const handleChallengeClick = (challengeId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (isSessionExpired) {
      toast.error("Your challenge session has expired!");
      return;
    }
    
    // Use Link navigation instead of imperatively calling
    navigate(`/challenge/${challengeId}`);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-terminal-green mb-4">Technical Challenges</h1>
          <p className="text-terminal-green text-opacity-70 max-w-2xl mx-auto">
            Test your skills with shell commands, debugging Python and C code, and capture the flag challenges.
          </p>
          {isAuthenticated && (
            <div className="mt-4 flex justify-center">
              <Timer />
            </div>
          )}
        </div>
        
        {/* Session expired message */}
        {isAuthenticated && isSessionExpired && (
          <div className="mb-8 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
            <h2 className="text-xl font-bold text-red-500 mb-2">Challenge Session Expired</h2>
            <p className="text-terminal-green">Your 1-hour challenge session has ended. Please log out and log back in to start a new session.</p>
          </div>
        )}
        
        {/* Only show content if session is not expired */}
        {(!isAuthenticated || !isSessionExpired) && (
          <>
            {/* Search and Filters */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative col-span-1 md:col-span-3 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terminal-green text-opacity-60" />
                <Input 
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                />
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-3 lg:col-span-2">
                <Filter className="h-5 w-5 text-terminal-green text-opacity-70" />
                <span className="text-sm text-terminal-green">Filter:</span>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("all")}
                    className={selectedType === "all" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    All Types
                  </Button>
                  <Button
                    variant={selectedType === "shell" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("shell")}
                    className={selectedType === "shell" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <Terminal className="mr-1 h-4 w-4" />
                    Shell
                  </Button>
                  <Button
                    variant={selectedType === "python" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("python")}
                    className={selectedType === "python" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <Code className="mr-1 h-4 w-4" />
                    Python
                  </Button>
                  <Button
                    variant={selectedType === "c" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("c")}
                    className={selectedType === "c" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <Code className="mr-1 h-4 w-4" />
                    C
                  </Button>
                  <Button
                    variant={selectedType === "network" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("network")}
                    className={selectedType === "network" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <Network className="mr-1 h-4 w-4" />
                    Network
                  </Button>
                  <Button
                    variant={selectedType === "binary" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("binary")}
                    className={selectedType === "binary" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <ShieldAlert className="mr-1 h-4 w-4" />
                    Binary
                  </Button>
                  <Button
                    variant={selectedType === "web" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("web")}
                    className={selectedType === "web" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    <Globe className="mr-1 h-4 w-4" />
                    Web
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:col-span-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-terminal-green">Difficulty:</span>
                  <Button
                    variant={selectedDifficulty === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty("all")}
                    className={selectedDifficulty === "all" ? "bg-terminal-green text-terminal-black" : "border-terminal-green text-terminal-green"}
                  >
                    All Levels
                  </Button>
                  <Button
                    variant={selectedDifficulty === "easy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty("easy")}
                    className={selectedDifficulty === "easy" ? "bg-green-500 text-black" : "border-green-500 text-green-500"}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={selectedDifficulty === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty("medium")}
                    className={selectedDifficulty === "medium" ? "bg-yellow-500 text-black" : "border-yellow-500 text-yellow-500"}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={selectedDifficulty === "hard" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty("hard")}
                    className={selectedDifficulty === "hard" ? "bg-red-500 text-black" : "border-red-500 text-red-500"}
                  >
                    Hard
                  </Button>
                  
                  <div className="ml-4 flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className={`border-terminal-green ${showCompleted ? 'bg-terminal-green bg-opacity-20' : ''} text-terminal-green`}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {showCompleted ? "Hide" : "Show"} Completed
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Challenge Grid */}
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    onClick={() => handleChallengeClick(challenge.id)}
                    isCompleted={hasCompletedChallenge(challenge.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-terminal-green text-xl mb-4">No challenges match your criteria</p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedDifficulty("all");
                    setShowCompleted(true);
                  }}
                  className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Challenges;
