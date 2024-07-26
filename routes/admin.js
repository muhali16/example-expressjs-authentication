const express = require("express");

const router = express.Router();
const User = require("../models/user");

router.use(async (req, res, next) => {
  const { username } = req.session;
  const user = await User.findOne({ username: username });
  res.locals.user = user;
  next();
});

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/user", (req, res) => {
  res.redirect("/admin/user/" + req.session.username);
});

router.get("/user/:username", async (req, res) => {
  const { username } = req.params;
  const userData = await User.findOne({ username });
  res.render("admin/user/index", { userData, _csrf: req.csrfToken() });
});

router.put("/user/:usernameParams", async (req, res) => {
  const { firstName, lastName, username, email } = req.body;
  const { usernameParams } = req.params;
  const userUpdate = await User.updateOne(
    { username: usernameParams },
    { firstName, lastName, username, email },
  );
  req.session.username = username;
  console.log("Update", userUpdate);
  res.redirect("/admin/user");
});

module.exports = router;
