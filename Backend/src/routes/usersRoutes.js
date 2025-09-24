import { Router } from "express";
import { getUserHistory, addToHistory, login, register } from "../controllers/userController.js";

const router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)
router.route("/create-room").post((req, res) => {
  const { roomId, chatMode, hostId } = req.body;
  res.json({ success: true, message: "Room created", roomId, chatMode, hostId });
});

export default router;