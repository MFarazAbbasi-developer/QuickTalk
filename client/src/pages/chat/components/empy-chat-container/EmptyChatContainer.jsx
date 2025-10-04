import Lottie from "lottie-react";
import animationData from '@/assets/lottie-json'
const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#f9fafb] md:flex flex-col justify-center items-center hidden duration-1000 transition-all ">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ height: 200, width: 200 }}
      />
      <div className="text-black/80 flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h3 className="poppins-medium ">
          Hi<span className="text-blue-500">!</span> Welcome to
          <span className="text-blue-500"> QuickTalk</span> Chat App
          <span className="text-blue-500">.</span>
        </h3>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
