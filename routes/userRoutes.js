const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateProfile,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(registerUser)
  .get(protect, allUsers)
  .put(protect, updateProfile);
router.route("/login").post(authUser);

module.exports = router;
