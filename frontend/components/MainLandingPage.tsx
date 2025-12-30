import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// @ts-ignore - Vite handles image imports
import coverImage from '../assests/Cover_page.png';

const MainLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"></div>
      


      {/* Main Content Container */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-8">
        <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
          
          {/* Heart Image - Bigger with Text Overlay */}
          <div className="relative z-10 mb-6">
            <img
              src={coverImage}
              alt="3D Cardiac Heart Model"
              className="w-full max-w-6xl h-auto drop-shadow-2xl animate-pulse-slow"
              style={{
                animation: 'float 6s ease-in-out infinite, pulse 3s ease-in-out infinite'
              }}
            />
            {/* Brand Name Overlay on Heart */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
                Atrio
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 font-light drop-shadow-lg">
                Revolutionizing Cardiac Care with AI
              </p>
            </div>
            
            {/* Small text around the heart */}
            <div className="absolute top-8 left-8 text-white/80 text-xl font-medium z-20">
              Advanced AI Diagnostics
            </div>
            <div className="absolute top-8 right-8 text-white/80 text-xl font-medium z-20">
              Artery imaging
            </div>
            <div className="absolute bottom-8 left-8 text-white/80 text-xl font-medium z-20">
              Circulation check
            </div>
            <div className="absolute bottom-8 right-8 text-white/80 text-xl font-medium z-20">
              Patient Care
            </div>
          </div>

          {/* CTA Button - Smaller */}
          <button
            onClick={() => navigate('/auth')}
            className="z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium px-5 py-2 rounded-full text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-white/30"
          >
            <span>Click Here</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        .animate-pulse-slow {
          animation: float 6s ease-in-out infinite, pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MainLandingPage;
