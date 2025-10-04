import { useEffect, useState } from "react";
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

import {
  MessageSquare,
  Users,
  Settings,
  Paperclip,
  Send,
  Phone,
  Info,
  X,
  MessageCircle,
  Menu,
} from "lucide-react";

const SampleContactsContainer = () => {
  const {
    setDirectMessagesContacts,
    directMessagesContacts,
    channels,
    setChannels,
    selectedMenu, setSelectedMenu
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

//   const [selectedMenu, setSelectedMenu] = useState("Chats");
  //   const toggleMenuSelected = () => {
  //     setMenuSelected()
  //   }
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`relative h-screen bg-[#00184d] border-r border-[#0f2f7a] transition-all duration-300
        ${isOpen ? "md:w-[20vw]" : "w-20"}
      `}
    >
      {/* Top: Hamburger */}
      <div className="pt-3 flex items-center justify-between px-7">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white"
          title={isOpen ? "Close Navigation" : "Open Navigation"}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="my-5">
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ul className="px-2">
            <SidebarItem
              label="Chats"
              icon={<MessageSquare className="w-5 h-5 text-white" />}
              selected={selectedMenu === "Chats"}
              onClick={() => {setSelectedMenu("Chats"); setIsOpen(false)}}
              isOpen={isOpen}
            />
            <SidebarItem
              label="Groups"
              icon={<Users className="w-5 h-5" />}
              selected={selectedMenu === "Groups"}
              onClick={() => {setSelectedMenu("Groups"); setIsOpen(false)}}
              isOpen={isOpen}
            />
            <SidebarItem
              label="Settings"
              icon={<Settings className="w-5 h-5" />}
              selected={selectedMenu === "Settings"}
              onClick={() => {setSelectedMenu("Settings"); setIsOpen(false)}}
              isOpen={isOpen}
            />
          </ul>
        </div>
      </div>

      {/* Profile Info */}
      { <ProfileInfo isOpen={isOpen}/>}
    </div>
  );
}

function SidebarItem({ label, icon, selected, onClick, isOpen }) {
  return (
    <li
    title={label}
      onClick={onClick}
      className={`flex items-center rounded-lg mx-2 mb-2 cursor-pointer transition-all duration-200
        ${selected ? "bg-blue-500 text-white" : "hover:bg-slate-600 text-gray-300"}
        ${isOpen ? "px-4 py-2" : "px-2 py-2 justify-center"}
      `}
    >
      {icon}
      {isOpen && <span className="ml-2">{label}</span>}
    </li>
  );
}

export default SampleContactsContainer;

