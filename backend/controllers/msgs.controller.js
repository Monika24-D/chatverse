import Conversation from "../models/chat.model.js";

// ================= SAVE MESSAGE =================
export const addMsgToConversation = async (participants, msg) => {
  try {
    let conversation = await Conversation.findOne({
      users: { $all: participants },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        users: participants,
        msgs: [],
      });
    }

    conversation.msgs.push(msg);
    await conversation.save();
  } catch (error) {
    console.log("Error adding message:", error.message);
  }
};

// ================= GET MESSAGES =================
export const getMsgsForConversation = async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    if (!sender || !receiver) {
      return res.status(400).json({
        error: "sender and receiver required",
      });
    }

    const participants = [sender, receiver];

    const conversation = await Conversation.findOne({
      users: { $all: participants },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    return res.json(conversation.msgs);
  } catch (error) {
    console.log("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};