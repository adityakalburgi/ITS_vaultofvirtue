
import { useAuth } from "@/contexts/AuthContext";

const TabSwitchWarning = () => {
  const { tabSwitchCount, isAuthenticated, MAX_TAB_SWITCHES } = useAuth();
  
  if (!isAuthenticated || tabSwitchCount === 0) {
    return null;
  }
  
  return (
    <div className={`fixed top-0 left-0 w-full z-50 p-3 text-center ${tabSwitchCount >= MAX_TAB_SWITCHES ? 'bg-red-600' : 'bg-yellow-600'}`}>
      <p className="text-white font-semibold">
        {tabSwitchCount >= MAX_TAB_SWITCHES 
          ? "Tab switching limit exceeded! Your session has been terminated." 
          : `Warning: Tab switch detected (${tabSwitchCount}/${MAX_TAB_SWITCHES}). Further tab switches will lead to disqualification.`}
      </p>
    </div>
  );
};

export default TabSwitchWarning;
