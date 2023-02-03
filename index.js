import puppeteer from 'puppeteer';
import axios from "axios";
import fs from "fs";

class DownloadByCssSelector {
    async run(site, cssSelector, linkAttr) {
        console.log('Create Browser')
        const browser = await puppeteer.launch({ ignoreDefaultArgs: ['--disable-extensions'], args: ["--no-sandbox"] });

        console.log('Create page')
        this.page = await browser.newPage();

        console.log('Goto ' + site);
        await this.page.goto(site, { waitUntil: "networkidle0" });

        console.log('SetViewport');
        await this.page.setViewport({ width: 1920, height: 1080 });

        console.log('Screenshot');
        await this.page.screenshot({ path: 'buddy-screenshot.png' });

        const metaAttributes = await this.page
            .$$eval(cssSelector, (el, linkAttr) => el.map(x => x.getAttribute(linkAttr)), linkAttr);

        for (let link of metaAttributes) {
            let fileName = await this.getFileNameByLink(link);

            const file = fs.createWriteStream('' + fileName);

            await axios({ method: 'get', url: link, responseType: 'stream' }).then(response => {
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
                    });
                });
            });
        }

        await browser.close();
        console.log('Done');
    }

    async getFileNameByLink(link) {
        let arrayType = link.split(".");
        let fileType = arrayType[arrayType.length - 1];

        let arrayName = link.split("/");
        let fileName = arrayName[arrayName.length - 1];

        return fileName.replace(/[^a-z0-9]/gi,'') + '.' + fileType;
    }
}

export default  DownloadByCssSelector;