const express = require("express")
const router = express.Router();
const protectRoutes = require("../../middleware/protectRoutes");
const search = require("./controller");

router.get("/:reference_Id/search/:searchTerm", protectRoutes, search);

module.exports = router; 
