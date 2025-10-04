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

const contactsContainer = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
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
    <div className="relative md:w-[35vw] lg:w-[30vw] xl-[20vw] bg-[#1F2937] border-r-2 border-[#2f303b] w-full ">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default contactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2 relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        viewBox="0 0 38 40"
        role="img"
        aria-label="QuickChat logo"
      >
        {/* Chat bubble */}
        <rect x="2.5" y="3" width="36" height="28" rx="8" fill="#2563EB" />
        <polygon points="10,31 8,39 18,31" fill="#2563EB" />

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
      <span className="text-3xl font-bold relative -top-2">QuickChat</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400/90 pl-10 font-light text-sm">
      {text}
    </h6>
  );
};
