import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "../../../../../../store";
import { HOST, LOGOUT_ROUTE } from "../../../../../../utils/constants";
import { getColor } from "../../../../../../lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../../../../lib/api-client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProfileInfo = ({ isOpen }) => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [isHover, setIsHover] = useState(false);

  const logOut = async () => {
    try {
      const response = await apiClient.post(
        LOGOUT_ROUTE,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`absolute bottom-0 w-full transition-all duration-300 ${
        isOpen ? "h-20 px-4" : "h-fit py-3"
      }`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className={`flex ${
          isOpen
            ? "items-center justify-between"
            : "flex-col items-center justify-center gap-3"
        }`}
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
              {userInfo.image ? (
                <AvatarImage
                  src={`${HOST}/${userInfo.image}`}
                  alt="profile"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <div
                  className={`uppercase h-10 w-10 text-sm border border-white/20 flex items-center justify-center rounded-full ${getColor(
                    userInfo.color
                  )}`}
                >
                  {userInfo.firstName
                    ? userInfo.firstName[0]
                    : userInfo.email[0]}
                </div>
              )}
            </Avatar>
          </div>
          {isOpen && (
            <span className="text-sm font-medium text-white truncate max-w-[100px]">
              {userInfo.firstName && userInfo.lastName
                ? `${userInfo.firstName} ${userInfo.lastName}`
                : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {(isHover || isOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center ${
                isOpen ? "gap-4" : "flex-col gap-5 mt-2"
              }`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <FiEdit2
                    className="text-white/70 hover:text-white transition-transform duration-200 cursor-pointer hover:scale-110"
                    size={18}
                    onClick={() => navigate("/profile")}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0b1a4b] border border-[#1c3f96] text-white text-xs p-2">
                  Edit Profile
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <IoPowerSharp
                    className="text-red-500 hover:text-red-400 transition-transform duration-200 cursor-pointer hover:scale-110"
                    size={18}
                    onClick={logOut}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#0b1a4b] border border-[#1c3f96] text-white text-xs p-2">
                  Logout
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileInfo;
