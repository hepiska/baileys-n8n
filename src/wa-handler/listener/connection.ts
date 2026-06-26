import { DisconnectReason, makeWASocket } from '@whiskeysockets/baileys'
import qrcode from 'qrcode';
import { logger } from '../../lib/logger.js'
import { rm } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const clearAuthInfo = async () => {
  const authInfoPath = path.join(process.cwd(), 'baileys_auth_info')
  if (existsSync(authInfoPath)) {
    try {
      await rm(authInfoPath, { recursive: true, force: true })
      logger.info('Cleared baileys_auth_info directory')
    } catch (error) {
      logger.error({ error }, 'Failed to clear baileys_auth_info directory')
    }
  }
}

export const connectWa = async (sock: ReturnType<typeof makeWASocket>, callBack: () => void, getQr?: (qr: string) => void) => {
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      logger.info('QR code received, please scan it with your WhatsApp app')
      logger.debug(`QR code data: ${qr}`)
      qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
        if (err) {
          logger.error('Failed to generate QR code')
          return
        }
        console.log('Scan the following QR code with your WhatsApp app:')
        console.log(url)
      })
      getQr?.(qr)
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
        await clearAuthInfo()
        await callBack();
      }
    }



  });

}