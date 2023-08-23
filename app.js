import "dotenv/config";
import express from "express";
import encrypt from "mongoose-encryption";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import ejs from "ejs";
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});
const User = mongoose.model("User", userSchema);
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  try {
    newUser.save();
    console.log("Successfully registered");
    res.render("secrets");
  } catch (err) {
    console.error("Fail to register !");
  }
});
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const foundUser = await User.findOne({
      email: username,
    });

    if (foundUser) {
      if (foundUser.password === password) {
        res.render("secrets");
      } else {
        res.render("login");
      }
    } else {
      res.render("login");
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("An error occurred during login."); // Send a simple error message to the user
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
