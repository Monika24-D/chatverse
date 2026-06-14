import User from "../models/user.model.js";

const getUsers = async (req, res) => {
  try {
    console.log("Trying to get users");

    const users = await User.find({}, "username");

    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export default getUsers;