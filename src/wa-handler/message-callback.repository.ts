import { BaileysEventMap, MessageUpsertType, MessageUserReceiptUpdate, WAMessage, WAMessageUpdate, WAMessageKey, proto } from "@whiskeysockets/baileys";
import type { Boom } from "@hapi/boom";
import { n8nMessageWebhook } from "../lib/http.js";
import { logger } from "@/lib/logger.js";
import { IMasaageEventPayload } from "./helpers/maper.js";
import { readFileToBase64AndRemoveLocalFile } from "./helpers/media.js";

const postMessageEvent = async <T>(payload: T) => {
  await n8nMessageWebhook(payload)
}

export const messageUpsertCallback = async (type: MessageUpsertType, message: IMasaageEventPayload) => {
  await postMessageEvent({
    eventName: 'messages.upsert',
    type,
    message,
  })
}

export const messagesUpdateCallbacks = async (updates: WAMessageUpdate[]) => {
  for (const update of updates) {
    await postMessageEvent({
      eventName: 'messages.update',
      update
    })
  }

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
  for (const update of updates) {
    await postMessageEvent({
      eventName: 'messages.media-update',
      update
    })
  }
}

export const messagesReactionCallbacks = async (reactions: {
  key: WAMessageKey
  reaction: proto.IReaction
}[]) => {
  for (const reaction of reactions) {
    await postMessageEvent({
      eventName: 'messages.reaction',
      reaction
    })
  }
}

export const messageReceiptUpdateCallbacks = async (receipts: MessageUserReceiptUpdate[]) => {

  for (const receipt of receipts) {
    await postMessageEvent({
      eventName: 'message-receipt.update',
      receipt
    })
  }

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

