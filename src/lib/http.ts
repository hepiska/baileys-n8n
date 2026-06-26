import axios from "axios";
import dotenv from "dotenv";
import { config } from "@/config.js";

dotenv.config();

const n8nMessageWebhookUrl = config.messageWebhook || "http://localhost:5678/webhook/baileys";
const n8nChatWebhookUrl = config.chatWebhook || "http://localhost:5678/webhook/baileys";

interface N8nMessageEvent {
  eventName: string;
  type?: string;
  messages?: any[];
  updates?: any[];
  deletion?: any;
  reactions?: any[];
  receipts?: any[];
  history?: {
    messages: any[];
    isLatest: boolean;
  }
}

export const n8nMessageWebhook = async (body: any) => {
  try {
    await axios.post(n8nMessageWebhookUrl, body);
  } catch (error) {
    console.error("Failed to send message to n8n webhook:", (error as Error).message);
  }
};

export const n8nChatWebhook = async (body: any) => {
  try {
    await axios.post(`${n8nChatWebhookUrl}`, body);
  } catch (error) {
    console.error("Failed to send chat event to n8n webhook:", (error as Error).message);
  }
}