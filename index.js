const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const { createStickerFromFile } = require('./utils/sticker');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions',
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
});

// QR login
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR to login');
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready');
});

client.on('message', async (msg) => {
    console.log('MESSAGE_RECEIVED:', msg.body, 'FROM ME:', msg.fromMe);
});

client.on('message_revoke_everyone', async (msg) => {
    console.log('MESSAGE_REVOKED:', msg.body, 'FROM ME:', msg.fromMe);
});

client.on('message_edit', async (msg) => {
    console.log('MESSAGE_EDITED:', msg.body, 'FROM ME:', msg.fromMe);
});

client.on('message_reaction', async (msg) => {
    console.log(
        'MESSAGE_REACTION:',
        msg.reaction,
        'FROM ME:',
        msg.senderId === client.info.wid._serialized,
    );
});

client.on('message_create', async (msg) => {
    const chat = await msg.getChat();
    const text = msg.body.toLowerCase();

    // Send single sticker
    if (text.startsWith('/sticker ')) {
        const name = text.replace('/sticker ', '').trim();
        const filePath = path.join(__dirname, 'stickers', 'gif', name);

        if (!fs.existsSync(filePath)) {
            return msg.reply('Sticker not found');
        }

        const sticker = await createStickerFromFile(filePath);
        await client.sendMessage(msg.to, sticker, { sendMediaAsSticker: true });
    }

    // Send all stickers in folder
    if (text === '/pack') {
        const files = fs
            .readdirSync('./stickers/gif')
            .filter((f) => f.endsWith('.gif') || f.endsWith('.webp'));

        for (const file of files) {
            const sticker = await createStickerFromFile(
                path.join(__dirname, 'stickers', 'gif', file),
            );
            await client.sendMessage(msg.fromMe ? msg.to : msg.from, sticker, {
                sendMediaAsSticker: true,
            });
        }

        msg.reply('Sticker pack sent ✅');
    }

    // help
    if (text === '/help') {
        msg.reply(`
Commands:
 /sticker name.gif  → send single sticker
 /pack               → send full pack
    `);
    }
});

client.initialize();
