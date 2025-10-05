import { useEffect } from "react";
import { apiClient } from "../../../../lib/api-client";
import {
  GET_DM_CONTACTS_ROUTE,
  GET_USER_CHANNELS_ROUTE,
} from "../../../../utils/constants";
import { useAppStore } from "../../../../store";
import ContactList from "../../../../components/ContactList";
import NewDM from "./components/new-dm/NewDM";
import CreateChannel from "./components/create-channel/CreateChannel";
import { MessageSquarePlus, Users } from "lucide-react";

const SampleContactsContainer2 = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
    selectedMenu,
  } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTE, {
        withCredentials: true,
      });
      if (response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      }
    };

    const getChannels = async () => {
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {
        withCredentials: true,
      });
      if (response.data.channels) {
        setChannels(response.data.channels);
      }
    };

    getContacts();
    getChannels();
  }, [setChannels, setDirectMessagesContacts]);

  return (
    <div className="relative md:w-[30vw] lg:w-[30vw] xl:w-[25vw] bg-gradient-to-b from-[#00184d] to-[#0a2a6a] border-r border-[#1e3a8a]/40 w-full flex flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-[#1e3a8a]/50 flex items-center gap-3">
        <Logo />
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Quick<span className="text-[#10B981]">Talk</span>
        </span>
      </div>

      {/* For Private Chats */}
      {selectedMenu === "Chats" && (
        <div className="flex flex-col flex-1">
          <SectionHeader
            icon={<MessageSquarePlus size={18} className="text-blue-300" />}
            title="Private Chats"
            action={<NewDM />}
          />
          {directMessagesContacts?.length ? (
            <div className="flex-1 overflow-y-auto scrollbar-hidden px-2">
              <ContactList contacts={directMessagesContacts} />
            </div>
          ) : (
            <EmptyState text="No private chats yet. Start one!" />
          )}
        </div>
      )}

      {/* For Group Chats */}
      {selectedMenu === "Groups" && (
        <div className="flex flex-col flex-1">
          <SectionHeader
            icon={<Users size={18} className="text-blue-300" />}
            title="Groups"
            action={<CreateChannel />}
          />
          {channels?.length ? (
            <div className="flex-1 overflow-y-auto scrollbar-hidden px-2">
              <ContactList contacts={channels} isChannel={true} />
            </div>
          ) : (
            <EmptyState text="No groups yet. Create one and collaborate!" />
          )}
        </div>
      )}
    </div>
  );
};

export default SampleContactsContainer2;

const Logo = () => {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-400 rounded-2xl shadow-md shadow-blue-900/40">
      <div className="absolute inset-0 rounded-2xl bg-blue-700/20 blur-md"></div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 38 38"
        className="w-8 h-8 relative z-10"
      >
        <path
          d="M5 6h28a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3h-9l-6 6-6-6H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"
          fill="#10B981"
        />
        <circle cx="14" cy="16" r="2.5" fill="#fff" />
        <circle cx="20" cy="16" r="2.5" fill="#fff" />
        <circle cx="26" cy="16" r="2.5" fill="#fff" />
      </svg>
    </div>
  );
};

const SectionHeader = ({ title, icon, action }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e3a8a]/40">
    <div className="flex items-center gap-2">
      {icon}
      <h6 className="uppercase tracking-widest text-blue-100 font-medium text-xs">
        {title}
      </h6>
    </div>
    {action}
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center flex-1 text-blue-100/80 p-8 text-sm">
    <div className="text-5xl mb-3">💬</div>
    <p className="text-center italic">{text}</p>
  </div>
);
