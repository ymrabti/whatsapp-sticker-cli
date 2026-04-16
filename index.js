#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

program
    .requiredOption('-i, --input <folder>', 'Input folder with webp files')
    .requiredOption('-o, --output <folder>', 'Output folder')
    .parse(process.argv);

const options = program.opts();

const inputDir = path.resolve(options.input);
const outputDir = path.resolve(options.output);

const config = fs.existsSync('./config.json')
    ? require('./config.json')
    : { packName: 'Sticker Pack', author: 'CLI', quality: 60, size: 512 };

fs.ensureDirSync(outputDir);

function processSticker(file) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    console.log('Processing:', file);

    // FFmpeg handles both static and animated WEBP
    const cmd = `
    ffmpeg -y -i "${inputPath}" \
    -vf "scale=${config.size}:${config.size}:force_original_aspect_ratio=decrease,pad=${config.size}:${config.size}:(ow-iw)/2:(oh-ih)/2:color=white" \
    -loop 0 -q:v ${config.quality} "${outputPath}"
  `;

    execSync(cmd, { stdio: 'ignore' });
}

function generatePackMetadata(files) {
    const stickers = files.map((f, index) => ({
        id: index + 1,
        name: path.parse(f).name,
        file: f,
    }));

    const pack = {
        identifier: 'cli.sticker.pack',
        name: config.packName,
        publisher: config.author,
        tray_image_file: stickers[0]?.file || '',
        stickers,
    };

    fs.writeJsonSync(path.join(outputDir, 'sticker-pack.json'), pack, {
        spaces: 2,
    });
}

function run() {
    const files = fs.readdirSync(inputDir).filter((f) => f.endsWith('.webp'));

    if (!files.length) {
        console.log('No WEBP files found.');
        return;
    }

    console.log(`Found ${files.length} stickers`);

    files.forEach(processSticker);

    generatePackMetadata(files);

    console.log('\nDONE!');
    console.log('Output:', outputDir);
}

run();
