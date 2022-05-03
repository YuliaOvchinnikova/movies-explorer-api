const router = require("express").Router();
const cookieParser = require("cookie-parser");

const auth = require("../middlewares/auth");

router.use(require("./register"));

router.use(cookieParser());
router.use(auth);

router.get("/signout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

router.use("/users", require("./users"));
router.use("/movies", require("./movies"));

module.exports = router;
