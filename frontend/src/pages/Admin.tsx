
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData, LeaderboardUser } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Terminal, AlertTriangle, Search, Trash2, Edit, Plus, ChevronDown } from "lucide-react";

// Admin Dashboard Component
const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { leaderboard, updateLeaderboard, challenges, securityLogs, fetchSecurityLogs } = useData();

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [challengeSearchTerm, setChallengeSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    fetchSecurityLogs();
    updateLeaderboard();
    const interval = setInterval(() => {
      fetchSecurityLogs();
      updateLeaderboard();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSecurityLogs, updateLeaderboard]);

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Update filtered users when search term changes
  useEffect(() => {
    if (userSearchTerm.trim() === "") {
      setFilteredUsers(leaderboard);
    } else {
      const filtered = leaderboard.filter((user) =>
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, leaderboard]);

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers({
      ...expandedUsers,
      [userId]: !expandedUsers[userId],
    });
  };

  // Filter challenges based on search
  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(challengeSearchTerm.toLowerCase())
  );

  if (!currentUser?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-terminal-green mr-3" />
            <h1 className="text-3xl font-bold text-terminal-green">Admin Dashboard</h1>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-terminal-green bg-opacity-10 p-1 rounded-lg">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-terminal-black"
            >
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-terminal-black"
            >
              <Terminal className="h-4 w-4 mr-2" /> Challenges
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-terminal-black"
            >
              <AlertTriangle className="h-4 w-4 mr-2" /> Security Logs
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-terminal-green">User Management</h2>
                <Button
                  className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
                  onClick={() => setIsAddingUser(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add User
                </Button>
              </div>

              {isAddingUser && (
                <div className="mb-4 p-4 bg-terminal-black border border-terminal-green rounded">
                  <h3 className="text-terminal-green mb-2">Add New User</h3>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="mb-2 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="mb-2 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                  />
                  <div className="flex space-x-2">
                    <Button
                      className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
                      onClick={async () => {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/users`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(newUser),
                          });
                          if (!response.ok) throw new Error("Failed to add user");
                          setIsAddingUser(false);
                          setNewUser({ username: "", email: "" });
                          await updateLeaderboard();
                        } catch (error) {
                          console.error(error);
                        }
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingUser(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terminal-green text-opacity-60" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                />
              </div>

              <div className="bg-terminal-black border border-terminal-green rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-terminal-green bg-opacity-20">
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Username</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Score</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Completed</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <>
                          <tr
                            key={user.id}
                            className="border-t border-terminal-green border-opacity-30 hover:bg-terminal-green hover:bg-opacity-10 transition-colors"
                          >
                            <td className="px-4 py-3 text-left text-terminal-green">{user.id}</td>
                            <td className="px-4 py-3 text-left text-terminal-green">{user.username}</td>
                            <td className="px-4 py-3 text-left text-terminal-green">{user.score}</td>
                            <td className="px-4 py-3 text-left text-terminal-green">{user.completedChallenges} challenges</td>
                            <td className="px-4 py-3 text-left">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
                                  onClick={() => toggleUserExpanded(user.id)}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${expandedUsers[user.id] ? 'rotate-180' : ''}`}
                                  />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {expandedUsers[user.id] && (
                            <tr className="bg-terminal-black bg-opacity-50">
                              <td colSpan={5} className="px-4 py-3">
                                <div className="p-3 border-l-2 border-terminal-green">
                                  <p className="text-terminal-green mb-2">User Details:</p>
                                  <p className="text-terminal-green text-opacity-70 mb-1">
                                    <span className="font-semibold">Email:</span> {user.username.toLowerCase()}@example.com
                                  </p>
                                  <p className="text-terminal-green text-opacity-70 mb-1">
                                    <span className="font-semibold">Rank:</span> #{user.rank}
                                  </p>
                                  <p className="text-terminal-green text-opacity-70">
                                    <span className="font-semibold">Registration Date:</span> 2023-04-15
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-terminal-green">Challenge Management</h2>
                <Button className="bg-terminal-green text-terminal-black hover:bg-opacity-80">
                  <Plus className="h-4 w-4 mr-2" /> Create Challenge
                </Button>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terminal-green text-opacity-60" />
                <Input 
                  type="text"
                  placeholder="Search challenges..."
                  value={challengeSearchTerm}
                  onChange={(e) => setChallengeSearchTerm(e.target.value)}
                  className="pl-10 bg-transparent border-terminal-green focus:border-terminal-green text-terminal-green"
                />
              </div>
              
              <div className="bg-terminal-black border border-terminal-green rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-terminal-green bg-opacity-20">
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Title</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Type</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Difficulty</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Points</th>
                        <th className="px-4 py-3 text-left text-terminal-green font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChallenges.map((challenge) => (
                        <tr 
                          key={challenge.id} 
                          className="border-t border-terminal-green border-opacity-30 hover:bg-terminal-green hover:bg-opacity-10 transition-colors"
                        >
                          <td className="px-4 py-3 text-left text-terminal-green">{challenge.id}</td>
                          <td className="px-4 py-3 text-left text-terminal-green">{challenge.title}</td>
                          <td className="px-4 py-3 text-left text-terminal-green capitalize">{challenge.type}</td>
                          <td className="px-4 py-3 text-left">
                            <span className={`px-2 py-1 rounded text-xs ${
                              challenge.difficulty === "easy" ? "bg-green-500 bg-opacity-20 text-green-500" :
                              challenge.difficulty === "medium" ? "bg-yellow-500 bg-opacity-20 text-yellow-500" :
                              "bg-red-500 bg-opacity-20 text-red-500"
                            }`}>
                              {challenge.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-left text-terminal-green">{challenge.points}</td>
                          <td className="px-4 py-3 text-left">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-terminal-green hover:bg-terminal-green hover:bg-opacity-10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Security Logs Tab */}
          <TabsContent value="logs">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-terminal-green mb-4">Security Logs</h2>
              
              <div className="bg-terminal-black border border-terminal-green rounded-lg overflow-hidden shadow-lg">
                <div className="p-4">
                  <div className="terminal-window">
                    <div className="terminal-text">
                      {securityLogs.length === 0 ? (
                        <div className="mb-2 text-terminal-green">No security logs available.</div>
                      ) : (
                        securityLogs.map((log, index) => (
                          <div key={index} className="mb-2">{log}</div>
                        ))
                      )}
                      <div className="mb-2 terminal-prompt">_</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
