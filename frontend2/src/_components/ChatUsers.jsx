"use client";

import React from "react";

import { useUsersStore } from "../app/zustand/useUsersStore";
import { useChatReceiverStore } from "../app/zustand/useChatReceiverStore";
import { useChatMsgsStore } from "../app/zustand/useChatMsgsStore";
import { useAuthStore } from "../app/zustand/useAuthStore";

const ChatUsers = ({ onlineUsers }) => {
  const { users } = useUsersStore();
  const { updateChatReceiver, chatReceiver } = useChatReceiverStore();
  const { getChatMsgs } = useChatMsgsStore();
  const { authName } = useAuthStore();

  const setChatReceiver = (user) => {
    updateChatReceiver(user.username);

    // 🔥 optional improvement (helps persistence UX)
    localStorage.setItem("lastChatUser", user.username);
  };

  return (
    <div className="p-2 space-y-2">

      {users?.map((user) => {
        if (!user || user.username === authName) return null;

        const isActive = chatReceiver === user.username;
        const isOnline = onlineUsers?.includes(user.username);

        // 🔥 SAFE message fetch
        const msgs = getChatMsgs(authName, user.username) || [];
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

        return (
          <div
            key={user._id}
            onClick={() => setChatReceiver(user)}
            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition
              ${isActive ? "bg-[#DCCFC0]" : "hover:bg-[#E8DFD6]"}`}
          >

            {/* AVATAR */}
            <div className="w-10 h-10 rounded-full bg-[#B8A58D] flex items-center justify-center text-white font-semibold">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <p className="font-medium">{user.username}</p>

              <p className="text-xs text-gray-600 truncate">
                {lastMsg?.text || "Start chatting..."}
              </p>
            </div>

            {/* STATUS */}
            <div className="flex flex-col items-end gap-1">

              {isOnline && (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              )}

              {!isActive && lastMsg && (
                <span className="text-[10px] bg-[#B8A58D] text-white px-2 py-0.5 rounded-full">
                  new
                </span>
              )}

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default ChatUsers;