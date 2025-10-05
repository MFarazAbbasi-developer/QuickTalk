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
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");

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

        const status = userStatuses[contact._id];

        return (
          <div
            key={contact._id}
            className={`px-4 py-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-300 backdrop-blur-sm
              ${
                isActive
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg"
                  : "hover:bg-blue-950/40 hover:shadow-md text-blue-100 border border-transparent hover:border-blue-700/20"
              }`}
            onClick={() => handleClick(contact, isChannel)}
          >
            {/* Avatar */}
            {!isChannel ? (
              <div className="relative h-11 w-11 flex-shrink-0">
                <Avatar className="h-11 w-11 rounded-full overflow-hidden shadow-md">
                  {contact.image ? (
                    <AvatarImage
                      src={`${HOST}/${contact.image}`}
                      alt="profile"
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <div
                      className={`uppercase h-11 w-11 flex items-center justify-center rounded-full text-base font-semibold ${
                        isActive
                          ? "bg-white/20 text-white border border-white/40"
                          : getColor(contact.color)
                      }`}
                    >
                      {contact.firstName
                        ? contact.firstName[0]
                        : contact.email[0]}
                    </div>
                  )}
                </Avatar>

                {/* Online status dot */}
                {status?.isOnline && (
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-[#0a2a6a] rounded-full shadow-sm"></span>
                )}
              </div>
            ) : (
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md border border-blue-900/40">
                #{contact.name[0]}
              </div>
            )}

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span
                  className={`truncate font-medium tracking-wide ${
                    isActive ? "text-white" : "text-blue-100"
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
                      isActive ? "text-white/80" : "text-blue-400/70"
                    }`}
                  >
                    {lastMessageTime}
                  </span>
                )}
              </div>

              {lastMessageText && (
                <span className="text-sm text-blue-300/80 truncate block mt-0.5 group-hover:text-blue-200/90">
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
