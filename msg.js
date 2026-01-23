const { getContentType, proto, downloadContentFromMessage } = require('@whiskeysockets/baileys');

const sms = (conn, m) => {
  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.fromMe ? conn.user.id : (m.key.participant || m.chat);
  }

  if (m.message) {
    m.type = getContentType(m.message);
    m.msg = m.message[m.type];
    m.body =
      m.msg?.text ||
      m.msg?.caption ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      '';

    m.quoted = m.msg?.contextInfo?.quotedMessage
      ? {
          type: getContentType(m.msg.contextInfo.quotedMessage),
          id: m.msg.contextInfo.stanzaId,
          sender: m.msg.contextInfo.participant,
          msg: m.msg.contextInfo.quotedMessage[getContentType(m.msg.contextInfo.quotedMessage)],
        }
      : null;

    m.mentionUser = m.msg?.contextInfo?.mentionedJid || [];
  }

  m.reply = (text) => conn.sendMessage(m.chat, { text }, { quoted: m });
  m.react = (emoji) =>