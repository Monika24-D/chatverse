import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateJWTTokenAndSetCookie from "../utils/generateToken.js";


const signup = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const foundUser = await User.findOne({ username });

    if (foundUser) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    generateJWTTokenAndSetCookie(user._id, res);

    return res.status(201).json({
      message: "User signed up successfully"
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};


export const login = async (req, res) => {
    console.log("request body:", req.body);
   try {
       const {username, password} = req.body;
       
       const foundUser = await User.findOne({username});
       if(!foundUser) {
           return res.status(401).json({message: 'auth failed'});
       } else {
              const passwordMatch = await bcrypt.compare(password, foundUser.password);
                if(!passwordMatch) {
                    return res.status(401).json({message: 'auth failed'});
                }
           
           generateJWTTokenAndSetCookie(foundUser._id, res);
           res.status(201).json({_id: foundUser._id, username: foundUser.username});
       }
   } catch (error) {
    console.error("SIGNUP ERROR:");
    console.error(error);

    return res.status(500).json({
        message: "login failed"
    });

   }
}

export default signup;