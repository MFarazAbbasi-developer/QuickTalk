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
import Lottie from "lottie-react";
import animationData from "@/assets/lottie-json";
import { HOST, SEARCH_CONTACTS_ROUTE } from "../../../../../../utils/constants";
import { apiClient } from "../../../../../../lib/api-client";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "../../../../../../lib/utils";
import { useAppStore } from "../../../../../../store";

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
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-blue-300 hover:text-white cursor-pointer transition-all duration-300"
            onClick={() => setOpenNewContactModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
          Select New Contact
        </TooltipContent>
      </Tooltip>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
  <DialogContent className="bg-[#0a2a6a] border border-blue-500/30 text-blue-100 w-[400px] h-[400px] flex flex-col rounded-xl shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-white text-lg font-semibold">
        Please select a contact
      </DialogTitle>
      <DialogDescription className="text-blue-200 text-sm">
        Search and add someone new to your chat list.
      </DialogDescription>
    </DialogHeader>

    <div>
      <Input
        placeholder="Search Contacts"
        className="rounded-lg px-4 py-3 bg-[#00184d] text-white placeholder:text-blue-300 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        onChange={(e) => searchContacts(e.target.value)}
      />
    </div>

    {searchedContacts.length > 0 && (
      <ScrollArea className="h-[250px]">
        <div className="flex flex-col gap-3 mt-3">
          {searchedContacts.map((contact) => (
            <div
              key={contact._id}
              className="flex gap-3 items-center cursor-pointer hover:bg-blue-900/30 p-2 rounded-lg transition"
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
                        ? contact.firstName.split("").shift()
                        : contact.email.split("").shift()}
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
                <span className="text-xs text-blue-300">{contact.email}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    )}

    {searchedContacts.length <= 0 && (
      <div className="flex-1 flex flex-col justify-center items-center mt-5 transition-all duration-1000">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ height: 100, width: 100 }}
        />
        <div className="text-blue-200 flex flex-col gap-2 items-center mt-5 text-center">
          <h3 className="poppins-medium text-lg">
            Hi<span className="text-blue-400">!</span> Search new
            <span className="text-blue-400"> contact</span>
          </h3>
          <p className="text-xs text-blue-300">
            Start typing above to find friends
          </p>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

    </>
  );
};

export default NewDM;
