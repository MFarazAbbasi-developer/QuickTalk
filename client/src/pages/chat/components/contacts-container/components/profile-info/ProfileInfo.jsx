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

const ProfileInfo = ({ isOpen }) => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

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
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      className={`absolute bottom-0 h-16 flex items-center justify-between px-4 w-full border-t border-white/10 bg-[#00184d] ${
        isOpen ? "" : "flex-col h-fit gap-8 py-4"
      }`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* User Avatar + Name */}
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 relative">
          <Avatar className="h-10 w-10 rounded-full overflow-hidden">
            {userInfo.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile"
                className="object-cover w-full h-full bg-black rounded-full"
              />
            ) : (
              <div
                className={`uppercase h-10 w-10 text-sm border border-white/20 flex items-center justify-center rounded-full ${getColor(
                  userInfo.color
                )}`}
              >
                {userInfo.firstName ? userInfo.firstName[0] : userInfo.email[0]}
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
      <div
        className={`flex gap-4 items-center ${isOpen ? "" : "flex-col gap-6"} ${
          isHover || isOpen ? "" : "hidden"
        }`}
      >
        <Tooltip>
          <TooltipTrigger>
            <FiEdit2
              className="text-white/70 hover:text-white transition-colors cursor-pointer"
              size={18}
              onClick={() => navigate("/profile")}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
            Edit Profile
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <IoPowerSharp
              className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
              size={18}
              onClick={logOut}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none text-white text-xs p-2 mb-2">
            Logout
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ProfileInfo;
