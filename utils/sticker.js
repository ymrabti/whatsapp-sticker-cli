const fs = require('fs-extra');
const sharp = require('sharp');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

async function createStickerFromFile(filePath) {
    const tmp = path.join(__dirname, '../tmp.webp');

    // Use FFmpeg for proper WhatsApp compatibility (animated + static)
    const cmd = `"${ffmpegPath}" -y -i "${filePath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -loop 0 -q:v 60 "${tmp}"`;

    execSync(cmd, { stdio: 'ignore' });

    const file = fs.readFileSync(tmp);

    return new MessageMedia('image/webp', file.toString('base64'));
}

module.exports = { createStickerFromFile };
