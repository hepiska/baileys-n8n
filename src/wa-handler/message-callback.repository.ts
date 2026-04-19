import { BaileysEventMap, MessageUpsertType, MessageUserReceiptUpdate, WAMessage, WAMessageUpdate, WAMessageKey, proto } from "@whiskeysockets/baileys";
import type { Boom } from "@hapi/boom";
import { n8nMessageWebhook } from "../lib/http.js";

const postMessageEvent = async <T>(payload: T) => {
  await n8nMessageWebhook(payload)
}

export const messagesUpsertCallbacks = async (type: MessageUpsertType, messages: proto.IWebMessageInfo[]) => {
  await postMessageEvent({
    eventName: 'messages.upsert',
    type,
    messages
  })
}

export const messagesUpdateCallbacks = async (updates: WAMessageUpdate[]) => {
  await postMessageEvent({
    eventName: 'messages.update',
    updates
  })
}

export const messagesDeleteCallbacks = async (deletion: BaileysEventMap['messages.delete']) => {
  await postMessageEvent({
    eventName: 'messages.delete',
    deletion
  })
}

export const messagesMediaUpdateCallbacks = async (updates: {
  key: WAMessageKey
  media?: {
    ciphertext: Uint8Array
    iv: Uint8Array
  }
  error?: Boom
}[]) => {
  await postMessageEvent({
    eventName: 'messages.media-update',
    updates
  })
}

export const messagesReactionCallbacks = async (reactions: {
  key: WAMessageKey
  reaction: proto.IReaction
}[]) => {
  await postMessageEvent({
    eventName: 'messages.reaction',

    reactions
  })
}

export const messageReceiptUpdateCallbacks = async (receipts: MessageUserReceiptUpdate[]) => {
  await postMessageEvent({
    eventName: 'message-receipt.update',
    receipts
  })
}

export const messagingHistorySetCallbacks = async (history: {
  chats: BaileysEventMap['messaging-history.set']['chats']
  contacts: BaileysEventMap['messaging-history.set']['contacts']
  messages: WAMessage[]
  isLatest: boolean
}) => {
  await postMessageEvent({
    eventName: 'messaging-history.set',
    history
  })
}

