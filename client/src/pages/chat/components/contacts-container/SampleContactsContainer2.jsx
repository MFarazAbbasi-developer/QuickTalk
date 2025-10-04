import { useEffect } from "react";
import NewDM from "./components/new-dm/NewDM";
import ProfileInfo from "./components/profile-info/ProfileInfo";
import { apiClient } from "../../../../lib/api-client";
import {
  GET_DM_CONTACTS_ROUTE,
  GET_USER_CHANNELS_ROUTE,
} from "../../../../utils/constants";
import { useAppStore } from "../../../../store";
import ContactList from "../../../../components/ContactList";
import CreateChannel from "./components/create-channel/CreateChannel";

const SampleContactsContainer2 = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
    selectedMenu,
    setSelectedMenu,
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
    <div className="relative md:w-[30vw] lg:w-[30vw] xl:w-[25vw] bg-[#0a2a6a] border-r border-[#e5e7eb] w-full ">
      {/* Logo */}
      <div className="p-4 border-b border-[#1e3a8a]">
        <Logo />
      </div>
      {/* For Single Chats */}
      {selectedMenu === "Chats" && (
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between px-4 py-2">
            <Title
              text="Direct Messages"
              className="text-gray-200 text-sm font-semibold"
            />
            <NewDM />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden px-2">
            <ContactList contacts={directMessagesContacts} />
          </div>
        </div>
      )}

      {/* For Group Chats */}
      {selectedMenu === "Groups" && (
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between px-4 py-2">
            <Title
              text="Groups"
              className="text-gray-200 text-sm font-semibold"
            />
            <CreateChannel />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden px-2">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleContactsContainer2;

const Logo = () => {
  return (
    <div className="flex p-5 items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 38 40"
        className="w-12 h-12"
        role="img"
        aria-label="QuickChat logo"
      >
        {/* Chat bubble */}
        <rect x="2.5" y="3" width="36" height="28" rx="8" fill="#2563EB" />
        <polygon points="12,31 10,39 20,31" fill="#2563EB" />

        {/* Outer C ring */}
        <circle
          cx="20.5"
          cy="17"
          r="9.5"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="47 20"
        />

        {/* Inner Q ring */}
        <circle
          cx="20.5"
          cy="17"
          r="6.2"
          fill="none"
          stroke="#10B981"
          strokeWidth="2.6"
        />

        {/* Q tail */}
        <line
          x1="24.8"
          y1="21.4"
          x2="28.8"
          y2="25.4"
          stroke="#10B981"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white relative -top-1">
        Quick<span className="text-[#10B981]">Chat</span>
      </span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-blue-200/90 pl-6 font-medium text-xs">
      {text}
    </h6>
  );
};
