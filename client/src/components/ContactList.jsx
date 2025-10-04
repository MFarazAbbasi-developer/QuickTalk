import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "../store";
import { HOST } from "../utils/constants";
import { getColor } from "../lib/utils";
import { useSocket } from "../context/SocketContext";

const ContactList = ({ contacts, isChannel = false }) => {
  const socket = useSocket();

  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
    userInfo,
    lastMessages,
    channelLastMessages,
    userStatuses,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }

    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }

    // ✅ Mark messages as read by current user
    socket.emit("setMessageStatus", {
      chatId: contact._id,
      userId: userInfo.id,
      status: "read",
      isChannel,
    });
  };

  return (
    <div className="mt-6 space-y-2">
      {contacts.map((contact) => {
        const isChannel = !!contact.members;

        // Pick last message
        const lastMsg = isChannel
          ? channelLastMessages.find((msg) => msg.channelId === contact._id)
          : lastMessages.find((msg) => msg.withUser._id === contact._id);

        const lastMessageText =
          lastMsg?.message?.content ||
          (isChannel
            ? contact.lastMessage?.message?.content
            : userInfo.lastMessages?.find(
                (msg) => msg.withUser === contact._id
              )?.message?.content);

        const lastMessageTime = lastMsg?.updatedAt
          ? new Date(lastMsg.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : !isChannel
          ? new Date(
              userInfo.lastMessages?.find(
                (msg) => msg.withUser === contact._id
              )?.updatedAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date(contact.lastMessage?.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

        const isActive =
          selectedChatData && selectedChatData._id === contact._id;

        // ✅ Get user status from zustand
        const status = userStatuses[contact._id];

        return (
          <div
            key={contact._id}
            className={`px-4 py-3 rounded-2xl transition-colors duration-300 cursor-pointer flex items-center gap-3
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "hover:bg-white/5 text-neutral-200"
        }`}
            onClick={() => handleClick(contact, isChannel)}
          >
            {/* Avatar */}
            {!isChannel ? (
              <div className="relative h-11 w-11">
                <Avatar className="h-11 w-11 rounded-full overflow-hidden shadow-lg">
                  {contact.image ? (
                    <AvatarImage
                      src={`${HOST}/${contact.image}`}
                      alt="profile"
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <div
                      className={`${
                        isActive
                          ? "bg-white/20 border border-white/50 text-white"
                          : getColor(contact.color)
                      } uppercase h-11 w-11 text-base font-semibold flex items-center justify-center rounded-full`}
                    >
                      {contact.firstName
                        ? contact.firstName[0]
                        : contact.email[0]}
                    </div>
                  )}
                </Avatar>

                {/* Online dot */}
                {status?.isOnline && (
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-[#0a2a6a] rounded-full"></span>
                )}
              </div>
            ) : (
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                #{contact.name[0]}
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span
                  className={`truncate font-medium ${
                    isActive ? "text-white" : "text-neutral-100"
                  }`}
                >
                  {isChannel
                    ? contact.name
                    : contact.firstName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact.email}
                </span>
                {lastMessageTime && (
                  <span
                    className={`text-xs ml-2 min-w-fit ${
                      isActive ? "text-white/80" : "text-neutral-500"
                    }`}
                  >
                    {lastMessageTime}
                  </span>
                )}
              </div>
              {lastMessageText && (
                <span className="text-sm text-neutral-400 truncate block group-hover:text-neutral-300">
                  {lastMessageText}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
