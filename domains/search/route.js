const express = require("express")
const router = express.Router();
const protectRoutes = require("../../middleware/protectRoutes");
const search = require("./controllers/search");
const recentSearchHistory = require("./controllers/recentSearchHistory");

router.get("/:reference_Id/search/:searchTerm", protectRoutes, search);
router.get("/:reference_Id/search", protectRoutes, recentSearchHistory);



module.exports = router; 
