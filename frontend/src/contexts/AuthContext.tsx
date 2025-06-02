import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import BASE_URL from "../config";
type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  score: number;
  completedChallenges: string[];
  sessionStartTime?: number;
  disqualified?: boolean;
  firstLogin?: boolean;
  teamName?: string;
  teamRole?: "leader" | "member";
  teamId?: string;
  teamScore?: number | null;
  teamMemberCount?: number | null;
};

type AuthContextType = {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, teamName: string, registrationType: "create" | "join") => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  completeChallenge: (challengeId: string, solution: string) => Promise<void>;
  hasCompletedChallenge: (challengeId: string) => boolean;
  timeRemaining: number | null;
  isSessionExpired: boolean;
  tabSwitchCount: number;
  incrementTabSwitchCount: () => void;
  disqualifyUser: () => void;
  MAX_TAB_SWITCHES: number;
  startTimer: () => void;
  isFirstLogin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session duration in milliseconds (1 hour)
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_TAB_SWITCHES = 3; // Maximum allowed tab switches

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    console.log("AuthContext: initial token from localStorage:", storedToken);
    return storedToken;
  });

  // Remove token unification with currentUser.token due to type error
  // Keep token state managed separately and synced with localStorage

  // Sync token state with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        console.log("AuthContext: localStorage token changed:", event.newValue);
        setToken(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Log token state changes for debugging
  useEffect(() => {
    console.log("AuthContext: token state changed:", token);
  }, [token]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  // Removed isFirstLogin state

  // Timer effect
  useEffect(() => {
    if (!currentUser?.sessionStartTime) return;

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const elapsed = now - currentUser.sessionStartTime!;
      const remaining = Math.max(0, SESSION_DURATION - elapsed);

      if (remaining <= 0 && !isSessionExpired) {
        setIsSessionExpired(true);
        toast.error("Time's up! Your challenge session has ended.");
      }

      return Math.floor(remaining / 1000); // Convert to seconds
    };

    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Warning notifications
      if (remaining === 10 * 60) {
        toast.warning("10 minutes remaining in your challenge session!");
      } else if (remaining === 5 * 60) {
        toast.warning("5 minutes remaining in your challenge session!");
      } else if (remaining === 60) {
        toast.warning("Only 1 minute remaining in your challenge session!");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, isSessionExpired]);

  // Login for participants
  const login = async (email: string, teamName: string): Promise<boolean> => {
    try {
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
        return false;
      }

      const data = await response.json();
      console.log("AuthContext login response user:", data.data?.user);
      if (data.data?.user && data.data.user.disqualified) {
        toast.error("Your account has been disqualified due to tab switching violations.");
        return false;
      }

      // Ensure firstLogin is true on login
      // Calculate sessionStartTime from sessionExpiry
      let sessionStartTime: number | undefined = undefined;
      if (data.data?.user && data.data.user.sessionExpiry) {
        const expiry = new Date(data.data.user.sessionExpiry).getTime();
        sessionStartTime = expiry - SESSION_DURATION;
      }

      // Fix: Ensure teamId is correctly assigned from data.data.user.teamId or data.data.user.teamId string key
      const teamIdValue = data.data.user.teamId ?? data.data.user["teamId"] ?? null;
      setCurrentUser({ ...data.data.user, firstLogin: true, sessionStartTime, teamId: teamIdValue });
      localStorage.setItem("currentUser", JSON.stringify({ ...data.data.user, firstLogin: true, sessionStartTime, teamId: teamIdValue }));

      // Set token from response
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.data.token);
      } else {
        setToken(null);
        localStorage.removeItem("token");
      }

      console.log("AuthContext currentUser after set:", { ...data.data.user, firstLogin: true, sessionStartTime, teamId: teamIdValue });
      setIsSessionExpired(false);
      setTabSwitchCount(0);

      if (data.user) {
        toast.success(`Welcome back, ${data.user.username}!`);
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  // Start timer function - will be called when user accepts guidelines
  const startTimer = () => {
    if (!currentUser) return;

    setCurrentUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        sessionStartTime: Date.now(),
        firstLogin: false,
      };
    });

    toast.warning("You have 1 hour to complete all challenges. Tab switching is restricted.");
  };

  // New admin login function
  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Admin login failed");
        return false;
      }

      const data = await response.json();
      if (!data.data?.user || !data.data.user.username) {
        toast.error("Admin login failed: Invalid user data received");
        return false;
      }
      setCurrentUser(data.data.user);
      setToken(data.token || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        localStorage.removeItem("token");
      }
      console.log("loginAsAdmin token set:", data.token);
      toast.success(`Welcome, Administrator ${data.data.user.username}!`);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Admin login failed");
      return false;
    }
  };

  // Register function
  const register = async (
    username: string,
    email: string,
    password: string,
    teamName: string,
    registrationType: "create" | "join"
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          teamName,
          registrationType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed");
        return false;
      }

      const data = await response.json();
      // Ensure firstLogin is true on registration
      setCurrentUser({ ...data.user, firstLogin: true });
      setIsSessionExpired(false);
      setTabSwitchCount(0);

      // Fetch and update team details immediately after registration
      await fetchTeamDetails();

      const successMessage =
        registrationType === "create"
          ? `Team "${teamName}" created successfully! You are the team leader.`
          : `Successfully joined team "${teamName}"!`;

      toast.success(successMessage);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setTimeRemaining(null);
    setIsSessionExpired(false);
    setTabSwitchCount(0);
    toast.info("You have been logged out");
  };

  // Add method to fetch and update team details (score, members)
  const fetchTeamDetails = async () => {
    if (!currentUser?.teamId) return;

    try {
      const response = await fetch(`${BASE_URL}/api/leaderboard/teams/${currentUser.teamId}`);
      if (!response.ok) {
        console.warn("Failed to fetch team details, status:", response.status);
        return;
      }
      const data = await response.json();
      if (data.data) {
        setCurrentUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            teamScore: data.data.score,
            teamMemberCount: data.data.memberCount,
            teamName: data.data.teamName || prevUser.teamName,
          };
        });
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  };

  // Add method to handle challenge completion
  const completeChallenge = async (challengeId: string, solution: string) => {
    console.log('complete chanlenehs', currentUser);

    try {
      let authToken = token;
      if (!authToken) {
        // Reload token from localStorage if missing in state
        authToken = localStorage.getItem("token");
        if (!authToken) {
          toast.error("User is not authenticated. Please login again.");
          return;
        }
        setToken(authToken);
      }

      const response = await fetch(`${BASE_URL}/api/challenges/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ challengeId, solution })
      });
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit challenge");
        return;
      }

      const data = await response.json();

      // Update the user's completedChallenges and score based on backend response
      const updatedUser = {
        ...currentUser,
        score: data.data?.totalScore || currentUser.score,
        completedChallenges: data.data?.completedChallenges || currentUser.completedChallenges,
      };

      setCurrentUser(updatedUser);
      toast.success(data.message || `Challenge completed! Earned ${data.data?.points || 0} points!`);

      // Immediately refresh team details to update team score
      await fetchTeamDetails();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit challenge");
    }
  };

  // Add method to check if a challenge has been completed
  const hasCompletedChallenge = (challengeId: string): boolean => {
    if (!currentUser || !currentUser.completedChallenges) return false;
    return currentUser.completedChallenges.includes(challengeId);
  };

  // Disqualify user function
  const disqualifyUser = () => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      disqualified: true,
    };

    setCurrentUser(updatedUser);
    setIsSessionExpired(true);
    toast.error("You have been disqualified due to tab switching violations.");
  };

  // Increment tab switch count
  const incrementTabSwitchCount = () => {
    if (currentUser?.isAdmin) return; // Don't count tab switches for admins

    if (tabSwitchCount < MAX_TAB_SWITCHES) {
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);

      if (newCount === MAX_TAB_SWITCHES) {
        toast.error("Maximum tab switches reached! You have been disqualified.");
        disqualifyUser();
      } else {
        toast.warning(`Tab switch detected! (${newCount}/${MAX_TAB_SWITCHES})`);
      }
    } else {
      // Handle exceeding tab switch limit
      disqualifyUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        loginAsAdmin,
        register,
        logout,
        isAuthenticated: currentUser !== null,
        completeChallenge,
        hasCompletedChallenge,
        timeRemaining,
        isSessionExpired,
        tabSwitchCount,
        incrementTabSwitchCount,
        disqualifyUser,
        MAX_TAB_SWITCHES,
        startTimer,
        isFirstLogin: currentUser?.firstLogin ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
