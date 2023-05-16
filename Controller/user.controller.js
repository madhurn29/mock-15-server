const { UserModel } = require("../Model/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 4;
var jwt = require("jsonwebtoken");
const RegisterUser = async (req, res) => {
  const { email, pass } = req.body;
  try {
    const ExistingUser = await UserModel.findOne({ email });
    if (ExistingUser) {
      res.status(400).send({ message: "Already registered, Please Login " });
    } else {
      bcrypt.hash(pass, saltRounds, async (err, hash) => {
        // Store hash in your password DB.
        if (err) res.status(400).send({ message: err.message });

        const user = new UserModel({ email, pass: hash });
        await user.save();

        res.status(201).send({ message: "Registration successful" });
      });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const LoginUser = async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(pass, user.pass, async (err, result) => {
        // result == false
        if (result) {
          res.status(200).send({
            message: "Login successful",
            token: jwt.sign({ userId: user._id }, "mock15"),
          });
        } else {
          res.status(400).send({ message: "Invalid Password" });
        }
      });
    } else {
      res.status(400).send({
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
module.exports = { RegisterUser, LoginUser };
