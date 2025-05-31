
import { useState, useEffect } from "react";
import { Challenge } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Network, LightbulbIcon, Search, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NetworkChallengeProps {
  challenge: Challenge;
}

const NetworkChallenge = ({ challenge }: NetworkChallengeProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [foundFlag, setFoundFlag] = useState(false);
  const { completeChallenge, hasCompletedChallenge } = useAuth();
  
  const isCompleted = hasCompletedChallenge(challenge.id);
  
  useEffect(() => {
    // If the challenge is already completed, show as solved
    if (isCompleted) {
      setFoundFlag(true);
    }
  }, [isCompleted]);

  const packetData = [
    { id: 1, timestamp: "08:42:15", source: "192.168.1.5", destination: "192.168.1.1", protocol: "TCP", port: 80, data: "GET /index.html HTTP/1.1" },
    { id: 2, timestamp: "08:42:16", source: "192.168.1.1", destination: "192.168.1.5", protocol: "TCP", port: 80, data: "HTTP/1.1 200 OK" },
    { id: 3, timestamp: "08:43:22", source: "192.168.1.5", destination: "8.8.8.8", protocol: "DNS", port: 53, data: "QUERY: example.com" },
    { id: 4, timestamp: "08:43:23", source: "8.8.8.8", destination: "192.168.1.5", protocol: "DNS", port: 53, data: "RESPONSE: 93.184.216.34" },
    { id: 5, timestamp: "08:44:10", source: "192.168.1.6", destination: "192.168.1.1", protocol: "TCP", port: 443, data: "TLS Client Hello" },
    { id: 6, timestamp: "08:44:11", source: "192.168.1.1", destination: "192.168.1.6", protocol: "TCP", port: 443, data: "TLS Server Hello" },
    { id: 7, timestamp: "08:47:32", source: "192.168.1.7", destination: "18.66.42.9", protocol: "TCP", port: 4444, data: "..zK&..f{L.4g..." },
    { id: 8, timestamp: "08:47:33", source: "18.66.42.9", destination: "192.168.1.7", protocol: "TCP", port: 4444, data: "..B*Op3n_sh3ll.." },
    { id: 9, timestamp: "08:49:56", source: "unknown", destination: "192.168.1.1", protocol: "??", port: 31337, data: "flag{suspicious_traffic_detected}" },
    { id: 10, timestamp: "08:50:01", source: "192.168.1.1", destination: "unknown", protocol: "ICMP", port: 0, data: "Destination unreachable" }
  ];

  const filteredPackets = packetData.filter(packet => 
    Object.values(packet).some(value => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the user found the flag
    if (
      searchQuery.toLowerCase().includes("port 31337") || 
      searchQuery.toLowerCase().includes("unknown") ||
      searchQuery.toLowerCase().includes("flag") ||
      searchQuery.toLowerCase() === "31337"
    ) {
      if (!foundFlag) {
        setFoundFlag(true);
        handleSuccess();
      }
    }
  };

  const handleSuccess = () => {
    // Only complete the challenge if it hasn't been completed yet
    if (!isCompleted) {
      completeChallenge(challenge.id, challenge.points);
    }
  };

  return (
    <div className="bg-terminal-black border border-terminal-green rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-terminal-green" />
          <h2 className="text-xl font-bold text-terminal-green">Packet Detective</h2>
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
          <p className="text-terminal-green text-sm">{challenge.hint || "Look for unusual port numbers and non-standard protocols"}</p>
        </div>
      )}
      
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-terminal-green opacity-70 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packet data..."
            className="w-full bg-black border border-terminal-green rounded px-10 py-2 text-terminal-green"
            disabled={isCompleted}
          />
        </div>
        <Button 
          type="submit"
          className="bg-terminal-green text-terminal-black hover:bg-opacity-80"
          disabled={isCompleted}
        >
          Analyze
        </Button>
      </form>
      
      {foundFlag && (
        <div className="mb-4 p-3 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded">
          <p className="text-green-500 font-medium">Flag found: flag{`{suspicious_traffic_detected}`}</p>
        </div>
      )}
      
      <div className="bg-black border border-terminal-green rounded overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-terminal-green border-opacity-30">
              <th className="px-4 py-2 text-left text-terminal-green">#</th>
              <th className="px-4 py-2 text-left text-terminal-green">Time</th>
              <th className="px-4 py-2 text-left text-terminal-green">Source</th>
              <th className="px-4 py-2 text-left text-terminal-green">Destination</th>
              <th className="px-4 py-2 text-left text-terminal-green">Protocol</th>
              <th className="px-4 py-2 text-left text-terminal-green">Port</th>
              <th className="px-4 py-2 text-left text-terminal-green">Data</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackets.map(packet => (
              <tr 
                key={packet.id} 
                className={`border-b border-terminal-green border-opacity-10 hover:bg-terminal-green hover:bg-opacity-5 
                  ${packet.port === 31337 ? 'bg-yellow-900 bg-opacity-20' : ''}`}
              >
                <td className="px-4 py-2 text-terminal-green">{packet.id}</td>
                <td className="px-4 py-2 text-terminal-green">{packet.timestamp}</td>
                <td className="px-4 py-2 text-terminal-green">{packet.source}</td>
                <td className="px-4 py-2 text-terminal-green">{packet.destination}</td>
                <td className="px-4 py-2 text-terminal-green">{packet.protocol}</td>
                <td className="px-4 py-2 text-terminal-green">{packet.port}</td>
                <td className="px-4 py-2 text-terminal-green font-mono text-sm">{packet.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NetworkChallenge;
