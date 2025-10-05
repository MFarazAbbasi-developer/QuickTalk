import { useRef, useState, useEffect } from "react";
import { useAppStore } from "../../../../../../store";
import moment from "moment";
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
import { BsCheck, BsCheckAll } from "react-icons/bs";
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
  const [openStatus, setOpenStatus] = useState(false);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) setSelectedChatMessages(response.data.messages);
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
        if (response.data.messages) setSelectedChatMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView();
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
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
    const renderMessageStatus = () => {
      let messageStatus = "sent";
      if (messageStatuses[selectedChatData._id] && messageStatuses[selectedChatData._id][message._id]) {
        messageStatus = messageStatuses[selectedChatData._id][message._id].readBy.includes(message.recipient)
          ? "read"
          : messageStatuses[selectedChatData._id][message._id].deliveredTo.includes(message.recipient)
          ? "delivered"
          : "sent";
      } else {
        messageStatus =
          message.readBy.find((x) => x._id === message.recipient)?._id !== undefined
            ? "read"
            : message.deliveredTo.find((x) => x._id === message.recipient)?._id !== undefined
            ? "delivered"
            : "sent";
      }

      if (message.sender !== userInfo.id) return null;
      if (messageStatus === "read") return <BsCheckAll className="inline text-blue-400 ml-2 text-lg" />;
      else if (messageStatus === "delivered") return <BsCheckAll className="inline text-gray-400 ml-2 text-lg" />;
      else if (messageStatus === "sent") return <BsCheck className="inline text-gray-400 ml-2 text-lg" />;
      return null;
    };

    return (
      <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                : "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
            } inline-block px-5 py-3 rounded-2xl my-1 max-w-[60%] break-words text-left transition-all duration-300`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender !== selectedChatData._id
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                : "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
            } inline-block p-4 rounded-2xl my-1 max-w-[60%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer hover:scale-[1.02] transition-all duration-300"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} alt="image" className="rounded-lg" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-white/10 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-white/10 p-3 text-2xl rounded-full hover:bg-white/20 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {moment(message.createdAt).format("LT")}
          {renderMessageStatus()}
        </div>
      </div>
    );
  };

  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-5 ${message.sender._id !== userInfo.id ? "text-left" : "text-right"}`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                : "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
            } inline-block px-5 py-3 rounded-2xl my-1 max-w-[60%] break-words ml-9 text-left`}
          >
            {message.content}
          </div>
        )}

        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                : "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
            } inline-block p-4 rounded-2xl my-1 max-w-[60%] break-words ml-9`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer hover:scale-[1.02] transition-all duration-300"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} alt="image" className="rounded-lg" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-white/10 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-white/10 p-3 text-2xl rounded-full hover:bg-white/20 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}

        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3 mt-1">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden border border-white/20 shadow-[0_0_5px_rgba(255,255,255,0.3)]">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full rounded-full"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-sm flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName[0]
                  : message.sender.email[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/90">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-gray-400">{moment(message.createdAt).format("LT")}</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400 mt-1">
            {moment(message.createdAt).format("LT")}
            {message.sender._id === userInfo.id && (
              <button onClick={() => setOpenStatus(true)}>
                <Info className="w-4 h-4 text-gray-400 hover:text-white transition-all" />
              </button>
            )}
          </div>
        )}
      </div>
    );
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
            <div className="text-center text-gray-400 my-4 text-sm">
              {moment(message.createdAt).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-6 px-8 bg-[#0a2a6a] text-white transition-all duration-500">
      {renderMessages()}
      <div ref={scrollRef}>
        {showImage && (
          <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-xl bg-black/50">
            <div>
              <img
                src={`${HOST}/${imageURL}`}
                alt=""
                className="h-[80vh] w-auto rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              />
            </div>
            <div className="flex gap-5 fixed top-5 right-10">
              <button
                className="bg-white/10 p-3 text-2xl rounded-full hover:bg-white/20 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(imageURL)}
              >
                <IoMdArrowRoundDown />
              </button>
              <button
                className="bg-white/10 p-3 text-2xl rounded-full hover:bg-white/20 cursor-pointer transition-all duration-300"
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
