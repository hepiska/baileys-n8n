import { makeWASocket } from "@whiskeysockets/baileys"
import {
  messageReceiptUpdateCallbacks,
  messagesDeleteCallbacks,
  messagesMediaUpdateCallbacks,
  messagesReactionCallbacks,
  messagesUpdateCallbacks,
  messagingHistorySetCallbacks,
} from "../message-callback.repository.js"
import { logger } from "../../lib/logger.js"
import { enqueueUpsertMessages } from "@/lib/queues/wa-upsert.queue.js"

const logMessageEventError = (event: string, error: unknown) => {
  logger.error({ event, error }, 'Error handling WhatsApp message event')
}


export const handleIncomingMessage = async (sock: ReturnType<typeof makeWASocket>) => {
  sock.ev.on('messages.upsert', async ({ type, messages }) => {
    console.log('Messages:', messages[0].message)
    try {
      await enqueueUpsertMessages(type, messages)
    } catch (error) {
      logMessageEventError('messages.upsert', error)
    }
  })

  sock.ev.on('messages.update', async (updates) => {
    try {
      await messagesUpdateCallbacks(updates)
    } catch (error) {
      logMessageEventError('messages.update', error)
    }
  })

  sock.ev.on('messages.delete', async (deletion) => {
    try {
      await messagesDeleteCallbacks(deletion)
    } catch (error) {
      logMessageEventError('messages.delete', error)
    }
  })

  sock.ev.on('messages.media-update', async (updates) => {
    try {
      await messagesMediaUpdateCallbacks(updates)
    } catch (error) {
      logMessageEventError('messages.media-update', error)
    }
  })

  sock.ev.on('messages.reaction', async (reactions) => {
    try {
      await messagesReactionCallbacks(reactions)
    } catch (error) {
      logMessageEventError('messages.reaction', error)
    }
  })

  sock.ev.on('message-receipt.update', async (receipts) => {
    try {
      await messageReceiptUpdateCallbacks(receipts)
    } catch (error) {
      logMessageEventError('message-receipt.update', error)
    }
  })

  sock.ev.on('messaging-history.set', async (history) => {
    try {
      await messagingHistorySetCallbacks(history)
    } catch (error) {
      logMessageEventError('messaging-history.set', error)
    }
  })
}