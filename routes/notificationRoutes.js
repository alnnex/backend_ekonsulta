const express = require("express");
const {
  notifications,
  getNotifications,
  deleteNotif,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, notifications);
router.route("/fetchNotif").post(protect, getNotifications);
router.route("/deleteNotif").put(protect, deleteNotif);

module.exports = router;
