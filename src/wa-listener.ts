import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { connectWa } from './wa-handler/listener/connection.js'
import { handleChatEvent } from './wa-handler/listener/chat.js'
import { handleIncomingMessage } from './wa-handler/listener/incoming-message.js'


interface CreateSocketOptions {
  onQr?: (qr: string) => void
}

export async function createSocket(options?: CreateSocketOptions) {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const sock = makeWASocket({
    auth: state,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    syncFullHistory: false,
  })

  connectWa(sock, () => createSocket(options), options?.onQr)
  // handleChatEvent(sock)
  handleIncomingMessage(sock)



  sock.ev.on('creds.update', saveCreds)
  return sock
}

