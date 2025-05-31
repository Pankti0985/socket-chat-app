const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ status: true, user: userResponse });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "Invalid email or password", status: false });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.json({ msg: "Invalid email or password", status: false });

    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ status: true, user: userResponse });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select(["name", "email", "_id"]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
