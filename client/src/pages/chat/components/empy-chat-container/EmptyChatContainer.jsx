import { MessageCircle, Sparkles } from "lucide-react";

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 bg-[#00184d] hidden md:flex flex-col items-center justify-center text-white text-center transition-all duration-500">
      {/* Glowing Circle Illustration */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-56 h-56 bg-blue-600/10 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute w-40 h-40 bg-blue-500/20 blur-2xl rounded-full"></div>
        <div className="z-10 flex flex-col items-center justify-center">
          <MessageCircle size={90} className="text-blue-400 drop-shadow-md" />
          <Sparkles
            size={22}
            className="text-blue-300 absolute -top-2 -right-2 animate-ping"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="mt-10 flex flex-col gap-3 px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-white/90">
          Welcome to <span className="text-blue-400">QuickTalk</span>
        </h2>
        <p className="text-blue-200 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Start a new conversation or continue where you left off — your chats,
          your way. Stay connected with instant messaging, groups, and real-time
          updates powered by <span className="text-blue-400">Socket.io</span>.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
