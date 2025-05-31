import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await loginAsAdmin(email, password);
      if (success) {
        navigate("/admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-terminal-black border border-terminal-green rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-terminal-green mb-6 text-center">Admin Login</h1>
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
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-terminal-green text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-terminal-green text-terminal-green"
                placeholder="Your password"
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
      </div>
    </div>
  );
};

export default AdminLogin;
