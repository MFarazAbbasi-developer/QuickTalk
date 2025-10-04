import { RiCloseFill } from "react-icons/ri";
import { useAppStore } from "../../../../../../store";
import { getColor } from "../../../../../../lib/utils";
import { HOST } from "../../../../../../utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, userStatuses } =
    useAppStore();

  // ✅ Get status for contact
  const status =
    selectedChatType === "contact" ? userStatuses[selectedChatData._id] : null;

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-[10vh] min-h-[60px] bg-[#0a2a6a] text-white border-b border-[#1e3a8a] flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-md">
      {/* Left: Avatar + Name + Status */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 relative flex-shrink-0">
          {selectedChatType === "contact" ? (
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              ) : (
                <div
                  className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(
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
            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full text-lg font-semibold">
              #
            </div>
          )}

          {/* Online dot indicator */}
          {selectedChatType === "contact" && status?.isOnline && (
            <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-[#0a2a6a] rounded-full"></span>
          )}
        </div>

        <div className="flex flex-col leading-tight">
          {/* Channel Name */}
          {selectedChatType === "channel" && (
            <span className="text-white font-medium text-base tracking-wide">
              {selectedChatData.name}
            </span>
          )}

          {/* Contact Name */}
          {selectedChatType === "contact" && (
            <>
              <span className="text-white font-medium text-base tracking-wide">
                {selectedChatData.firstName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData.email}
              </span>

              {/* Status line */}
              <span className="text-sm text-gray-300">
                {status?.isOnline
                  ? "Online"
                  : status?.lastSeen
                  ? `Last seen ${formatDistanceToNow(
                      new Date(status.lastSeen),
                      { addSuffix: true }
                    )}`
                  : "Offline"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button
          className="text-gray-300 p-4 hover:text-white transition-colors duration-200"
          onClick={closeChat}
        >
          <RiCloseFill className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
