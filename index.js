const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const flash = require("connect-flash");
const helmet = require("helmet");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  expressSession({
    secret: "ajkd2h938uijdjn",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(flash());
app.use(helmet());
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/express_auth")
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

const authMiddleware = (req, res, next) => {
  if (!req.session.username) {
    res.redirect("/login");
  }
  next();
};
const csrfMiddleware = csurf({ cookie: true });
const parseFormMiddleware = express.urlencoded({ extended: false });

app.get("/", csrfMiddleware, parseFormMiddleware, (req, res) => {
  res.render("index");
});

app.use("/", csrfMiddleware, authRouter);
app.use("/admin", authMiddleware, csrfMiddleware, adminRouter);

app.use((err, req, res, next) => {
  const {
    status = 500,
    message = "Something went wrong :(",
    name = "InternalServer",
  } = err;
  res.status(status).render("errors/general", {
    statusCode: status,
    message: message,
    name: name,
  });
});

app.use((req, res, next) => {
  res.status(404).render("errors/404");
});

app.listen(3000, () => {
  console.log("your app is running on http://localhost:3000");
});
