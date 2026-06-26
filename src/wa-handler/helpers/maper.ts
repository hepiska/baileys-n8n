import { MessageUpsertType, proto } from "@whiskeysockets/baileys"
import { downloadMedia, downloadMediaToBuffer } from './media.js'
import { readFile } from 'fs/promises'
import { File } from 'node:buffer'
import { uploadFileToImageKit } from "@/lib/media-handler/media-storage.js"
import { logger } from "@/lib/logger.js"


export interface ITextMessage {
  conversation?: string
  messageSecret?: string
}

export interface IImageMessage {
  caption?: string | null
  messageSecret?: string
  imageFile: {
    fileUri: string
    fileId: string
  }
}


export interface IMasaageEventPayload {
  eventName: string
  senderName: string
  type: MessageUpsertType
  key: proto.IMessageKey
  message?: ITextMessage
  imageMessage?: IImageMessage
}

const getChatType = (remoteJid?: string | null) => {
  if (!remoteJid) return 'unknown'
  if (remoteJid.endsWith('@g.us')) return 'group'
  if (remoteJid.endsWith('@s.whatsapp.net')) return 'direct'
  if (remoteJid.endsWith('@lid')) return 'direct'
  if (remoteJid.endsWith('@broadcast')) return 'broadcast'
  return 'other'
}

const unwrapMessageContent = (content?: proto.IMessage | null): proto.IMessage => {
  if (!content) {
    return {}
  }

  if (content.ephemeralMessage?.message) {
    return unwrapMessageContent(content.ephemeralMessage.message)
  }

  if (content.viewOnceMessage?.message) {
    return unwrapMessageContent(content.viewOnceMessage.message)
  }

  if (content.viewOnceMessageV2?.message) {
    return unwrapMessageContent(content.viewOnceMessageV2.message)
  }

  if (content.viewOnceMessageV2Extension?.message) {
    return unwrapMessageContent(content.viewOnceMessageV2Extension.message)
  }

  if (content.documentWithCaptionMessage?.message) {
    return unwrapMessageContent(content.documentWithCaptionMessage.message)
  }

  return content
}

const mapMessageUpsertToEventPayload = async (type: MessageUpsertType, message: proto.IWebMessageInfo): Promise<IMasaageEventPayload> => {
  const senderName = message.pushName || 'unknown'
  const key = message.key || { id: 'unknown', remoteJid: 'unknown', fromMe: false }
  const messageContent = unwrapMessageContent(message.message)
  const textMessage = messageContent.conversation ? { conversation: messageContent.conversation } : {}
  let imageMessage: IImageMessage | undefined = undefined
  const chatType = getChatType(key.remoteJid)


  if (messageContent.imageMessage && chatType === 'direct') {
    const mediaFile = await downloadMediaToBuffer({
      ...message,
      message: messageContent,
    })


    const uploadedImage = await uploadFileToImageKit(mediaFile, `image_${key.id}.jpg`)

    imageMessage = {
      caption: messageContent.imageMessage.caption,
      imageFile: {
        fileUri: uploadedImage?.url || '',
        fileId: uploadedImage?.fileId || '',
      },
    }
  }


  return {
    eventName: 'messages.upsert',
    senderName,
    type,
    key,
    message: textMessage,
    imageMessage
  }
}

export { mapMessageUpsertToEventPayload }   