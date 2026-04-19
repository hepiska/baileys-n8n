import { BaileysEventMap } from '@whiskeysockets/baileys'
import { n8nChatWebhook } from '../lib/http.js'

const postChatEvent = async <T>(event: string, payload: T) => {
  await n8nChatWebhook({
    event,
    payload
  })
}

export const chatsUpsertCallbacks = async (chats: BaileysEventMap['chats.upsert']) => {
  await postChatEvent('chats.upsert', {
    chats
  })
}

export const chatsUpdateCallbacks = async (updates: BaileysEventMap['chats.update']) => {
  await postChatEvent('chats.update', {
    updates
  })
}

export const chatsDeleteCallbacks = async (chatIds: BaileysEventMap['chats.delete']) => {
  await postChatEvent('chats.delete', {
    chatIds
  })
}

export const chatsPhoneNumberShareCallbacks = async (share: BaileysEventMap['chats.phoneNumberShare']) => {
  await postChatEvent('chats.phoneNumberShare', share)
}