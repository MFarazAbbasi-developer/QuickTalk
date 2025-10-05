import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";
import { Users } from "lucide-react";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } =
    useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
          withCredentials: true,
        });
        setAllContacts(response.data.contacts);
      } catch (error) {
        console.log(error);
      }
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
      {/* Tooltip Trigger */}
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-blue-300 hover:text-white cursor-pointer transition-all duration-300"
            onClick={() => setNewChannelModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
          Create New Group
        </TooltipContent>
      </Tooltip>

      {/* Modal */}
      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-gradient-to-b from-[#00184d] to-[#0a2a6a] border border-blue-500/40 text-blue-100 w-[400px] h-[440px] flex flex-col rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.25)]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <Users className="text-[#10B981]" size={20} />
              Create a New Group
            </DialogTitle>
            <DialogDescription className="text-blue-200 text-sm">
              Gather your friends or teammates in one place.
            </DialogDescription>
          </DialogHeader>

          {/* Group Name */}
          <div className="mt-2">
            <Input
              placeholder="Enter group name..."
              className="rounded-lg px-4 py-3 bg-[#00184d]/60 text-white placeholder:text-blue-300 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>

          {/* Members Selector */}
          <div className="mt-3">
            <MultipleSelector
              className="rounded-lg bg-[#00184d]/60 text-white border border-blue-500/20 py-2"
              defaultOptions={allContacts}
              placeholder="Add group members..."
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className="text-center text-sm text-blue-300 py-3">
                  No contacts found.
                </p>
              }
              badgeClassName="bg-blue-600 text-white"
              optionClassName="hover:bg-blue-900/30 text-white transition"
            />
          </div>

          {/* Create Button */}
          <div className="mt-5">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold rounded-xl py-3 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={createChannel}
            >
              Create Group
            </Button>
          </div>

          {/* Empty State (Optional) */}
          {allContacts.length === 0 && (
            <div className="flex-1 flex flex-col justify-center items-center mt-4 text-blue-200 text-center">
              <div className="text-5xl mb-3 animate-pulse">👥</div>
              <h3 className="text-lg font-medium">No contacts available yet</h3>
              <p className="text-xs text-blue-300 mt-1">
                Start chatting first to add people in your groups.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
