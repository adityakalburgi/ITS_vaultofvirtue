
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import BASE_URL from "../config";
import { Menu, X, Terminal, Award, ChevronDown, LogIn, LogOut, User, Shield, Home, Coins } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [teamMemberCount, setTeamMemberCount] = useState<number | null>(null);
  const [teamScore, setTeamScore] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchTeamDetails = async () => {
      if (currentUser?.teamId) {
        try {
          console.log("Navbar: currentUser.teamId:", currentUser.teamId);
          const response = await fetch(`${BASE_URL}/api/leaderboard/teams/${currentUser.teamId}`);
          console.log("Navbar: fetch response status:", response.status);
          if (response.ok) {
            const data = await response.json();
            console.log("Navbar: team details data received:", data);
            setTeamMemberCount(data.data.memberCount);
            setTeamScore(data.data.score);
          } else {
            console.warn("Navbar: failed to fetch team details, status:", response.status);
            setTeamMemberCount(null);
            setTeamScore(null);
          }
        } catch (error) {
          console.error("Navbar: error fetching team details:", error);
          setTeamMemberCount(null);
          setTeamScore(null);
        }
      } else {
        console.log("Navbar: currentUser.teamId is missing");
        setTeamMemberCount(null);
        setTeamScore(null);
      }
    };

    fetchTeamDetails();

    // Update local state immediately when currentUser.teamScore or teamMemberCount changes
    if (currentUser?.teamScore !== undefined && currentUser?.teamScore !== null) {
      setTeamScore(currentUser.teamScore);
    }
    if (currentUser?.teamMemberCount !== undefined && currentUser?.teamMemberCount !== null) {
      setTeamMemberCount(currentUser.teamMemberCount);
    }

    intervalId = setInterval(() => {
      fetchTeamDetails();
    }, 10000); // Poll every 10 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-terminal-black border-b border-terminal-green py-4 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-terminal-green" />
          <span className="text-terminal-green text-xl font-bold">Vault of Virtue</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm flex items-center space-x-2 hover:text-opacity-80 ${
              isActive("/") ? "text-terminal-green font-bold" : "text-terminal-green text-opacity-60"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/challenges" 
            className={`text-sm flex items-center space-x-2 hover:text-opacity-80 ${
              isActive("/challenges") ? "text-terminal-green font-bold" : "text-terminal-green text-opacity-60"
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Challenges</span>
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={`text-sm flex items-center space-x-2 hover:text-opacity-80 ${
              isActive("/leaderboard") ? "text-terminal-green font-bold" : "text-terminal-green text-opacity-60"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Leaderboard</span>
          </Link>

          {isAuthenticated && currentUser?.isAdmin && (
            <Link 
              to="/admin" 
              className={`text-sm flex items-center space-x-2 hover:text-opacity-80 ${
                isActive("/admin") ? "text-terminal-green font-bold" : "text-terminal-green text-opacity-60"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}

          {/* Display team score for authenticated users */}
          {isAuthenticated && currentUser && !currentUser.isAdmin && (
            <>
              <div className="flex items-center space-x-2 text-terminal-green">
                <Coins className="h-4 w-4" />
                <span className="font-bold">{setTeamScore ?? setTeamScore : 0}</span>
              </div>
              <div className="flex items-center space-x-2 text-terminal-green">
                <User className="h-4 w-4" />
                <span className="font-bold">{currentUser.teamName || "No Team"}</span>
                <span className="text-sm text-terminal-green text-opacity-70">({teamMemberCount ?? 0} members)</span>
              </div>
            </>
          )}

          {isAuthenticated ? (
            <div className="relative group">
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 hover:text-terminal-green"
              >
                <User className="h-4 w-4" />
                <span>{currentUser?.username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-terminal-black border border-terminal-green shadow-lg hidden group-hover:block z-10">
                <div className="p-2">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 rounded-md"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 rounded-md flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate("/login")}
                variant="ghost"
                className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 hover:text-terminal-green flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Participant Login</span>
              </Button>
              
              <Button 
                onClick={() => navigate("/admin-login")}
                variant="ghost"
                className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 hover:text-terminal-green flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Login</span>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            onClick={toggleMenu}
            variant="ghost"
            className="text-terminal-green"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-terminal-black border-b border-terminal-green">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/challenges"
              onClick={() => setIsOpen(false)}
              className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
            >
              <Terminal className="h-5 w-5" />
              <span>Challenges</span>
            </Link>
            
            <Link
              to="/leaderboard"
              onClick={() => setIsOpen(false)}
              className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
            >
              <Award className="h-5 w-5" />
              <span>Leaderboard</span>
            </Link>

            {/* Display score for authenticated users in mobile menu */}
            {isAuthenticated && currentUser && !currentUser.isAdmin && (
              <div className="flex items-center space-x-2 text-terminal-green py-2">
                <Coins className="h-5 w-5" />
                <span className="font-bold">{teamScore ?? teamScore : 0} points</span>
              </div>
            )}

            {isAuthenticated && currentUser?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Participant Login</span>
                </Link>
                
                <Link
                  to="/admin-login"
                  onClick={() => setIsOpen(false)}
                  className="block text-terminal-green text-opacity-70 hover:text-terminal-green py-2 flex items-center space-x-2"
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
