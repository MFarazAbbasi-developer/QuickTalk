import React from "react";
import { useAppStore } from "../../store";
import { IoArrowBack } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { colors, getColor } from "../../lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { apiClient } from "../../lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required.");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required.");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          { firstName, lastName, color: selectedColor },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Updated Successfully.");
          navigate("/chat");
        }
      } catch (error) {}
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup the Profile first.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImagechange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Image updated successfully.");
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        toast.success("Image removed successfully.");
        setImage(null);
      }
    } catch (error) {}
  };

  return (
    <div className="bg-[#00184d] min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col gap-8 w-full max-w-2xl bg-[#0a2a6a]/40 rounded-2xl shadow-lg p-8 border border-white/10">
        {/* Back Button */}
        <div onClick={handleNavigate} className="cursor-pointer w-fit">
          <IoArrowBack className="text-3xl text-white/80 hover:text-white transition-colors" />
        </div>

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar Upload */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden ring-2 ring-white/10">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-full w-full text-4xl flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName ? firstName[0] : userInfo.email[0]}
                </div>
              )}
            </Avatar>

            {/* Hover Overlay */}
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-2xl" />
                ) : (
                  <FaPlus className="text-white text-2xl" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImagechange}
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
            />
          </div>

          {/* Form Fields */}
          <div className="flex-1 flex flex-col gap-5 w-full text-white">
            <input
              placeholder="Email"
              type="email"
              disabled
              value={userInfo.email}
              className="w-full rounded-lg p-4 bg-transparent border border-white/10 text-white/70"
            />
            <input
              placeholder="First Name"
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              className="w-full rounded-lg p-4 bg-transparent border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <input
              placeholder="Last Name"
              type="text"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              className="w-full rounded-lg p-4 bg-transparent border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />

            {/* Color Picker */}
            <div className="flex gap-3 flex-wrap">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 border border-white/20 ${
                    selectedColor === index
                      ? "ring-2 ring-blue-500 scale-110"
                      : ""
                  }`}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          className="h-14 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
