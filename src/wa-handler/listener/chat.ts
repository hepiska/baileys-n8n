import { makeWASocket } from '@whiskeysockets/baileys'
import {
  chatsDeleteCallbacks,
  chatsPhoneNumberShareCallbacks,
  chatsUpdateCallbacks,
  chatsUpsertCallbacks,
} from '../chat-callback.repository.js'
import { logger } from '../../lib/logger.js'

const logChatEventError = (event: string, error: unknown) => {
  logger.error({ event, error }, 'Error handling WhatsApp chat event')
}

export const handleChatEvent = async (sock: ReturnType<typeof makeWASocket>) => {
  sock.ev.on('chats.upsert', async (chats) => {
    try {
      await chatsUpsertCallbacks(chats)
    } catch (error) {
      logChatEventError('chats.upsert', error)
    }
  })

  sock.ev.on('chats.update', async (updates) => {
    try {
      await chatsUpdateCallbacks(updates)
    } catch (error) {
      logChatEventError('chats.update', error)
    }
  })

  sock.ev.on('chats.delete', async (chatIds) => {
    try {
      await chatsDeleteCallbacks(chatIds)
    } catch (error) {
      logChatEventError('chats.delete', error)
    }
  })

  sock.ev.on('chats.phoneNumberShare', async (share) => {
    try {
      await chatsPhoneNumberShareCallbacks(share)
    } catch (error) {
      logChatEventError('chats.phoneNumberShare', error)
    }
  })
}