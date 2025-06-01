
import { Terminal, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-6 px-4 border-t border-terminal-green bg-terminal-black">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center text-terminal-green text-sm">
          <div className="flex items-center mb-4">
            <Terminal className="h-5 w-5 mr-2" />
            <span className="font-bold text-lg">Vault of Virtue</span>
          </div>
          
          <div className="mb-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <a href="#" className="hover:text-opacity-80">About</a>
            <a href="#" className="hover:text-opacity-80">Terms of Service</a>
            <a href="#" className="hover:text-opacity-80">Privacy Policy</a>
            <a href="#" className="hover:text-opacity-80">Contact</a>
          </div>
          
          <div className="flex items-center">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-terminal-green" />
            <span>by Aditya Kalburgi IEEE ITS WEBMASTER</span>
          </div>
          
          <div className="mt-2">
            <span>&copy; {new Date().getFullYear()} VaultofVirtue. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
