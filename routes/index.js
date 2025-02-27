const router = require("express").Router();
const authRoute = require("../domains/authentication/route");
const directoryRoute = require("../domains/directory/route");
const fileRoute = require("../domains/file/route");
const testRoute = require("../domains/test/route");
const searchRoute = require("../domains/search/route");

// console.log("Auth Route Loaded:", authRoute);
// console.log("Directory Route Loaded:", directoryRoute);
// console.log("File Route Loaded:", fileRoute);
// console.log("Test Route Loaded:", testRoute);
// console.log("Search Route Loaded:", searchRoute);
// version one of app
router.use("/api/v1/auth", authRoute);
router.use("/api/v1", directoryRoute);
router.use("/api/v1", fileRoute);
router.use("/api/v1", testRoute);
router.use("/api/v1", searchRoute);

module.exports = router;
