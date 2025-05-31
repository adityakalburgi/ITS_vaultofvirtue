import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import BASE_URL from "../config";
import { useAuth } from "./AuthContext";
// Removed Firebase imports as realtime subscription is not used

// Challenge types
export type ChallengeType = "shell" | "python" | "c" | "network" | "binary" | "web";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  type: ChallengeType;
  points: number;
  initialCode?: string;
  testCases?: { input: string; output: string }[];
  hint?: string;
  solution?: string;
}

// User type for leaderboard
export interface LeaderboardUser {
  id: string;
  username: string;
  score: number;
  completedChallenges: number;
  rank?: number;
}

type DataContextType = {
  challenges: Challenge[];
  leaderboard: LeaderboardUser[];
  getChallengeById: (id: string) => Challenge | undefined;
  updateLeaderboard: () => void;
  fetchTeamLeaderboard: () => void;
  markChallengeCompleted: (challengeId: string, solution: string) => Promise<void>;
  hasCompletedChallenge: (challengeId: string) => boolean;
  securityLogs: string[];
  fetchSecurityLogs: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const DataProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const authContext = useAuth();
  const [token, setToken] = useState<string | null>(authContext?.token ?? null);

  // Get current user from AuthContext
  const { currentUser } = authContext || {};

  useEffect(() => {
    setToken(authContext?.token ?? null);
  }, [authContext?.token]);

  useEffect(() => {
    fetchChallenges();
    if (token) {
      updateLeaderboard();
    }

    let intervalId: NodeJS.Timeout | null = null;

    intervalId = setInterval(() => {
      if (token) {
        updateLeaderboard();
      } else {
        fetchTeamLeaderboard();
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token]);

  const fetchChallenges = async () => {
    try {
      console.log("DataContext: fetching challenges from API");
      const response = await fetch(`${BASE_URL}/api/challenges`);
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      console.log("DataContext: challenges fetched", data.data?.challenges);
      setChallenges(data.data?.challenges || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const getChallengeById = (id: string) => {
    return challenges.find(challenge => challenge.id === id);
  };

  // Keep updateLeaderboard for manual refresh if needed
  const updateLeaderboard = async () => {
    if (!token) {
      console.warn("updateLeaderboard skipped: no token available");
      return;
    }
    try {
      console.log("DataContext: updateLeaderboard called with token:", token);
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      console.log("DataContext: updateLeaderboard data received:", data);
      setLeaderboard(data.data?.users.map(user => ({
        id: user.uid,
        username: user.username,
        score: user.score,
        completedChallenges: user.completedChallenges.length
      })) || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // New function to fetch team leaderboard (public, no auth required)
  const fetchTeamLeaderboard = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/leaderboard/teams`);
      if (!response.ok) {
        throw new Error("Failed to fetch team leaderboard");
      }
      const data = await response.json();
      setLeaderboard(data.data?.teamLeaderboard.map(team => ({
        id: team.id,
        username: team.name,
        score: team.score,
        completedChallenges: team.completedChallenges
      })) || []);
    } catch (error) {
      console.error("Error fetching team leaderboard:", error);
    }
  };

  // New function to fetch security logs
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);

  const fetchSecurityLogs = async () => {
    try {
      console.log("fetchSecurityLogs token:", token);
      const response = await fetch(`${BASE_URL}/api/admin/logs`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch security logs");
      }
      const data = await response.json();
      setSecurityLogs(data.data?.logs || []);
    } catch (error) {
      console.error("Error fetching security logs:", error);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const markChallengeCompleted = async (challengeId: string, solution: string) => {
    try {
      const currentToken = authContext?.token;
      console.log("markChallengeCompleted token:", currentToken);
      if (!currentToken) {
        console.error("No token available for challenge submission");
        throw new Error("User is not authenticated. Please login again.");
      }
      const response = await fetch(`${BASE_URL}/api/challenges/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`
        },
        body: JSON.stringify({ challengeId, solution })
      });
      console.log("markChallengeCompleted response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("markChallengeCompleted response error body:", errorText);
        throw new Error("Failed to submit challenge solution");
      }
      await updateLeaderboard();
    } catch (error) {
      console.error("Error submitting challenge solution:", error);
    }
  };

  // Add hasCompletedChallenge function
  const hasCompletedChallenge = (challengeId: string): boolean => {
    if (!currentUser || !currentUser.completedChallenges) return false;
    return currentUser.completedChallenges.includes(challengeId);
  };

  return (
    <DataContext.Provider value={{
      challenges,
      leaderboard,
      getChallengeById,
      updateLeaderboard,
      fetchTeamLeaderboard,
      markChallengeCompleted,
      hasCompletedChallenge,
      securityLogs,
      fetchSecurityLogs
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataProvider };
