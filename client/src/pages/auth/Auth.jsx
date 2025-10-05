import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Victory from "../../assets/victory.svg";
// import Background from "../../assets/login2.png";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "../../lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "../../utils/constants";
import { useAppStore } from "../../store";
import { MessageCircle } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateSignup = () => {
    if (!email) return toast.error("Email is required.");
    if (!password) return toast.error("Password is required.");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match.");
    return true;
  };

  const validateLogin = () => {
    if (!email) return toast.error("Email is required.");
    if (!password) return toast.error("Password is required.");
    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    const response = await apiClient.post(
      LOGIN_ROUTE,
      { email, password },
      { withCredentials: true }
    );
    if (response.data.user?.id) {
      setUserInfo(response.data.user);
      navigate(response.data.user.profileSetup ? "/chat" : "/profile");
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    const response = await apiClient.post(
      SIGNUP_ROUTE,
      { email, password },
      { withCredentials: true }
    );
    if (response.status === 201) {
      setUserInfo(response.data.user);
      navigate("/profile");
    }
  };

  return (
    <div
  className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#00184d] via-[#002b75] to-[#0f2f7a] relative"
>
  {/* Overlay for subtle glow */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

  <div className="relative z-10 flex flex-col md:flex-row bg-[#0a1f52]/60 border border-[#1c3faa] shadow-2xl rounded-2xl overflow-hidden w-[90vw] max-w-5xl">
    {/* Left: Welcome Section */}
    <div className="hidden md:flex flex-col justify-center items-center text-white w-1/2 p-10 border-r border-[#0f2f7a]">
      <div className="p-5 rounded-full bg-blue-600/20 border border-blue-400 shadow-md shadow-blue-500/30 mb-6">
        <MessageCircle className="w-14 h-14 text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-blue-300 tracking-wide">
        Welcome to QuickTalk
      </h1>
      <p className="text-gray-300 text-center leading-relaxed">
        Secure. Fast. Real-time messaging for everyone — where conversations
        feel alive.
      </p>
    </div>


        {/* Right: Auth Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center text-white">
          <Tabs className="w-full max-w-sm" defaultValue="login">
            <TabsList className="flex w-full mb-6 bg-transparent border-b border-[#1c3faa]/50">
              <TabsTrigger
                value="login"
                className="flex-1 text-center text-gray-300 data-[state=active]:text-black 
                data-[state=active]:border-b-2 data-[state=active]:border-blue-400 transition-all duration-300"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex-1 text-center text-gray-300 data-[state=active]:text-black 
                data-[state=active]:border-b-2 data-[state=active]:border-blue-400 transition-all duration-300"
              >
                Signup
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="flex flex-col gap-5">
              <Input
                placeholder="Email"
                type="email"
                className="bg-[#0f2f7a]/40 text-white border border-[#1c3faa] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 rounded-full p-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="bg-[#0f2f7a]/40 text-white border border-[#1c3faa] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 rounded-full p-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-full py-5 text-lg shadow-md hover:shadow-blue-500/30"
              >
                Login
              </Button>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="flex flex-col gap-5">
              <Input
                placeholder="Email"
                type="email"
                className="bg-[#0f2f7a]/40 text-white border border-[#1c3faa] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 rounded-full p-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="bg-[#0f2f7a]/40 text-white border border-[#1c3faa] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 rounded-full p-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="bg-[#0f2f7a]/40 text-white border border-[#1c3faa] placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 rounded-full p-5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                onClick={handleSignup}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-full py-5 text-lg shadow-md hover:shadow-blue-500/30"
              >
                Signup
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
