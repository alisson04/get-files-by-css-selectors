import fs from "fs";

async function createFolder(folder) {
    var dir = './images/' + folder;

    if (fs.existsSync(dir)){
        await log('Folder already exists: ' + dir);
        return;
    }

    await log('Creating folder: ' + dir);
    fs.mkdirSync(dir);
}