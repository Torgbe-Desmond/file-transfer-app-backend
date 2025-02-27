const protectRoutes = require("../../middleware/protectRoutes");
const deleteUser = require("./controllers/delete");
const generateTokenForVerification = require("./controllers/generateTokenForVerification");
const loginUser = require("./controllers/login");
const logout = require("./controllers/Logout");
const registerUser = require("./controllers/register");
const sendEmailForVerification = require("./controllers/sendEmailForVerification");
const updatePassword = require("./controllers/updatePassword");
const router = require("express").Router();

// console.log("✅ protectRoutes middleware loaded:", protectRoutes);
// console.log("✅ deleteUser controller loaded:", deleteUser);
// console.log("✅ generateTokenForVerification controller loaded:", generateTokenForVerification);
// console.log("✅ loginUser controller loaded:", loginUser);
// console.log("✅ logout controller loaded:", logout);
// console.log("✅ registerUser controller loaded:", registerUser);
// console.log("✅ sendEmailForVerification controller loaded:", sendEmailForVerification);
// console.log("✅ updatePassword controller loaded:", updatePassword);


router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/:reference_Id /delete", protectRoutes, deleteUser);
router.post("/update-password", protectRoutes, updatePassword);
router.get(
  "/:reference_Id/get-verification-token",
  generateTokenForVerification
);
router.post("/send-email-verification", sendEmailForVerification);
router.post("/logout", logout);

module.exports = router;
