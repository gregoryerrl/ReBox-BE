const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const http = require("http");
const {config} = require("dotenv");
const {v4: uuidv4} = require("uuid");

// Initialize app and body parser middleware
const app = express();
const server = http.createServer(app);

// Increase the limit of the request payload to 50MB
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));

app.use(
  cors({
    origin: "*",
  })
);

config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  password: String,
});

// Define User model
const User = mongoose.model("User", userSchema);

const boxSchema = new mongoose.Schema({
  label: String,
  content: String,
  manufacturer: String,
  details: String,
  empty: Boolean,
});

// Define User model
const Box = mongoose.model("Box", boxSchema);

// POST request for registering new box
app.post("/createbox", async (req, res) => {
  try {
    const newBox = new Box({
      label: req.body.label,
      content: req.body.content,
      manufacturer: req.body.manufacturer,
      details: req.body.details,
      empty: req.body.empty,
    });
    await newBox.save();
    res.status(201).json({message: "Box created successfully"});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// POST request for registering new user
app.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({username: req.body.username, password: hash});
    await newUser.save();
    res.status(201).json({message: "User created successfully"});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (!user) throw new Error("User not found");
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) throw new Error("Incorrect password");
    // Get the user by ID and send it in the response
    const foundUser = await User.findById(user._id);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: foundUser,
    });
  } catch (err) {
    res.status(401).json({success: false, error: err.message});
  }
});

// GET request for getting all boxes
app.get("/boxes", async (req, res) => {
  try {
    const boxes = await Box.find({});
    res.status(200).json({boxes});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// GET request for getting box by id
app.get("/box/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // res.status(200).json({id});
    const box = await Box.findById({_id: id});
    res.status(200).json({box});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// GET request for getting number of boxes
app.get("/boxes/count", async (req, res) => {
  try {
    const boxes = await Box.find({});
    res.status(200).json({count: boxes.length});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

//DELETE request for deleting box by id

app.delete("/box/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const box = await Box.findByIdAndDelete({_id: id});
    res.status(200).json({box});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

//PUT request for updating box by id
app.put("/box/:id", async (req, res) => {
  try {
    const payload = {
      label: req.body.label,
      content: req.body.content,
      manufacturer: req.body.manufacturer,
      details: req.body.details,
      empty: req.body.empty,
    };
    const box = await Box.findByIdAndUpdate({_id: id}, {payload});
    res.status(200).json({box});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Server started on port ${port}`));
