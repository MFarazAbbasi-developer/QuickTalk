import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HOST, SEARCH_CONTACTS_ROUTE } from "../../../../../../utils/constants";
import { apiClient } from "../../../../../../lib/api-client";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "../../../../../../lib/utils";
import { useAppStore } from "../../../../../../store";
import { MessageCircle, Search } from "lucide-react";

const NewDM = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await apiClient.post(
          SEARCH_CONTACTS_ROUTE,
          { searchTerm },
          { withCredentials: true }
        );
        setSearchedContacts(response.data.contacts);
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <>
      {/* Tooltip for add new chat */}
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-blue-300 hover:text-white cursor-pointer transition-all duration-300"
            onClick={() => setOpenNewContactModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
          Start New Chat
        </TooltipContent>
      </Tooltip>

      {/* Modal */}
      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-gradient-to-b from-[#00184d] to-[#0a2a6a] border border-blue-500/40 text-blue-100 w-[400px] h-[430px] flex flex-col rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.25)]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="text-[#10B981]" size={20} />
              Start a New Conversation
            </DialogTitle>
            <DialogDescription className="text-blue-200 text-sm">
              Find and connect with someone new in QuickTalk.
            </DialogDescription>
          </DialogHeader>

          {/* Search Field */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 text-blue-300/70" size={16} />
            <Input
              placeholder="Search contacts..."
              className="rounded-lg pl-9 py-3 bg-[#00184d]/60 text-white placeholder:text-blue-300 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>

          {/* Search Results */}
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[260px] mt-3">
              <div className="flex flex-col gap-3">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex gap-3 items-center cursor-pointer hover:bg-blue-900/30 p-2 rounded-lg border border-transparent hover:border-blue-500/40 transition-all duration-300"
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {contact.image ? (
                          <AvatarImage
                            src={`${HOST}/${contact.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div
                            className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                              contact.color
                            )}`}
                          >
                            {contact.firstName
                              ? contact.firstName[0]
                              : contact.email[0]}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>
                      <span className="text-xs text-blue-300">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Empty State */}
          {searchedContacts.length <= 0 && (
            <div className="flex-1 flex flex-col justify-center items-center mt-8 text-center text-blue-200">
              <div className="text-6xl mb-3 animate-pulse">💬</div>
              <h3 className="poppins-medium text-lg">
                Looking for someone to talk?
              </h3>
              <p className="text-xs text-blue-300 mt-1">
                Type a name or email above to find your next chat buddy.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
