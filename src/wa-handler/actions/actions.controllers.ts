import { logger } from "@/lib/logger.js";
import { makeWASocket } from "@whiskeysockets/baileys";
import { Router } from "express";
import { body, validationResult } from "express-validator";


const router = Router();


export const generateWaActionsControllers = (sock: ReturnType<typeof makeWASocket>) => {
  router.post("/read-messages", body("keys").isArray(), body("keys.*.remoteJid").isString(), body("keys.*.id").isString(), async (req, res) => {
    logger.debug("Received request to mark messages as read:", req.body.keys[0]);
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { keys } = req.body;
    try {
      await sock.readMessages(keys);
      res.json({ success: true });
    } catch (error) {
      logger.error(`Failed to mark messages as read, ${(error as Error).message}`);
      res.status(500).json({ success: false, error: "Failed to mark messages as read" });
    }
  })

  router.post("/read-message", body("remoteJid").isString(), body("id").isString(), async (req, res) => {
    logger.debug(`Received request to mark message as read: ${JSON.stringify(req.body)}`);
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await sock.readMessages([req.body]);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to mark messages as read:");
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to mark messages as read" });
    }
  })

  router.post("/send-message", body("message").isObject(), body("remoteJid").isString(), async (req, res) => {
    logger.debug(`Received request to send message: ${JSON.stringify(req.body)}`);
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, remoteJid } = req.body;
    try {
      const result = await sock.sendMessage(remoteJid, message);
      res.json({ success: true, result });
    } catch (error) {
      logger.error(`Failed to send message, ${(error as Error).message}`);
      res.status(500).json({ success: false, error: "Failed to send message" });
    }
  })

  return router;

}