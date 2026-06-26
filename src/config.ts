import dotenv from 'dotenv'

dotenv.config()

export const config = {
  messageWebhook: process.env.BAILEY_N8N_MESSAGE_WEBHOOK || 'http://localhost:5678/webhook-test/41f9b99a-a29f-45b3-b5e7-b7c911d2851e/webhook',
  chatWebhook: process.env.BAILEY_N8N_CHAT_WEBHOOK || 'http://localhost:5678/webhook/baileys',
  qrBasicAuthUsername: process.env.QR_BASICH_AUTH_USERNAME || 'admin',
  qrBasicAuthPassword: process.env.QR_BASICH_AUTH_PASSWORD || 'admin',
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisPassword: process.env.REDIS_PASSWORD,
  waUpsertQueueName: process.env.WA_UPSERT_QUEUE_NAME || 'wa-messages-upsert',
  imKitPrivateKey: process.env.IMKIT_PRIVATE_KEY || '',
}