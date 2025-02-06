const test = require("./controller");
const router = require("express").Router();

router.get("/test", test);

module.exports = router;
