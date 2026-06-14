"use client";

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

import { useAuthStore } from "../zustand/useAuthStore";
import { useUsersStore } from "../zustand/useUsersStore";
import { useChatReceiverStore } from "../zustand/useChatReceiverStore";
import { useChatMsgsStore } from "../zustand/useChatMsgsStore";

import ChatUsers from "../../_components/ChatUsers";

const Chat = () => {
  const [msg, setMsg] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const bottomRef = useRef(null);

  const { authName } = useAuthStore();
  const { updateUsers } = useUsersStore();
  const { chatReceiver } = useChatReceiverStore();

  const {
    addChatMsg,
    setChatMsgs,
    getChatMsgs,
  } = useChatMsgsStore();

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
  const MSG_URL = process.env.NEXT_PUBLIC_MSG_URL;

  const getUserData = async () => {
    try {
      const res = await axios.get(`${AUTH_URL}/users`, {
        withCredentials: true,
      });

      updateUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!authName) return;

    const socketInstance = io(SOCKET_URL, {
      query: {
        username: authName,
      },
      transports: ["websocket"],
    });

    setSocket(socketInstance);

    socketInstance.on("chat msg", (msg) => {
      addChatMsg(msg);
    });

    socketInstance.on("online users", (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on("typing", ({ sender }) => {
      setTypingUser(sender);

      setTimeout(() => {
        setTypingUser(null);
      }, 1200);
    });

    getUserData();

    return () => {
      socketInstance.disconnect();
    };
  }, [authName]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatReceiver || !authName) return;

      try {
        const res = await axios.get(`${MSG_URL}/msgs`, {
          params: {
            sender: authName,
            receiver: chatReceiver,
          },
          withCredentials: true,
        });

        setChatMsgs(authName, chatReceiver, res.data);
      } catch (err) {
        console.log(err);
      }
    };

    loadMessages();
  }, [chatReceiver, authName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatReceiver, getChatMsgs(authName, chatReceiver)?.length]);

  const sendMsg = (e) => {
    e.preventDefault();

    if (!socket || !chatReceiver || !msg.trim()) return;

    const msgToSend = {
      text: msg,
      sender: authName,
      receiver: chatReceiver,
      time: new Date().toISOString(),
    };

    addChatMsg(msgToSend);

    socket.emit("chat msg", msgToSend);

    setMsg("");
  };

  const handleTyping = () => {
    if (!socket || !chatReceiver) return;

    socket.emit("typing", {
      sender: authName,
      receiver: chatReceiver,
    });
  };

  const messages = getChatMsgs(authName, chatReceiver);

  return (
    <div className="h-screen flex bg-[#F5EFE6] text-[#3E3E3E]">
      <div className="w-1/4 bg-[#E8DFD6] border-r border-[#DCCFC0] flex flex-col">
        <div className="p-4 bg-[#DCCFC0] shadow-sm">
          <h1 className="text-xl font-bold">ChatVerse</h1>
          <p className="text-xs opacity-70">Realtime messaging</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatUsers onlineUsers={onlineUsers} />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="p-4 bg-[#DCCFC0] shadow-sm">
          <h2 className="font-semibold">
            {chatReceiver || "Select a user"}
          </h2>

          {chatReceiver && (
            <p className="text-xs text-green-600">🟢 online</p>
          )}
        </div>

        {typingUser === chatReceiver && (
          <div className="px-4 py-1 text-sm italic text-gray-500">
            {typingUser} is typing...
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages?.map((m, i) => {
            const isMe = m.sender === authName;

            return (
              <div
                key={i}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-3xl shadow-sm max-w-[60%] text-sm ${
                    isMe
                      ? "bg-[#CBBBA7] text-[#2F2F2F]"
                      : "bg-white text-[#2F2F2F]"
                  }`}
                >
                  <p>{m.text}</p>

                  <p className="text-[10px] mt-1 opacity-60 text-right">
                    {m.sender}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={sendMsg}
          className="p-4 bg-[#E8DFD6] flex gap-3 items-center"
        >
          <input
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-full outline-none bg-white shadow-sm"
          />

          <button className="px-6 py-3 bg-[#B8A58D] text-white rounded-full hover:bg-[#A28E76] transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;