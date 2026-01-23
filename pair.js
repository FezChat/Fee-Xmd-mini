const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const router = express.Router();
const pino = require('pino');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
const FileType = require('file-type');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  getContentType,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
  downloadContentFromMessage,
  DisconnectReason
} = require('@whiskeysockets/baileys');

// ---------------- CONFIG ----------------

const BOT_NAME_FANCY = 'FREDI';

const config = {
  AUTO_VIEW_STATUS: 'true',
  AUTO_LIKE_STATUS: 'true',
  AUTO_RECORDING: 'false',
  AUTO_LIKE_EMOJI: ['🔥','😀','👍','😃','😄','😁','😎','🥳','🌞','🌈','❤️'],
  PREFIX: '.',
  MAX_RETRIES: 3,
  GROUP_INVITE_LINK: 'https://chat.whatsapp.com/FA1GPSjfUQLCyFbquWnRIS',
  RCD_IMAGE_PATH: 'https://files.catbox.moe/fkv1ui.jpg',
  NEWSLETTER_JID: '120363423084862852@newsletter',
  OTP_EXPIRY: 300000,
  OWNER_NUMBER: process.env.OWNER_NUMBER || '255752593977',
  CHANNEL_LINK: 'https://whatsapp.com/channel/0029Vb6mzVF7tkj42VNPrZ3V',
  BOT_NAME: '𝙁𝙀𝙀-𝙓𝙈𝘿',
  BOT_VERSION: '1.0.0V',
  OWNER_NAME: 'Fredi_Ezra',
  IMAGE_PATH: 'https://files.catbox.moe/fkv1ui.jpg ',
  BOT_FOOTER: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
  BUTTON_IMAGES: { ALIVE: 'https://files.catbox.moe/fkv1ui.jpg' }
};

async function msgHandler(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : from;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const command = body.trim().toLowerCase();

    // ===== COMMAND HANDLER =====
    switch (command) {
      case '.menu':
        await sock.sendMessage(from, {
          text: `╭┈┈❥〘  MENU 〙✿┈┈
┋ 📌 .menu - Show this menu
┋ 🧠 .help - Help section
┋ 🎵 .alive- Status: Online
┋ 🎵 .ping - Response Time
┋ 🎵 .emoji- convert to emoji
┋ 🎵 .song <name> - Download song
┋ 📷 .photo <name> - Get image
╰┈┈┈┈┈┈┈┈❥`
        }, { quoted: msg });
        break;
		

  case '.alive':
    await sock.sendMessage(from, {
      text: `*🧬 BOT IDENTITY 🧬*
╭┈┈┈┈┈┈┈┈┈┈┈┈❥✿
┋ 🔹 *Name:* 𝙁𝙀𝙀-𝙓𝙈𝘿 🩷         
┋ 🔸 *Version:* V1                        
┋ 🌍 *Origin:* tz 🇹🇿              
┋ 🛠️ *By:* Fredi Ezra          
╰┈┈┈┈┈┈┈┈┈┈┈┈❥✿

---

*🌐💭 AVAILABLE COMMANDS 💭🌐*

❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋ ⚡ `.alive`
┋    ┗ 🟢 _Check bot status_
┋
┋ 🎵 `.Song`
┋    ┗ 🎧 _Download your favorite songs_
┋
┋ 🖼️ `.winfo`
┋    ┗ 📸 _Fetch user profile picture_
┋
┋ 🎨 `.aiimg`
┋    ┗ 🤖 _Generate AI-powered images_
┋
┋ 🖋️ `.logo`
┋    ┗ 🧩 _Create stylish logos_
┋
┋ ✨ `.fancy`
┋    ┗ 🔤 _Explore fancy text styles_
┋
┋ 🎬 `.tiktok`
┋    ┗ 📥 _Download TikTok videos_
┋
┋ 📘 `.fb`
┋    ┗ 📥 _Download Facebook videos_
┋
┋ 📸 `.ig`
┋    ┗ 📥 _Download Instagram videos_
┋
┋ 🔍 `.ts`
┋    ┗ 🎯 _Search TikTok content_
┋
┋ 🧠 `.ai`
┋    ┗ 💬 _Start a new AI chat_
┋
┋ 🗞️ `.news`
┋    ┗ 📰 _Get the latest news updates_
┋
┋ 🚀 `.nasa`
┋    ┗ 🌌 _Explore NASA news_
┋
┋ 🧃 `.gossip`
┋    ┗ 🗣️ _Catch up on gossip news_
┋
┋ 🏏 `.cricket`
┋    ┗ 🏆 _Cricket news & updates_
┋
┋ 💣 `.bomb`
┋    ┗ ⚠️ _Send bomb message_
┋
┋ 🗑️ `.deleteme`
┋    ┗ ❌ _Delete your session_
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤

---

🩷 _Nice day. Enjoy your world. Enjoy to be._ 🩷
💻 *𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅* ┋👹 TANZANIA`
    }, { quoted: msg });
    break;

case '.ping':
  const timestamp = new Date().getTime();
  await sock.sendMessage(from, { text: '🏓 Pinging...' }, { quoted: msg });
  const latency = new Date().getTime() - timestamp;
  await sock.sendMessage(from, {
    text: `🏓 *PONG!*
⏱️ *Response Time:* ${latency} ms`
  }, { quoted: msg });
  break;


  } catch (err) {
    console.error('Error in msgHandler:', err);
  }
}

