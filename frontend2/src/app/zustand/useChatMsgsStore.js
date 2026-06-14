import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatMsgsStore = create(
  persist(
    (set, get) => ({
      messagesByChat: {},

      // GET chat key
      getChatKey: (user1, user2) => {
        return [user1, user2].sort().join("_");
      },

      // GET messages
      getChatMsgs: (user1, user2) => {
        const key = get().getChatKey(user1, user2);
        return get().messagesByChat[key] || [];
      },

      // SET full history
      setChatMsgs: (user1, user2, msgs) => {
        const key = get().getChatKey(user1, user2);

        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [key]: msgs,
          },
        }));
      },

      // ADD message (with duplicate protection)
      addChatMsg: (msg) => {
        const key = get().getChatKey(msg.sender, msg.receiver);
        const existing = get().messagesByChat[key] || [];

        // 🔥 prevent duplicates
        const alreadyExists = existing.some(
          (m) =>
            m.text === msg.text &&
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            m.time === msg.time
        );

        if (alreadyExists) return;

        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [key]: [...existing, msg],
          },
        }));
      },

      // optional: clear all chats (logout use)
      clearChats: () => set({ messagesByChat: {} }),
    }),
    {
      name: "chat-storage", // 🔥 stored in localStorage
    }
  )
);