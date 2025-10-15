import { useEffect, useState } from "react";
import ProfileInfo from "./components/profile-info/ProfileInfo";
import { apiClient } from "../../../../lib/api-client";
import {
  GET_DM_CONTACTS_ROUTE,
  GET_USER_CHANNELS_ROUTE,
} from "../../../../utils/constants";
import { useAppStore } from "../../../../store";
import { MessageSquare, Users, Settings, X, Menu } from "lucide-react";

const SampleContactsContainer = () => {
  const { setDirectMessagesContacts, setChannels, selectedMenu, setSelectedMenu } =
    useAppStore();

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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative h-screen bg-gradient-to-b from-[#00184d] to-[#031d5e] border-r border-blue-900/40
        transition-all duration-500 ease-in-out shadow-2xl flex flex-col justify-between
        ${isOpen ? "md:w-[20vw] lg:w-[18vw]" : "w-[5rem]"}
      `}
    >
      {/* Top: Hamburger Toggle */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-200 hover:text-white transition-all duration-300"
          title={isOpen ? "Close Navigation" : "Open Navigation"}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {isOpen && (
          <h2 className="text-white font-semibold text-lg tracking-wide">
            Quick<span className="text-[#10B981]">Talk</span>
          </h2>
        )}
      </div>

      {/* Sidebar Menu */}
      <div className="flex-1 mt-4 overflow-y-auto scrollbar-hidden">
        <ul className="space-y-2 px-2">
          <SidebarItem
            label="Chats"
            icon={<MessageSquare className="w-5 h-5" />}
            selected={selectedMenu === "Chats"}
            onClick={() => {
              setSelectedMenu("Chats");
              setIsOpen(false);
            }}
            isOpen={isOpen}
          />
          <SidebarItem
            label="Groups"
            icon={<Users className="w-5 h-5" />}
            selected={selectedMenu === "Groups"}
            onClick={() => {
              setSelectedMenu("Groups");
              setIsOpen(false);
            }}
            isOpen={isOpen}
          />
          <SidebarItem
            label="Settings"
            icon={<Settings className="w-5 h-5" />}
            selected={selectedMenu === "Settings"}
            onClick={() => {
              setSelectedMenu("Settings");
              setIsOpen(false);
            }}
            isOpen={isOpen}
          />
        </ul>
      </div>

      {/* Profile Section */}
      <div className="border-t border-blue-900/50 ">
        <ProfileInfo isOpen={isOpen} />
      </div>
    </div>
  );
};

function SidebarItem({ label, icon, selected, onClick, isOpen }) {
  return (
    <li
      title={label}
      onClick={onClick}
      className={`group flex items-center rounded-xl cursor-pointer transition-all duration-300
        ${
          selected
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
            : "hover:bg-blue-900/30 text-blue-200 hover:text-white"
        }
        ${isOpen ? "px-4 py-3" : "justify-center p-3"}
      `}
    >
      <div
        className={`transition-transform duration-300 group-hover:scale-110 ${
          selected ? "text-white" : "text-blue-300"
        }`}
      >
        {icon}
      </div>
      {isOpen && (
        <span
          className={`ml-3 text-sm font-medium tracking-wide ${
            selected ? "text-white" : "text-blue-200"
          }`}
        >
          {label}
        </span>
      )}
    </li>
  );
}

export default SampleContactsContainer;
