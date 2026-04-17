const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { MessageMedia } = require('whatsapp-web.js');

async function createStickerFromFile(filePath) {
    const tmp = path.join(__dirname, '../tmp.webp');

    // clean previous temp
    try {
        fs.removeSync(tmp);
    } catch {}

    const ext = path.extname(filePath).toLowerCase();

    let cmd;

    // ✅ GIF → WhatsApp sticker (MAIN PIPELINE)
    if (ext === '.gif') {
        cmd = `"${ffmpegPath}" -y -i "${filePath}" \
    -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,\
    pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" \
    -loop 0 -an -vsync 0 -q:v 60 -f webp "${tmp}"`;
    }

    // ⚠️ fallback: still allow webp (if any left)
    else if (ext === '.webp') {
        cmd = `"${ffmpegPath}" -y -i "${filePath}" \
    -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,\
    pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" \
    -loop 0 -an -vsync 0 -q:v 60 -f webp "${tmp}"`;
    } else {
        throw new Error('Unsupported file type: ' + ext);
    }

    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.log('❌ Conversion failed for:', filePath);
        return null;
    }

    if (!fs.existsSync(tmp)) {
        console.log('❌ Output not created:', filePath);
        return null;
    }

    const file = fs.readFileSync(tmp);

    return new MessageMedia('image/webp', file.toString('base64'));
}

module.exports = { createStickerFromFile };
