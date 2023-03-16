const asyncHandler = require("express-async-handler");
// const Chat = require("../models/chatModel");
// const Message = require("../models/messageModel");
// const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const notifications = asyncHandler(async (req, res) => {
  const { senderId, content, chatId } = req.body;

  var newNotif = {
    sender: senderId,
    content: content,
    chat: chatId,
  };

  try {
    var notif = await Notification.create(newNotif);
    notif = await notif.populate("sender", "firstName lastName");
    notif = await notif.populate("chat");
    notif = await notif.populate("chat.groupAdmin", "-password");

    res.json(notif);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  try {
    const notif = await Notification.find(req.params.empty)
      .populate("chat")
      .populate("chat.users", "firstName lastName pic")
      .populate("sender");
    var filtered = [];
    await notif?.forEach((items) => {
      if (items?.chat?.users.includes(userId)) {
        if (items.sender._id != userId) {
          filtered = [...filtered, items];
        }
      }
    });
    res.json(filtered);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

const deleteNotif = asyncHandler(async (req, res) => {
  const { notifId } = req.body;

  try {
    const toDelete = await Notification.deleteOne({ _id: notifId });
    if (!toDelete) {
      res.status(404);
      throw new Error("Notification not Found");
    } else {
      res.json(toDelete);
    }
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});
module.exports = { notifications, getNotifications, deleteNotif };
