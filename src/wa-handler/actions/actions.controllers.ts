import { makeWASocket } from "@whiskeysockets/baileys";
import { Router } from "express";
import { body, validationResult } from "express-validator";


const router = Router();


export const generateWaActionsControllers = (sock: ReturnType<typeof makeWASocket>) => {
  router.post("/read-message", body("keys").isArray(), body("keys.*.remoteJid").isString(), body("keys.*.id").isString(), async (req, res) => {
    console.log("Received request to mark messages as read:", req.body.keys[0]);
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { keys } = req.body;
    try {
      await sock.readMessages(keys);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      res.status(500).json({ success: false, error: "Failed to mark messages as read" });
    }
  })



  return router;

}