module.exports = { msgHandler };


js
case '.emoji':
  const emojiText = args.join(" ");
  if (!emojiText) {
    await sock.sendMessage(from, { text: '🔤 *Please provide text to convert to emoji!*' }, { quoted: msg });
    break;
  }

  // Simple text to emoji mapping (A-Z only, for example)
  const mapToEmoji = (ch) => {
    const base = ch.toLowerCase();
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    if (alpha.includes(base)) {
      return `:regional_indicator_${base}:`;
    } else {
      return ch;
    }
  };

  const emojiResult = [...emojiText].map(mapToEmoji).join(" ");
  await sock.sendMessage(from, { text: emojiResult }, { quoted: msg });
  break;

case '.jid':
  let targetJid;

  if (msg.quoted) {
    targetJid = msg.quoted.sender;
  } else if (mentionedJid && mentionedJid.length > 0) {
    targetJid = mentionedJid[0];
  } else {
    targetJid = from; // default to current chat
  }

  await sock.sendMessage(from, {
    text: `📍 *JID:* ${targetJid}`
  }, { quoted: msg });

  break;


case '.setting':
  if (!isGroup) return reply('⚠️ This command only works in groups.');

  let argsText = args.join(' ');
  if (!argsText) {
    return reply(
      `⚙️ *Group Settings*\n\n` +
      `🔹 Anti-Link: groupSettings.antilink ? 'ON' : 'OFF'` +
      `🔹 Welcome:{groupSettings.welcome ? 'ON' : 'OFF'}\n\n` +
      `Use: .setting antilink on/off\n` +
      `Use: .setting welcome on/off`
    );
  }

  let [setting, value] = argsText.toLowerCase().split(' ');
  if (!['antilink', 'welcome'].includes(setting) || !['on', 'off'].includes(value)) {
    return reply('❌ Invalid setting or value. Use `.setting antilink on`');
  }

  // Update setting
  groupSettings[setting] = value === 'on';
  reply(`✅ setting.charAt(0).toUpperCase() + setting.slice(1) set to{value.toUpperCase()}`);
  break;

case '.react':
  if (!isGroup) return reply('⚠️ This command only works in groups.');

  if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
    return reply('🛠️ Use: `.react on` or `.react off`');
  }

  let status = args[0].toLowerCase() === 'on';
  if (!botSettings[m.chat]) botSettings[m.chat] = {};
  botSettings[m.chat].autoreact = status;

  reply(`✅ Auto React turned *${status ? 'ON' : 'OFF'}*`);
  break;

