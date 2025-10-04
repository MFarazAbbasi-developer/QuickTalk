
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "../../../../../../../store";
import { getColor } from "../../../../../../../lib/utils";
import {
  HOST,
  SEARCH_CONTACTS_ROUTE,
} from "../../../../../../../utils/constants";
import moment from "moment";

const MessageInfo = ({ open, setOpen, message }) => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();


  const [read, setRead] = useState([]);
  const [delivered, setDelivered] = useState([]);
  useEffect(() => {
    functionn();
  }, [open]);

  const functionn = () => {
    setRead(message.readBy);
    const x = message.deliveredTo?.filter((user) => !message.readBy?.includes(user._id))
    setDelivered(x);
    console.log("Read By: ", message.readBy?.length)
    console.log("Delivered To: ", delivered.length)
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#0a2a6a] border border-blue-500/30 text-blue-100 w-[400px] h-[400px] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Message Info
          </DialogTitle>
          <DialogDescription className="text-blue-200 text-sm">
            Delivered and seen details for this message.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-3">
          {/* Seen By */}
          <div className="mb-4">
            <h3 className="font-medium text-blue-300 mb-2">👀 Seen By</h3>
            {read?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {read?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-900/30 transition"
                  >
                    <div className="w-10 h-10 relative">
                      <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                        {user.image ? (
                          <AvatarImage
                            src={`${HOST}/${user.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div
                            className={`uppercase h-10 w-10 text-sm flex items-center justify-center rounded-full ${getColor(
                              user.color
                            )}`}
                          >
                            {user.firstName
                              ? user.firstName.split("").shift()
                              : user.email?.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-white font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </span>
                    </div>
                    <span className="text-xs text-blue-300 ml-auto">
                      {moment(user.readAt).format("LT")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-300">No one yet</p>
            )}
          </div>

          {/* Delivered To */}
          <div className="mb-4">
            <h3 className="font-medium text-blue-300 mb-2">✅ Delivered To</h3>
            {delivered?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {delivered?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-900/30 transition"
                  >
                    {/* {console.log(user)} */}
                    <div className="w-10 h-10 relative">
                      <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                        {user.image ? (
                          <AvatarImage
                            src={`${HOST}/${user.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div
                            className={`uppercase h-10 w-10 text-sm flex items-center justify-center rounded-full ${getColor(
                              user.color
                            )}`}
                          >
                            {user.firstName
                              ? user.firstName.split("").shift()
                              : user.email.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-white font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </span>
                    </div>
                    <span className="text-xs text-blue-300 ml-auto">
                      {moment(user.deliveredAt).format("LT")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-300">No one yet</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MessageInfo;
