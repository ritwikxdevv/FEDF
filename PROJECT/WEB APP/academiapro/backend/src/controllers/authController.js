const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const register = async(req, res) => {

try {

// Destructure but deliberately IGNORE any 'role' sent from the client.
// All self-registered users are students. Admin accounts are seeded via
// environment variables in server.js or created directly in MongoDB.
const { name, email, password } = req.body;

if (!name || !email || !password) {
  return res.status(400).json({ message: "Name, email, and password are required." });
}

if (password.length < 6) {
  return res.status(400).json({ message: "Password must be at least 6 characters." });
}

const userExists = await User.findOne({ email: email.trim().toLowerCase() });

if (userExists) {
return res.status(400).json({
message: "An account with this email already exists."
});
}

const user = await User.create({
name: name.trim(),
email: email.trim().toLowerCase(),
password,
role: 'student'   // ← always 'student'; cannot be overridden by client
});

res.status(201).json({
_id: user._id,
name: user.name,
email: user.email,
role: user.role,
token: generateToken(user._id)
});

}
catch(error) {

res.status(500).json({
message: error.message
});

}

};


const login=async(req,res)=>{

try{

const {email,password}=req.body;

const user=await User.findOne({email});

if(
user &&
await bcrypt.compare(password,user.password)
){

res.json({
_id:user._id,
name:user.name,
email:user.email,
role:user.role,
token:generateToken(user._id)
});

}
else{

res.status(401).json({
message:"Invalid credentials"
});

}

}
catch(error){

res.status(500).json({
message:error.message
});

}

};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, password } = req.body;

    if (name) {
      user.name = name.trim();
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use by another account." });
      }
      user.email = email.trim().toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
      }
      user.password = password; // pre-save hook in User model will hash it automatically
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={
register,
login,
getProfile,
updateProfile
};