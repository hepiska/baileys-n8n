import dotenv from 'dotenv'

dotenv.config()

export const config = {
  messageWebhook: process.env.BAILEY_N8N_MESSAGE_WEBHOOK || 'http://localhost:5678/webhook-test/41f9b99a-a29f-45b3-b5e7-b7c911d2851e/webhook',
  chatWebhook: process.env.BAILEY_N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/baileys',
  qrBasicAuthUsername: process.env.QR_BASICH_AUTH_USERNAME || 'admin',
  qrBasicAuthPassword: process.env.QR_BASICH_AUTH_PASSWORD || 'admin',
  port: process.env.PORT || 3000,
}