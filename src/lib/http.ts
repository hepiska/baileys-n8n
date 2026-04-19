import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const n8nMessageWebhookUrl = process.env.BAILEY_N8N_MESSAGE_WEBHOOK || "http://localhost:5678/webhook/baileys";
const n8nChatWebhookUrl = process.env.BAILEY_N8N_CHAT_WEBHOOK || "http://localhost:5678/webhook/baileys";

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
    console.log("Sending message event to n8n webhook:", body, n8nMessageWebhookUrl);
    await axios.post(n8nMessageWebhookUrl, body);
  } catch (error) {
    console.error("Failed to send message to n8n webhook:", error);
  }
};

export const n8nChatWebhook = async (body: any) => {
  try {
    console.log("Sending chat event to n8n webhook:", body);
    await axios.post(`${n8nChatWebhookUrl}`, body);
  } catch (error) {
    console.error("Failed to send chat event to n8n webhook:", error);
  }
}