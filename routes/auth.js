const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const router = express.Router();

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      // mengecek apakah error validasi
      if (err.name === "ValidationError") {
        // kumpulkan error validasi
        let validationErrors = [];
        Object.values(err.errors).map((err) => {
          validationErrors.push(err.message);
        });
        req.flash("oldValue", req.body);
        req.flash("validationErrors", validationErrors); // kirim error validasi
        res.redirect(req.headers.referer);
      }
      next(err);
    });
  };
}

router.get("/register", async (req, res) => {
  res.render("auth/register", {
    validationErrors: req.flash("validationErrors"),
    oldValue: req.flash("oldValue")[0],
    _csrf: req.csrfToken(),
  });
});

router.post(
  "/register",
  wrapAsync(async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
    });
    await user.save();
    res.redirect("/login");
  }),
);

router.get("/login", (req, res) => {
  if (req.session.username) {
    res.redirect("/admin");
  }
  res.render("auth/login", {
    validationErrors: req.flash("validationErrors"),
    loginError: req.flash(),
    _csrf: req.csrfToken(),
  });
});

router.post(
  "/login/post",
  express.urlencoded({ extended: false }),
  wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.attempt(username, password);
    console.log(user);
    if (!user) {
      req.flash("loginError", "Incorrect username or password.");
      res.redirect("/login");
    }

    req.session.username = user.username;
    res.redirect("/admin");
  }),
);

router.get("/signout", (req, res) => {
  req.session.user_id = null;
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
