import React from "react";
import { useAppStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import ChatContainer from "./components/chat-container/ChatContainer";
import SampleContactsContainer from "./components/contacts-container/SampleContactsContainer";
import SampleContactsContainer2 from "./components/contacts-container/SampleContactsContainer2";
import EmptyChatContainer from "./components/empy-chat-container/EmptyChatContainer";
import { GET_USER_STATUSES_ROUTE } from "../../utils/constants";
import { apiClient } from "../../lib/api-client";

const Chat = () => {
  const {
    userInfo,
    selectedChatType,
    isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,
    setUserStatuses
  } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const {data} = await apiClient.get(GET_USER_STATUSES_ROUTE, {
          withCredentials: true,
        });
        console.log(data)
        setUserStatuses(data);
      } catch (error) {
        console.error("Error fetching user statuses:", error);
      }
    };

    fetchStatuses();
  }, [setUserStatuses]);


  

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {isUploading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex justify-center items-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">Uploading File</h5>
          {fileUploadProgress}%
        </div>
      )}
      {isDownloading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex justify-center items-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-5xl animate-pulse">Downloading File</h5>
          {fileDownloadProgress}%
        </div>
      )}
      <SampleContactsContainer />
      <SampleContactsContainer2 />
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
};

export default Chat;


