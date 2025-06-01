
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Code, Shield, Award, Ghost, Skull } from "lucide-react";

const Index = () => {
  useEffect(() => {
    // Terminal typing effect
    const text = "Welcome to Vault of Virtue - A Technical Escape Room Challenge by IEEE ITS WITH WIE";
    const typewriterElement = document.getElementById("typewriter");
    if (typewriterElement) {
      typewriterElement.textContent = "";
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          typewriterElement.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 50);
        } else {
          // Add cursor blink after typing completes
          typewriterElement.classList.add("terminal-prompt");
        }
      };
      typeWriter();
    }

    // Add floating matrix characters
    const createMatrixEffect = () => {
      const matrixContainer = document.getElementById("matrix-container");
      if (!matrixContainer) return;
      
      // Clear previous characters
      matrixContainer.innerHTML = "";
      
      const characters = "01".split("");
      const containerWidth = matrixContainer.offsetWidth;
      const containerHeight = matrixContainer.offsetHeight;
      
      for (let i = 0; i < 50; i++) {
        const character = document.createElement("div");
        character.className = "matrix-character";
        character.textContent = characters[Math.floor(Math.random() * characters.length)];
        character.style.left = `${Math.random() * containerWidth}px`;
        character.style.top = `${Math.random() * containerHeight}px`;
        character.style.animationDelay = `${Math.random() * 5}s`;
        character.style.animationDuration = `${5 + Math.random() * 10}s`;
        character.style.opacity = `${0.1 + Math.random() * 0.7}`;
        matrixContainer.appendChild(character);
      }
    };

    // Initialize matrix effect and refresh it periodically
    createMatrixEffect();
    const matrixInterval = setInterval(createMatrixEffect, 10000);

    // Add flickering effect to feature cards
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach(card => {
      setInterval(() => {
        if (Math.random() > 0.8) {
          card.classList.add("flicker");
          setTimeout(() => {
            card.classList.remove("flicker");
          }, 150);
        }
      }, 2000);
    });

    return () => {
      clearInterval(matrixInterval);
    };
  }, []);

  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Matrix background container */}
      <div id="matrix-container" className="fixed inset-0 z-0 opacity-20 pointer-events-none"></div>
      
      {/* Content with z-index to appear above matrix */}
      <div className="container mx-auto relative z-10">
        {/* Hero Section */}
        <section className="py-10 md:py-20 text-center">
          <div className="max-w-4xl mx-auto relative glitch-container">
            <div className="glitch-effect absolute inset-0 opacity-0"></div>
            <h1 
              id="typewriter" 
              className="text-3xl md:text-5xl font-bold text-terminal-green mb-6"
            >
              {/* Text will be filled by typewriter effect */}
            </h1>
            <p className="text-terminal-green text-xl md:text-2xl mb-8 pulse-text">
              By IEEE Information theory Society and Womens in Tech
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-terminal-green text-terminal-black hover:bg-opacity-80 px-8 hover-shake">
                  <Link to="/challenges">
                    <Terminal className="mr-2 h-5 w-5" />
                    Start Hacking
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-terminal-green text-terminal-black hover:bg-opacity-80 px-8 hover-shake">
                    <Link to="/register">
                      <Shield className="mr-2 h-5 w-5" />
                      Register
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-terminal-green text-terminal-green hover:bg-terminal-green hover:bg-opacity-10 hover-glitch">
                    <Link to="/login">
                      <Terminal className="mr-2 h-5 w-5" />
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-terminal-black border border-terminal-green rounded-lg p-6 transition-transform hover:scale-105 feature-card shadow-glow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full border-2 border-terminal-green pulse-border">
                  <Terminal className="h-8 w-8 text-terminal-green animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-terminal-green mb-2 text-center">Shell Command Challenges</h3>
              <p className="text-terminal-green text-opacity-80 text-center">
                Navigate through a virtual filesystem, find hidden flags, and decrypt secrets using bash commands.
              </p>
            </div>
            
            <div className="bg-terminal-black border border-terminal-green rounded-lg p-6 transition-transform hover:scale-105 feature-card shadow-glow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full border-2 border-terminal-green pulse-border">
                  <Code className="h-8 w-8 text-terminal-green animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-terminal-green mb-2 text-center">Programming Puzzles</h3>
              <p className="text-terminal-green text-opacity-80 text-center">
                Debug C and Python code, fix memory vulnerabilities, and solve algorithmic challenges to progress.
              </p>
            </div>
            
            <div className="bg-terminal-black border border-terminal-green rounded-lg p-6 transition-transform hover:scale-105 feature-card shadow-glow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full border-2 border-terminal-green pulse-border">
                  <Award className="h-8 w-8 text-terminal-green animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-terminal-green mb-2 text-center">CTF Style Gameplay</h3>
              <p className="text-terminal-green text-opacity-80 text-center">
                Compete against other hackers on the leaderboard, earn points for each solved challenge, and prove your skills.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-terminal-green mb-8 text-center glitch-text">How Vault of Virtue Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 fade-in-view">
              <div className="flex justify-center items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-terminal-green text-terminal-black font-bold text-xl flex items-center justify-center haunted">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold text-terminal-green mb-2">Sign Up</h3>
              <p className="text-terminal-green text-opacity-70">Create your account and access the technical challenges</p>
            </div>
            
            <div className="p-4 fade-in-view" style={{ animationDelay: "0.2s" }}>
              <div className="flex justify-center items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-terminal-green text-terminal-black font-bold text-xl flex items-center justify-center haunted">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-terminal-green mb-2">Choose a Challenge</h3>
              <p className="text-terminal-green text-opacity-70">Select from different technical puzzles based on your skill level</p>
            </div>
            
            <div className="p-4 fade-in-view" style={{ animationDelay: "0.4s" }}>
              <div className="flex justify-center items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-terminal-green text-terminal-black font-bold text-xl flex items-center justify-center haunted">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-terminal-green mb-2">Solve Puzzles</h3>
              <p className="text-terminal-green text-opacity-70">Use your technical skills to solve coding and command line challenges</p>
            </div>
            
            <div className="p-4 fade-in-view" style={{ animationDelay: "0.6s" }}>
              <div className="flex justify-center items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-terminal-green text-terminal-black font-bold text-xl flex items-center justify-center haunted">
                  4
                </div>
              </div>
              <h3 className="text-lg font-semibold text-terminal-green mb-2">Earn Points</h3>
              <p className="text-terminal-green text-opacity-70">Complete challenges to earn points and climb the leaderboard</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 md:py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-terminal-green mb-4 glow-text">Ready to Test Your Skills?</h2>
            <p className="text-terminal-green text-xl mb-8 flicker-text">
              Join the Vault of virtue community and challenge yourself with our technical escape room puzzles.
            </p>
            <Button asChild size="lg" className="bg-terminal-green text-terminal-black hover:bg-opacity-80 px-8 animate-pulse">
              <Link to={isAuthenticated ? "/challenges" : "/register"} className="flex items-center">
                {isAuthenticated ? 
                  <Terminal className="mr-2 h-5 w-5" /> : 
                  <Skull className="mr-2 h-5 w-5 rotating" />
                }
                {isAuthenticated ? "Start Hacking" : "Join Now"}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
