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
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

client.on('message_create', async (msg) => {
    console.log(msg.body);
    const chat = await msg.getChat();
    const text = msg.body.toLowerCase();

    // Send single sticker
    if (text.startsWith('/sticker ')) {
        const name = text.replace('/sticker ', '').trim();
        const filePath = path.join(__dirname, 'stickers', name);

        if (!fs.existsSync(filePath)) {
            return msg.reply('Sticker not found');
        }

        const sticker = await createStickerFromFile(filePath);
        await client.sendMessage(msg.from, sticker, { sendMediaAsSticker: true });
    }

    // Send all stickers in folder
    if (text === '/pack') {
        const files = fs.readdirSync('./stickers').filter((f) => f.endsWith('.webp'));

        for (const file of files) {
            const sticker = await createStickerFromFile(path.join(__dirname, 'stickers', file));
            await client.sendMessage(msg.from, sticker, { sendMediaAsSticker: true });
        }

        msg.reply('Sticker pack sent ✅');
    }

    // help
    if (text === '/help') {
        msg.reply(`
Commands:
 /sticker name.webp  → send single sticker
 /pack               → send full pack
    `);
    }
});

client.initialize();
