const fs = require('fs/promises');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'copyData.json');
const SOURCE_IMAGES_DIR = path.join(__dirname, 'images');
const SOURCE_DATA_DIR = path.join(__dirname, 'data');

async function pathExists(targetPath) {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

function getFolderCandidates(folderName) {
    const candidates = [folderName];

    if (folderName.endsWith('ies')) {
        candidates.push(`${folderName.slice(0, -3)}y`);
    }

    if (folderName.endsWith('s')) {
        candidates.push(folderName.slice(0, -1));
    }

    return [...new Set(candidates)];
}

async function resolveSourceFolder(baseDir, folderName) {
    const candidates = getFolderCandidates(folderName);

    for (const candidate of candidates) {
        const candidatePath = path.join(baseDir, candidate);
        if (await pathExists(candidatePath)) {
            return candidatePath;
        }
    }

    return null;
}

async function copyImagesForTarget(targetName, imageFolders) {
    const targetImagesDir = path.join(ROOT_DIR, targetName, 'images');
    await fs.mkdir(targetImagesDir, {recursive: true});

    for (const folderName of imageFolders || []) {
        const sourceFolder = await resolveSourceFolder(SOURCE_IMAGES_DIR, folderName);

        if (!sourceFolder) {
            console.warn(`[${targetName}] image folder not found: ${folderName}`);
            continue;
        }

        const entries = await fs.readdir(sourceFolder, {withFileTypes: true});

        for (const entry of entries) {
            if (!entry.isFile()) {
                continue;
            }

            const sourceFile = path.join(sourceFolder, entry.name);
            const destFile = path.join(targetImagesDir, entry.name);
            await fs.copyFile(sourceFile, destFile);
        }

        console.log(`[${targetName}] copied images from ${path.basename(sourceFolder)}`);
    }
}

async function combineDataForTarget(targetName, dataFiles) {
    const targetDir = path.join(ROOT_DIR, targetName);
    const targetDataPath = path.join(targetDir, 'data.json');
    await fs.mkdir(targetDir, {recursive: true});

    let combinedData = {};

    if (await pathExists(targetDataPath)) {
        try {
            const existingRaw = await fs.readFile(targetDataPath, 'utf8');
            combinedData = JSON.parse(existingRaw || '{}');
        } catch {
            console.warn(`[${targetName}] existing data.json is invalid JSON, replacing it`);
            combinedData = {};
        }
    }

    for (const dataName of dataFiles || []) {
        const sourceDataPath = path.join(SOURCE_DATA_DIR, `${dataName}.json`);

        if (!(await pathExists(sourceDataPath))) {
            console.warn(`[${targetName}] data file not found: ${dataName}.json`);
            continue;
        }

        const raw = await fs.readFile(sourceDataPath, 'utf8');
        const parsed = JSON.parse(raw);

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`[${targetName}] skipped non-object data file: ${dataName}.json`);
            continue;
        }

        Object.assign(combinedData, parsed);
        console.log(`[${targetName}] merged data from ${dataName}.json`);
    }

    await fs.writeFile(targetDataPath, `${JSON.stringify(combinedData, null, 2)}\n`, 'utf8');
    console.log(`[${targetName}] wrote ${targetDataPath}`);
}

async function main() {
    const configRaw = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configRaw);

    for (const [targetName, targetConfig] of Object.entries(config)) {
        await copyImagesForTarget(targetName, targetConfig.images);
        await combineDataForTarget(targetName, targetConfig.data);
    }

    console.log('Copy and merge finished.');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
