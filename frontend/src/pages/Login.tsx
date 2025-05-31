
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";
import MatrixBackground from "@/components/MatrixBackground";
import BASE_URL from "../config";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make API call here and get token
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, teamName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.token) {
        // Remove this block since login handles API call
        // await login(data.token);
        // Instead call login with email and teamName
        const success = await login(email, teamName);
        if (success) {
          navigate("/guidelines");
        } else {
          toast.error("Login failed");
        }
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MatrixBackground />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-terminal-black border border-terminal-green rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-terminal-green bg-opacity-20 p-3 rounded-full">
                <Terminal className="h-8 w-8 text-terminal-green" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-terminal-green mb-2 text-center">TechEscape</h1>
            <p className="text-terminal-green text-opacity-70 text-center mb-6">
              Log in to access the challenges
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-terminal-green text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-terminal-green text-terminal-green"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="teamName" className="block text-terminal-green text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <Input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-transparent border-terminal-green text-terminal-green"
                    placeholder="Your team name"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-terminal-green text-terminal-black hover:bg-opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-terminal-green text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-terminal-green font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/admin-login" className="text-terminal-green hover:underline">
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
