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

import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACTS_ROUTE,
} from "../../../../../../utils/constants";
import { apiClient } from "../../../../../../lib/api-client";
import { useAppStore } from "../../../../../../store";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } =
    useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
        withCredentials: true,
      });

      setAllContacts(response.data.contacts);
    };
    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-blue-300 hover:text-white cursor-pointer transition-all duration-300"
            onClick={() => setNewChannelModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
          Create New Channel
        </TooltipContent>
      </Tooltip>

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#0a2a6a] border border-blue-900/40 text-white w-[400px] h-[400px] rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white tracking-wide">
              Create New Group
            </DialogTitle>
            <DialogDescription className="text-sm text-blue-200/80">
              Fill in the details below to start a new group chat.
            </DialogDescription>
          </DialogHeader>

          {/* Group Name */}
          <div>
            <Input
              placeholder="Group Name"
              className="rounded-xl p-4 bg-[#12357f] text-white placeholder:text-blue-200/50 border border-blue-800/50 focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>

          {/* Contacts Selector */}
          <div>
            <MultipleSelector
              className="rounded-xl bg-[#12357f] text-white border border-blue-800/50 py-2"
              defaultOptions={allContacts}
              placeholder="Add Members"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-blue-300">
                  No result found
                </p>
              }
              badgeClassName="bg-blue-600 text-white" // overrides selected badge color
              optionClassName="hover:bg-[#0a2a6a] text-white" // overrides dropdown item hover
            />
          </div>

          {/* Create Button */}
          <div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-800 text-white font-medium rounded-xl py-3 transition-all duration-300"
              onClick={createChannel}
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
