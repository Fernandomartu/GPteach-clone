const { Router } = require("express");
const { startThread } = require("../controllers/ai");
const { userAuth } = require("../middlewares/auth-middleware");

const router = Router();

router.post("/start-thread", userAuth, startThread);

module.exports = router;
