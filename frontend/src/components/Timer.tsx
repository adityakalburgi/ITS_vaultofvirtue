
import { useAuth } from "@/contexts/AuthContext";
import { Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export const Timer = () => {
  const { timeRemaining, isSessionExpired, currentUser } = useAuth();
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Blinking effect for low time
  useEffect(() => {
    if (!timeRemaining || timeRemaining > 300) return;
    
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, [timeRemaining]);
  
  // Don't show timer for admin users
  if (currentUser?.isAdmin) {
    return null;
  }
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const isLowTime = timeRemaining !== null && timeRemaining < 300;
  
  return (
    <div className={`flex items-center ${isLowTime ? 'bg-red-500 bg-opacity-20 px-3 py-1 rounded-full' : ''}`}>
      {isLowTime && <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />}
      <Clock className={`h-4 w-4 mr-2 ${isLowTime ? 'text-red-500' : 'text-terminal-green'}`} />
      <div 
        className={`font-mono ${
          isSessionExpired ? 'text-red-500' : 
          isLowTime ? `text-red-500 ${isBlinking ? 'opacity-100' : 'opacity-70'}` : 
          'text-terminal-green'
        }`}
      >
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
};

export default Timer;
