import { useRef, useState } from "react";
import { useAppStore } from "../../../../../../store";
import moment from "moment";
import { useEffect } from "react";
import { apiClient } from "../../../../../../lib/api-client";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from "../../../../../../utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "../../../../../../lib/utils";
import { toast } from "sonner";
import { BsCheck, BsCheckAll } from "react-icons/bs"; // WhatsApp-like ticks
import { Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setIsDownloading,
    setFileDownloadProgress,
    messageStatuses,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
          console.log("response.data.messages");
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      // scrollRef.current.scrollIntoView({ behavior: "smooth" });
      scrollRef.current.scrollIntoView();
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.createdAt).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentCompleted);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);

    setIsDownloading(false);
    setFileDownloadProgress(0);
    toast.success("Download completed.");
  };

  const renderDMMessages = (message) => {
    // determine status icon
    const renderMessageStatus = () => {
      let messageStatus = "sent"; // default status
      if (
        messageStatuses[selectedChatData._id] &&
        messageStatuses[selectedChatData._id][message._id]
      ) {
        messageStatus = messageStatuses[selectedChatData._id][
          message._id
        ].readBy.includes(message.recipient)
          ? "read"
          : messageStatuses[selectedChatData._id][
              message._id
            ].deliveredTo.includes(message.recipient)
          ? "delivered"
          : "sent";
      } else {
        messageStatus =
          message.readBy.find((x) => x._id === message.recipient)?._id !==
          undefined
            ? "read"
            : message.deliveredTo.find((x) => x._id === message.recipient)
                ?._id !== undefined
            ? "delivered"
            : "sent";
      }

      if (message.sender !== userInfo.id) {
        return null; // don't show status for received messages
      }
      if (messageStatus === "read") {
        return <BsCheckAll className="inline text-blue-500 ml-2 text-lg" />;
      } else if (messageStatus === "delivered") {
        return <BsCheckAll className="inline text-gray-400 ml-2 text-lg" />;
      } else if (messageStatus === "sent") {
        return <BsCheck className="inline text-gray-400 ml-2 text-lg" />;
      }

      return null;
    };

    return (
      <div
        className={`${
          message.sender === selectedChatData._id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#4f46e5] text-[#ffffff]"
                : "bg-[#e0e7ff] text-[#1e1b4b]"
            } inline-block p-4 rounded-md my-1 max-w-[50%] break-words text-left`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-[#4f46e5] text-[#ffffff]"
                : "bg-[#e0e7ff] text-[#1e1b4b]"
            } inline-block p-4 rounded-md my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                  alt="image"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-[#6b7280]">
          {moment(message.createdAt).format("LT")}
          {renderMessageStatus()}
        </div>
      </div>
    );
  };
  const [openStatus, setOpenStatus] = useState(false);
  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#4f46e5] text-[#ffffff]"
                : "bg-[#e0e7ff] text-[#1e1b4b]"
            } inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9 text-left`}
          >
            {message.content}
            {/* {openStatus && (
              <MessageInfo
                open={openStatus}
                setOpen={setOpenStatus}
                message={message}
              />
            )} */}
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#4f46e5] text-[#ffffff]"
                : "bg-[#e0e7ff] text-[#1e1b4b]"
            } inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={300}
                  width={300}
                  alt="image"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}

        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#111827]">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-[#6b7280]">
              {moment(message.createdAt).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#6b7280] mt-1">
            {moment(message.createdAt).format("LT")}
            {message.sender._id === userInfo.id && (
              <button onClick={() => setOpenStatus(true)}>
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[calc(65vw-40px)] lg:w-[calc(70vw-80px)] xl:w-[calc(75vw-80px)] w-full">
      {renderMessages()}
      <div ref={scrollRef}>
        {showImage && (
          <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
            <div>
              <img
                src={`${HOST}/${imageURL}`}
                alt=""
                className="h-[80vh] w-full bg-cover"
              />
            </div>
            <div className="flex gap-5 fixed top-0 mt-5">
              <button
                className="bg-black/40 p-3 text-2xl rounded-full hover:bg-black/70 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(imageURL)}
              >
                <IoMdArrowRoundDown />
              </button>
              <button
                className="bg-black/40 p-3 text-2xl rounded-full hover:bg-black/70 cursor-pointer transition-all duration-300"
                onClick={() => {
                  setShowImage(false);
                  setImageURL(null);
                }}
              >
                <IoCloseSharp />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageContainer;

const MessageInfo = () => {
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
