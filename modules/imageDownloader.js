import puppeteer from 'puppeteer';
import fs from "fs";
import loadingBar from "./loading-bar.js";
import https from 'https';
import download from "image-downloader";
import axios from "axios";

class ImageDownloader {
    constructor(site) {
        this.site = site;
    }

    async run() {
        this.browser = await puppeteer.launch({ ignoreDefaultArgs: ['--disable-extensions'], args: ["--no-sandbox"] });

        await this.accessUrl();
        let urlsToDownload = await this.getUrlsToDownload();

        if (urlsToDownload.length) {
            await this.createFolder();
            urlsToDownload = await this.urlReplaces(urlsToDownload);

            await this.downloadFromElements(urlsToDownload);
        }

        await this.browser.close();
    }

    async accessUrl() {
        await this.log('Accessing: ' + this.site.url);
        this.page = await this.browser.newPage();
        await this.page.goto(this.site.url);
        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    async log(message) {
        console.log(message);
    }

    async getUrlsToDownload() {
        // await this.sleep();
        await this.autoScroll();

        let urlsToDownload = await this.getAttributesFromPage();
        let elsClickable = [];

        if (this.site.el_click_selector) {
            try {
                await this.page.waitForSelector(this.site.el_click_selector, {visible: true});
            } catch (e) {
                console.log(`element doesn't exist, should exit catch block and close.`);
            }
            elsClickable = await this.page.$$(this.site.el_click_selector);

            console.log('CLICK: ' + elsClickable.length);
        } else {
            console.log('NAO CLICK: ' + elsClickable.length);
        }

        if (elsClickable.length) {
            await this.page.click(this.site.el_click_selector);
            const othersPagesUrls = await this.getUrlsToDownload();

            urlsToDownload = urlsToDownload.concat(othersPagesUrls);
        }

        return urlsToDownload;
    }

    async autoScroll() {
        await this.log('AutoScrolling...');
        await this.page.evaluate(async () => {
            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, scrollHeight);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight - window.innerHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    async getAttributesFromPage() {
        await this.log('Searching for elements: ' + this.site.el_selector);

        const metaAttributes = await this.page.$$eval(
            this.site.el_selector, (el, site) => el.map(x => x.getAttribute(site.el_source_url.attr)),
            this.site
        );

        await this.log('Elements founded: ' + metaAttributes.length);
        return metaAttributes;
    }

    async createFolder() {
        var dir = './images/' + this.site.folder;

        if (fs.existsSync(dir)){
            await this.log('Folder already exists: ' + dir);
            return;
        }

        await this.log('Creating folder: ' + dir);
        fs.mkdirSync(dir);
    }

    async urlReplaces(urls) {
        let replaces = this.site.urls_replaces;

        if (urls.length && replaces !== undefined && replaces.length) {
            for(let replace of replaces) {
                urls = urls.map(url => url.replace(replace.search_for, replace.replace_for));
            }
        }

        return urls;
    }

    async getFileNameByLink(link) {
        let arrayType = link.split(".");
        let fileType = arrayType[arrayType.length - 1];

        let arrayName = link.split("/");
        let fileName = arrayName[arrayName.length - 1];

        return fileName.replace(/[^a-z0-9]/gi,'') + '.' + fileType;
    }

    async downloadFromElements(metaAttributes) {
        let downloadedFilesCount = 0;
        let existsFilesCount = 0;
        let files = await this.getFolderFilesNames('./images/' + this.site.folder);

        const loading = new loadingBar(metaAttributes.length);

        for (let link of metaAttributes) {
            let fileName = await this.getFileNameByLink(link);

            if (!files.includes(fileName)) {
                await this.sleep();
                await this.log('Downloading file: ' + fileName);
                // await this.downloadImage(link, '../../images/' + this.site.folder + '/' + fileName)
                //     .then((value) => {
                //         downloadedFilesCount++;
                //     })
                //     .catch(console.error);

                // const file = fs.createWriteStream('images/' + this.site.folder + '/' + fileName);
                const file = fs.createWriteStream('images/' + this.site.folder + '/' + fileName);
                console.log('BEFORE: ' + link);

                await axios({method: 'get', url: link, responseType: 'stream'}).then(response => {
                    return new Promise((resolve, reject) => {
                        response.data.pipe(file);
                        let error = null;
                        file.on('error', err => {
                            error = err;
                            file.close();
                            reject(err);
                        });
                        file.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                            //no need to call the reject here, as it will have been called in the
                            //'error' stream;
                        });
                    });
                });


                // let cx = await this.downloadFile(link, file);
                // const request = https.get(link, function(response) {
                //     response.pipe(file);
                //     // after download completed close filestream
                //     file.on("finish", () => {file.close();});
                // });

                // console.log('AQUI ' + link);
                // // await this.downloadFile(link, '../../images/modules/7c15965b8.m4v')
                // https.get(link,(res) => {
                //     // Image will be stored at this path
                //     const path = '6622c241-5f57-46e6-899e-3d95d8878d42.jpg';
                //     const filePath = fs.createWriteStream(path);
                //     res.pipe(filePath);
                //     filePath.on('finish',() => {
                //         filePath.close();
                //         console.log('dddddddddddddddddDownload Completed');
                //     })
                // })
            } else {
                await this.log('File already exists: ' + fileName);
                existsFilesCount++;
            }
console.log('showProgress');
            // await loading.showProgress(existsFilesCount + downloadedFilesCount);
        }

        await this.log('Already exists ' + existsFilesCount + ' of ' + metaAttributes.length);
        await this.log('Downloaded ' + downloadedFilesCount + ' of ' + metaAttributes.length);
    }

    async downloadFile(link, file) {
        return new Promise((resolve) => {
            https.get(link, function(response) {
                response.pipe(file);
                // after download completed close filestream
                file.on("finish", () => {file.close(); console.log('finish');});
            });
        });
    }

    async sleep() {
        setTimeout(() => {}, 1000);
    }

    async downloadImage(url, filepath) {
        return download.image({url, dest: filepath});
    }

    async getFolderFilesNames(folder) {
        await this.log('Getting files from: ' + folder);
        let files = fs.readdirSync(folder);
        await this.log('Files founded in ' + folder + ': ' + files.length);
        return files;
    }
}

export default ImageDownloader;
