
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, UserPlus, Users } from "lucide-react";
import MatrixBackground from "@/components/MatrixBackground";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [registrationType, setRegistrationType] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(username, email, password, teamName, registrationType);
      if (success) {
        navigate("/challenges");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      <MatrixBackground />
      
      <div className="w-full max-w-md">
        <div className="bg-terminal-black border border-terminal-green rounded-lg shadow-lg p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <Terminal className="h-12 w-12 text-terminal-green" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-terminal-green mb-2">Join the Challenge</h2>
          <p className="text-center text-terminal-green text-sm mb-6 opacity-80">Team Event Registration</p>
          
          {error && (
            <div className="p-3 rounded-md bg-red-900 bg-opacity-25 border border-red-500 text-red-500 mb-4">
              {error}
            </div>
          )}

          {/* Team Registration Type Selection */}
          <div className="mb-6">
            <Label className="text-terminal-green mb-3 block">Registration Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={registrationType === "create" ? "default" : "outline"}
                onClick={() => setRegistrationType("create")}
                className={registrationType === "create" 
                  ? "bg-terminal-green text-terminal-black" 
                  : "border-terminal-green text-terminal-green bg-transparent hover:bg-terminal-green hover:text-terminal-black"
                }
              >
                <Users className="h-4 w-4 mr-2" />
                Create Team
              </Button>
              <Button
                type="button"
                variant={registrationType === "join" ? "default" : "outline"}
                onClick={() => setRegistrationType("join")}
                className={registrationType === "join" 
                  ? "bg-terminal-green text-terminal-black" 
                  : "border-terminal-green text-terminal-green bg-transparent hover:bg-terminal-green hover:text-terminal-black"
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Team
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-terminal-green">
                {registrationType === "create" ? "Team Name" : "Team Name to Join"}
              </Label>
              <div className="relative">
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={registrationType === "create" ? "Enter your team name" : "Enter team name to join"}
                  className="bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  required
                />
              </div>
              {registrationType === "create" && (
                <p className="text-xs text-terminal-green opacity-60">
                  This will be your team's unique identifier
                </p>
              )}
              {registrationType === "join" && (
                <p className="text-xs text-terminal-green opacity-60">
                  Ask your team leader for the exact team name
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-terminal-green">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-terminal-green">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-terminal-green">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-terminal-green">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terminal-green hover:bg-opacity-80 text-terminal-black font-bold mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-terminal-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {registrationType === "create" ? (
                    <>
                      <Users className="h-5 w-5 mr-2" />
                      Create Team & Register
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Join Team & Register
                    </>
                  )}
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-terminal-green">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
