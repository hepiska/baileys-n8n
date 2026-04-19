import { DisconnectReason, makeWASocket } from '@whiskeysockets/baileys'
import QRCode from 'qrcode'
import { logger } from '../../lib/logger.js'

export const connectWa = async (sock: ReturnType<typeof makeWASocket>, callBack: () => void) => {
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      logger.info('QR code received, please scan it with your WhatsApp app')
      const qrCode = await QRCode.toString(qr, { type: 'terminal' })
      logger.info({ qrCode }, 'WhatsApp QR code generated')
    }
    if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp')
    }

    if (connection === 'open') {
      logger.info('WhatsApp connection opened')
    }

    if (connection === 'close') {
      const statusCode =
        (lastDisconnect?.error as any)?.output?.statusCode

      logger.error({
        statusCode,
        error: lastDisconnect?.error,
      }, 'WhatsApp connection closed')

      if (statusCode !== DisconnectReason.loggedOut) {
        logger.warn('Reconnecting to WhatsApp')
        await callBack();
      } else {
        logger.warn('Session logged out, re-authentication required')
      }
    }



  });

}