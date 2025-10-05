import { XCircle } from "lucide-react";
import { useAppStore } from "../../../../../../store";
import { getColor } from "../../../../../../lib/utils";
import { HOST } from "../../../../../../utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, userStatuses } =
    useAppStore();

  const status =
    selectedChatType === "contact" ? userStatuses[selectedChatData._id] : null;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div
    className="h-[10vh] min-h-[64px] px-6 flex items-center justify-between
      bg-gradient-to-r from-[#00184d] via-[#0a2a6a] to-[#00184d]
      border-b border-[#1c3faa]/40 shadow-[0_2px_12px_rgba(0,0,0,0.3)]
      backdrop-blur-md transition-all duration-300"
  >
    {/* Left Section */}
    <div className="flex items-center gap-4">
      <div className="relative h-11 w-11 flex-shrink-0">
        {selectedChatType === "contact" ? (
          <Avatar className="h-11 w-11 rounded-full overflow-hidden shadow-lg shadow-blue-800/30">
            {selectedChatData.image ? (
              <AvatarImage
                src={`${HOST}/${selectedChatData.image}`}
                alt="profile"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div
                className={`uppercase h-full w-full rounded-full flex items-center justify-center text-base font-semibold ${getColor(
                  selectedChatData.color
                )}`}
              >
                {selectedChatData.firstName
                  ? selectedChatData.firstName.charAt(0)
                  : selectedChatData.email.charAt(0)}
              </div>
            )}
          </Avatar>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-11 w-11 flex items-center justify-center rounded-full text-lg font-semibold text-white shadow-md">
            #
          </div>
        )}

        {selectedChatType === "contact" && status?.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a2a6a] rounded-full shadow-sm shadow-green-400/40"></span>
        )}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-white font-semibold text-base tracking-wide">
          {selectedChatType === "channel"
            ? selectedChatData.name
            : selectedChatData.firstName
            ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
            : selectedChatData.email}
        </span>

        {selectedChatType === "contact" && (
          <span className="text-sm text-blue-300/90 mt-0.5">
            {status?.isOnline
              ? "Online now"
              : status?.lastSeen
              ? `Last seen ${formatDistanceToNow(new Date(status.lastSeen), {
                  addSuffix: true,
                })}`
              : "Offline"}
          </span>
        )}
      </div>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-3">
      <button
        onClick={closeChat}
        title="Close Chat"
        className="p-2 rounded-full text-blue-300 hover:text-white hover:bg-blue-500/20
          transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500/40"
      >
        <XCircle className="w-6 h-6" />
      </button>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

  </div>
);

};

export default ChatHeader;