case '.video':
  if (!args[0]) return reply('🎥 Send a YouTube link.\n\nUsage: `.video <url>`');

  try {
    const ytdl = require('ytdl-core');
    const info = await ytdl.getInfo(args[0]);
    const title = info.videoDetails.title;

    const stream = ytdl(args[0], {
      quality: '18' // medium quality
    });

    conn.sendMessage(m.chat, {
      video: stream,
      fileName: `title.mp4`,
      caption: `🎬 Title:{title}`,
      mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    reply('❌ Error downloading the video. Make sure the link is correct.');
  }
  break;
  
  case 'song': {
  const yts = require('yt-search');
  const axios = require('axios');
const apikey = "dew_uC8L60kMO6GvgqMzZrELKvBjXJe3GlGK8J2u7gtr"; // Paste Your Api Key Form https://bots.srihub.store
  const apibase = "https://api.srihub.store"

  // Extract message text safely
  const q =
  msg.message?.conversation ||
  msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption ||
  msg.message?.videoMessage?.caption ||
  "";

  if (!q.trim()) {
    return await socket.sendMessage(sender, { 
      text: 'Need YouTube URL or Title.' 
    }, { quoted: msg });
  }

  // YouTube ID extractor
  const extractYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const normalizeYouTubeLink = (str) => {
    const id = extractYouTubeId(str);
    return id ? https://www.youtube.com/watch?v=${id} : null;
  };

  try {
    await socket.sendMessage(sender, { 
      react: { text: "🔍", key: msg.key } 
    }
  );

  let videoUrl = normalizeYouTubeLink(q.trim());

  // Search if not a link
  if (!videoUrl) {
    const search = await yts(q.trim());
    const found = search?.videos?.[0];

    if (!found) {
      return await socket.sendMessage(sender, {
        text: "No results found."
      }, { quoted: msg });
    }

    videoUrl = found.url;
  }

  // --- API CALL ---
  const api = ${apibase}/download/ytmp3?apikey=${apikey}&url=${encodeURIComponent(videoUrl)};
  const get = await axios.get(api).then(r => r.data).catch(() => null);

  if (!get?.result) {
    return await socket.sendMessage(sender, {
      text: "API Error. Try again later."
    }, { quoted: msg });
  }

  const { download_url, title, thumbnail, duration, quality } = get.result;

  const caption = `FEE-XMD-MINI AUDIO DOWNLOADER

╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮
♻️ Title: \${title}\

⏱️ Duration: ${duration || 'N/A'}

🔊 Quality: ${quality || '128kbps'}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯
ඔයා කැමතිම පාටෙන් ලස්සන react එකක් දාගෙන යමු 💖🍭

Reply with a number to download 🫆:

❶ Document (mp3)
➁ Audio (mp3)
➌ Voice Note (ptt)

> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅 `;

// Send main message
const resMsg = await socket.sendMessage(sender, {
  image: { url: thumbnail },
  caption: caption
}, { quoted: msg });

const handler = async (msgUpdate) => {
  try {
    const received = msgUpdate.messages && msgUpdate.messages[0];
    if (!received) return;

    const fromId = received.key.remoteJid || received.key.participant || (received.key.fromMe && sender);
    if (fromId !== sender) return;

    const text = received.message?.conversation || received.message?.extendedTextMessage?.text;
    if (!text) return;

    // ensure they quoted our card
    const quotedId = received.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    received.message?.extendedTextMessage?.contextInfo?.quotedMessage?.key?.id;
    if (!quotedId || quotedId !== resMsg.key.id) return;

    const choice = text.toString().trim().split(/\s+/)[0];

    await socket.sendMessage(sender, { react: { text: "📥", key: received.key } });

    switch (choice) {
      case "1":
      await socket.sendMessage(sender, {
        document: { url: download_url },
        mimetype: "audio/mpeg",
        fileName: ${title}.mp3
      }, { quoted: received });
      break;
      case "2":
      await socket.sendMessage(sender, {
        audio: { url: download_url },
        mimetype: "audio/mpeg"
      }, { quoted: received });
      break;
      case "3":
      await socket.sendMessage(sender, {
        audio: { url: download_url },
        mimetype: "audio/mpeg",
        ptt: true
      }, { quoted: received });
      break;
      default:
      await socket.sendMessage(sender, { text: "Invalid option. Reply with 1, 2 or 3 (quote the card)." }, { quoted: received });
      return;
    }

    // cleanup listener after successful send
    socket.ev.off('messages.upsert', handler);
  } catch (err) {
    console.error("Song handler error:", err);
    try { socket.ev.off('messages.upsert', handler); } catch (e) {}
  }
};

socket.ev.on('messages.upsert', handler);

// auto-remove handler after 60s
setTimeout(() => {
  try { socket.ev.off('messages.upsert', handler); } catch (e) {}
}, 60 * 1000);

// react to original command
await socket.sendMessage(sender, { react: { text: '🔎', key: msg.key } });

} catch (err) {
  console.error('Song case error:', err);
  await socket.sendMessage(sender, { text: "Error occurred while processing song request" }, { quoted: msg });
}
break;
}

case '.logo':
case '.LOGO':
    // Simple text reply
    // m.reply('Your Logo Here');
    
    // හෝ image එකක් reply කරන්න
    conn.sendMessage(m.chat, {
        image: { url: 'https://example.com/your-logo.png' }, // ඔබේ ලෝගෝ image url එක මෙතන දාන්න
        caption: '🔥 *𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅* 🔥'
    }, { quoted: m });
    break;

js
case '.download':
case '.downloadapi':
    if (!args || args.length === 0) {
        return m.reply('Download API key link එක දාන්න. Example: .download NOT SD ERORE');
    }
    let apiUrl = args[0]; // user දීපු url එක
    // Download process එක API call එකක් හැටියට හෝ response එකට අදාළ logic එකට modify කරන්න.
    
    // Example: Download url එක මගින් file download link එක return කරන API call එකක් නම්
    // මේකෙන් reply එකක් දෙන්න පුළුවන්.
    
    m.reply(`Downloading from API key URL:\n${apiUrl}\n*Please wait...*`);
    
    // ඔබගේ bot logic එකට අනුව API call එක, file download, save, send, etc කරන්න.
    break;

case '.ai':
    m.reply('Here is your AI link:\nhttps://chatgpt.com/link/whatsapp/');
    break;
	
case 'sticker':
  if (m.message.imageMessage || m.quoted && m.quoted.imageMessage) {
    // Image message or quoted image capture කරලා
    let media = m.message.imageMessage ? m : m.quoted;

    // Media download කරලා sticker හැඩට send කරන්න
    const stream = await downloadMediaMessage(media, 'buffer');

    await conn.sendMessage(m.chat, { sticker: stream }, { quoted: m });
  } else {
    m.reply('Please send or quote an image to make sticker.');
  }
  break;
  
  case 'help':
case 'menu':
  let helpMessage = `*ආයුබෝවන්!*

ඔබට පහත command වලින් පහසුකම් ලබා ගත හැකිය:

*.help* - මේ උදව් පණිවිඩය බලන්න  
*.sticker* - Image එකක් Sticker එකක් කරන්න  
*.ping* - Bot status බලන්න  
*.alive* - Bot සජීවී තත්ත්වය බලන්න  

තවත් command අවශ්‍ය නම් අපෙන් ඉල්ලන්න!`;

  m.reply(helpMessage);
  break;

case 'info':
  let user = m.sender; // user id
  let userName = m.pushName || 'Unknown';
  let botName = conn.user.name || 'Bot';

  let infoMessage = `🤖 *Bot Information*\n`
    + `Name: FEE-XMD-MINI`
    + `👤 *Fredi Ezra*`
    + `User ID:{user}\n`
    + `Name: Fredi AI`
    + `Is Group:{m.isGroup ? 'Yes' : 'No'}`;

  await m.reply(infoMessage);
  break;

case 'translate':
  if (!args[0] || !args.slice(1).join(' ')) {
    return m.reply('Usage: *.translate <language_code> <text>*\nExample: *.translate si Hello*');
  }
  const lang = args[0].toLowerCase();
  const textToTranslate = args.slice(1).join(' ');

  try {
    // Use a translation library or API here, example with google-translate-api (if installed)
    const translate = require('@vitalets/google-translate-api');

    const res = await translate(textToTranslate, { to: lang });
    await m.reply(`🌐 Translated (lang):{res.text}`);
  } catch (error) {
    await m.reply('Translation failed. Please check the language code or try again later.');
  }
  break;

case 'owner':
case 'creator':
  // Owner contact info
  const ownerNumber = '255752593977'; // country code + number without '+'
  const ownerName = 'Fredi AI';

  conn.sendMessage(m.chat, {
    contacts: {
      displayName: ownerName,
      contacts: [{ 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:ownerName;type=CELL;type=VOICE;waid={ownerNumber}:${ownerNumber}\nEND:VCARD`
      }]
    }
  }, { quoted: m });
  break;

case 'pair':
    if (!m.isGroup) return m.reply('This command can only be used in groups.');

    let mentioned = m.mentionedJid && m.mentionedJid.length >= 2;
    if (!mentioned) return m.reply('Please tag two users to pair.');

    let user1 = m.mentionedJid[0];
    let user2 = m.mentionedJid[1];

    m.reply(`💞 Paired Users:\n1️⃣ @user1.split('@')[0]2️⃣ @{user2.split('@')[0]}`, null, { mentions: [user1, user2] });
    break;
	
case 'online':
    if (!m.isGroup) return m.reply('This command works only in groups.');

    let onlineMembers = [...m.chatPresences ? Object.keys(m.chatPresences).filter(jid => m.chatPresences[jid].lastKnownPresence === 'available' || m.chatPresences[jid].presence === 'online') : []];

    if (onlineMembers.length === 0) {
        m.reply('Currently no members are online.');
    } else {
        let mentionList = onlineMembers.map(jid => '@' + jid.split('@')[0]);
        m.reply(`🟢 Online Members (${onlineMembers.length}):\n` + mentionList.join('\n'), null, { mentions: onlineMembers });
    }
    break;
	
case 'kick': {
    if (!m.isGroup) return m.reply('මෙම command එක group එකක පමණයි භාවිතා කල හැක්කෙ.');
    if (!isBotAdmins) return m.reply('මට admin අයිතිය නැහැ, ඉවත් කරන්න බැහැ.');
    if (!isAdmins) return m.reply('ඔබට admin අයිතියක් තිබිලා තියෙන්නෙ.');

    let users = m.mentionedJid.length > 0 ? m.mentionedJid : [m.quoted.sender];
    if (users.length === 0) return m.reply('ඉවත් කරන්න ඕන user එක mention කරන්න.');

    for (let user of users) {
        if (user === botNumber) return m.reply('මාවම ඉවත් කරන්න බෑ!');
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    }
    m.reply(`User${users.length > 1 ? 's' : ''} ඉවත් කරලා!`);
}
break;

case 'broadcast': {
    if (!args.length) return m.reply('කරුණාකර broadcast කරන්න message එකක් ටයිප් කරන්න.');

    let message = args.join(' ');
    let chats = [...conn.chats.values()].filter(chat => !chat.jid.endsWith('@g.us')); // group නොවන chats

    for (let chat of chats) {
        await conn.sendMessage(chat.jid, { text: message });
    }
    m.reply(`Broadcast message එක ${chats.length} දෙනාට යවලා.`);
}
break;

ase 'demote': {
    if (!m.isGroup) return m.reply('මෙම command එක group එකක පමණක් භාවිතා කළ හැක.');
    if (!isBotAdmins) return m.reply('මට admin status එක අවශ්‍යයි මේක කරන්න.');
    if (!isAdmins) return m.reply('ඔබ admin නොවන නිසා මේක කරන්න බැහැ.');

    let mentioned = m.mentionedJid && m.mentionedJid[0];
    if (!mentioned) return m.reply('කරුණාකර demote කරන්න user එක mention කරන්න.');

    if (!groupAdmins.includes(mentioned)) return m.reply('ඒ user අමුතුවෙන් admin status එකක් නැහැ.');

    await conn.groupDemoteAdmin(m.chat, [mentioned]);
    m.reply(`Successfully demoted @${mentioned.split('@')[0]} from admin.`);
}
break;

case 'setwelcome': {
    if (!m.isGroup) return m.reply('This command can only be used in groups.');
    if (!isBotAdmins) return m.reply('Bot must be admin to set welcome messages.');
    if (!isAdmins) return m.reply('You must be admin to set welcome messages.');

    let welcomeMessage = text.trim();
    if (!welcomeMessage) return m.reply('Please provide a welcome message.');

    // Save welcome message to database or memory
    // For example, assuming a global object 'welcomeMessages' stores messages per group
    welcomeMessages[m.chat] = welcomeMessage;

    m.reply(`Welcome message has been set to:\n\n${welcomeMessage}`);
}
break;

case 'join':
    if (!text) return m.reply('Group invite link එකක් දාන්න');
    try {
        const res = await conn.groupAcceptInvite(text.split('invite/')[1].split('?')[0]);
        m.reply(`Group එකට එකතු වුණා: ${res}`);
    } catch (e) {
        m.reply('Group එකට එකතු වීමට අපොහොසත් වුනා, invite link එක හරියට බලන්න.');
    }
    break;

case 'leave':
    if (!m.isGroup) return m.reply('මෙම command එක group වලින් පමණක් භාවිතා කළ හැක.');
    try {
        await conn.groupLeave(m.chat);
        // ඔබට අවශ්‍ය නම් මෙහි message එකක් යැවිය හැක.
    } catch (e) {
        m.reply('Group එකෙන් ඉවත් වීමට අපොහොසත් වුනා.');
    }
    break;

case 'qr': {
    if (!args.length) return m.reply('QR code එකක් සාදන එකට text එකක් දෙන්න.');
    const QRCode = require('qrcode');

    const text = args.join(' ');
    QRCode.toDataURL(text, { errorCorrectionLevel: 'H' }, (err, url) => {
        if (err) return m.reply('QR code generate කරගන්න බැරිවුණා.');
        // url එක Base64 image data URL එකක්
        // WhatsApp bot එකට image ලෙස send කරන්න
        const buffer = Buffer.from(url.split(',')[1], 'base64');
        client.sendMessage(m.chat, { image: buffer, caption: `QR code for: ${text}` }, { quoted: m });
    });
}
break;

case 'removewatermark': {
  if (!m.quoted) return reply('Watermark ඉවත් කරන්න image එක reply කරන්න.');
  if (!m.quoted.image) return reply('කරුණාකර image එක reply කරන්න.');

  let media = await client.downloadAndSaveMediaMessage(m.quoted);
  // watermark ඉවත් කිරීමේ basic example - sharp library භාවිතා කරලා crop කරන්න (watermark ඉවත් කිරීමට simple method)
  const sharp = require('sharp');
  const output = './output-no-watermark.jpg';

  // crop bottom right corner (where watermark usually තියෙනවා කියලා assume කරලා)
  await sharp(media)
    .extract({ left: 0, top: 0, width: 500, height: 500 }) // image size එකට adjust කරන්න
    .toFile(output);

  // send the processed image back
  await client.sendMessage(m.chat, { image: { url: output }, caption: 'Watermark ඉවත් කරන ලදි (basic crop method)' }, { quoted: m });
}
break;

case 'feedback': {
  if (!args.length) return reply('කරුණාකර feedback එකක් ලියන්න.');

  let feedbackMsg = args.join(' ');
  let ownerNumber = '255752593977@s.whatsapp.net';  // Bot owner WhatsApp JID එක

  // Owner ට feedback message එක යවන්න
  client.sendMessage(ownerNumber, { text: `*New Feedback Received*\n\nfeedbackMsg: @{m.sender.split('@')[0]}` }, { mentions: [m.sender] });

  reply('ඔබේ feedback එක සාර්ථකව යවා ඇත. ඔබට ස්තුතියි!');
}
break;

case 'boost':
  if (!isGroup) return m.reply('This command is only for groups!');
  let boostMessage = `
*🚀 Social Media Boost Service 🚀*

Hello everyone! If you want to increase your followers, likes, or views on platforms like Instagram, TikTok, or Facebook, contact our trusted boost service.

🌟 Fast and Reliable  
🌟 100% Safe  
🌟 Affordable Prices  

Contact us now to get started!

*Owner:* 255752593977
  `;
  conn.sendMessage(from, { text: boostMessage }, { quoted: m });
  break;

js
case 'update':
  let updateMessage = `
*🔄 Bot Update Notification 🔄*

Hello! This bot has been updated with new features and improvements.

✨ New commands added  
✨ Performance enhancements  
✨ Bug fixes  

Thank you for using our bot! For any feedback or issues, contact the owner.

*Owner:* 255752593977
  `;
  conn.sendMessage(from, { text: updateMessage }, { quoted: m });
  break;

case 'ban':
  if (!isGroup) return m.reply('This command can only be used in groups!');
  if (!isBotAdmin) return m.reply('I need to be an admin to ban users!');
  if (!isGroupAdmins) return m.reply('You need to be an admin to use this command!');
  
  let userToBan = m.mentionedJid[0];
  if (!userToBan) return m.reply('Please tag a user to ban!');
  if (userToBan === m.sender) return m.reply('You cannot ban yourself!');
  if (userToBan === conn.user.jid) return m.reply('You cannot ban the bot!');
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [userToBan], 'remove'); // Remove user (ban)
    m.reply(`User has been banned from the group.`);
  } catch (err) {
    m.reply('Failed to ban user. Make sure I am admin and the user is in the group.');
  }
  break;

switch(command) {
  case 'ping':
    m.reply('Pong!');
    break;

  case 'alive':
    m.reply('Bot is online!');
    break;

  // තවත් commands...

  default:
    m.reply('මේ command එක support කරන එකක් නොවේ! *.help* ට යොමු වෙන්න.');
}

try {
  // command processing code
} catch (err) {
  console.error(err);
  m.reply('දෝෂයක් ඇතිවිය, කරුණාකර නැවත උත්සාහ කරන්න.');
}





---
