const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const https = require('https');
const sharp = require('sharp');

function printUsage() {
    console.log('Usage: node <svg-url> <output-name> <width> <height> [--out-dir=<dir>] [--suffix=<suffix>] [--force]');
    console.log('Example: node https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg logo.png 256 256 --out-dir=./scripts/images/icons --suffix=tag_ --force');
}

function urlToTagFilename(url) {
    const pathname = new URL(url).pathname;

    // Get filename without extension
    let name = pathname.split('/').pop().replace(/\.svg$/i, '');

    // Remove trailing roman numeral level (_I, _II, _III, etc.)
    name = name.replace(/_?(?:I|II|III|IV|V|VI|VII|VIII|IX|X)?_icon$/i, '');

    return name.toLowerCase();
}

function parseArgs(argv) {
    const [svgUrl, widthArg, heightArg, ...flags] = argv;

    if (!svgUrl || !widthArg || !heightArg) {
        return { error: 'Missing required arguments.' };
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(svgUrl);
    } catch (_) {
        return { error: `Invalid URL: ${svgUrl}` };
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return { error: 'Only http/https URLs are supported.' };
    }

    const width = Number.parseInt(widthArg, 10);
    const height = Number.parseInt(heightArg, 10);

    if (!Number.isInteger(width) || width <= 0) {
        return { error: `Invalid width: ${widthArg}` };
    }

    if (!Number.isInteger(height) || height <= 0) {
        return { error: `Invalid height: ${heightArg}` };
    }

    let outDir = path.join('scripts', 'images');
    let force = false;
    let suffix = false;

    for (const flag of flags) {
        if (flag === '--force') {
            force = true;
            continue;
        }

        if (flag.startsWith('--out-dir=')) {
            const candidate = flag.slice('--out-dir='.length).trim();
            if (!candidate) {
                return { error: 'The --out-dir flag cannot be empty.' };
            }
            outDir = candidate;
            continue;
        }

        if (flag.startsWith('--suffix=')) {
            const candidate = flag.slice('--suffix='.length).trim();
            if (candidate) {
                suffix = candidate;
            }
            continue;
        }
    }

    let name = `${suffix ? suffix : ''}${urlToTagFilename(svgUrl)}.png`;

    return {
        svgUrl: parsedUrl.toString(),
        width,
        height,
        outDir,
        force,
        name
    };
}

function downloadSvg(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;

        client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (response) => {
            const statusCode = response.statusCode || 0;

            if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
                const redirectedUrl = new URL(response.headers.location, url).toString();
                response.resume();
                resolve(downloadSvg(redirectedUrl));
                return;
            }

            if (statusCode !== 200) {
                response.resume();
                reject(new Error(`Failed to download SVG: HTTP ${statusCode}`));
                return;
            }

            const chunks = [];

            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

async function convertSvgToPng(svgBuffer, outputPath, width, height) {
    await sharp(svgBuffer)
        .resize({ width, height, fit: 'contain' })
        .png()
        .toFile(outputPath);
}

async function main() {
    const parsed = parseArgs(process.argv.slice(2));

    if (parsed.error) {
        console.error(parsed.error);
        printUsage();
        process.exitCode = 1;
        return;
    }

    const outputPath = path.join(parsed.outDir, parsed.name);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    if (!parsed.force) {
        try {
            await fs.access(outputPath);
            console.error(`File already exists: ${outputPath}. Use --force to overwrite.`);
            process.exitCode = 1;
            return;
        } catch (_) {
            // File does not exist, continue.
        }
    }

    const svgBuffer = await downloadSvg(parsed.svgUrl);
    await convertSvgToPng(svgBuffer, outputPath, parsed.width, parsed.height);

    console.log(`Saved PNG: ${outputPath}`);
}

main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
});

