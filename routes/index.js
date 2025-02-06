const router = require("express").Router();
const authRoute = require("../domains/authentication/route");
const directoryRoute = require("../domains/directory/route");
const fileRoute = require("../domains/file/route");
const testRoute = require("../domains/test/route");

router.use("/api/v1/auth", authRoute);
router.use("/api/v1", directoryRoute);
router.use("/api/v1", fileRoute);
router.use("/api/v1", testRoute);

module.exports = router;
