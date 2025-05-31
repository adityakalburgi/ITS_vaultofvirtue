
import { useState, useEffect } from "react";
import { useData, LeaderboardUser } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const LeaderboardPage = () => {
  const { leaderboard, updateLeaderboard, fetchTeamLeaderboard } = useData();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      updateLeaderboard();
    } else {
      fetchTeamLeaderboard();
    }
  }, [isAuthenticated, updateLeaderboard, fetchTeamLeaderboard]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeaderboard(filtered);
    }
  }, [searchTerm, leaderboard]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-terminal-green mb-4 flex items-center justify-center">
            <Award className="h-8 w-8 mr-3" /> Leaderboard
          </h1>
          <p className="text-terminal-green text-opacity-70">
            Top hackers who have mastered the TechEscape challenges
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terminal-green text-opacity-60" />
            <Input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-terminal-black border border-terminal-green rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-terminal-green bg-opacity-20">
                  <th className="px-4 py-3 text-left text-terminal-green font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left text-terminal-green font-semibold">{isAuthenticated ? "User" : "Team"}</th>
                  <th className="px-4 py-3 text-left text-terminal-green font-semibold">Score</th>
                  <th className="px-4 py-3 text-left text-terminal-green font-semibold">Completed</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-t border-terminal-green border-opacity-30 hover:bg-terminal-green hover:bg-opacity-10 transition-colors"
                  >
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center">
                        {user.rank === 1 ? (
                          <span className="text-yellow-300 text-lg mr-2">🏆</span>
                        ) : user.rank === 2 ? (
                          <span className="text-gray-300 text-lg mr-2">🥈</span>
                        ) : user.rank === 3 ? (
                          <span className="text-amber-600 text-lg mr-2">🥉</span>
                        ) : (
                          <span className="text-terminal-green w-8">{user.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left text-terminal-green">{user.username}</td>
                    <td className="px-4 py-3 text-left text-terminal-green">{user.score.toLocaleString()}</td>
                    <td className="px-4 py-3 text-left text-terminal-green">{user.completedChallenges} challenges</td>
                  </tr>
                ))}
                
                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-terminal-green text-opacity-70">
                      No {isAuthenticated ? "users" : "teams"} found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-terminal-green text-opacity-70">
            Complete more challenges to increase your score and climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
