import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import mime from 'mime-types';
import md5 from 'md5';

/**
 * Represents a GetFilesByCssSelectors
 */
class GetFilesByCssSelectors {
  constructor() {
    this.logs = [];
    this.config = { infiniteScroll: true, showLogs: true }
  }

  /**
   * @param {string} site
   * @param {string} cssSelector
   * @param {string} linkAttr
   */
  async run(site, cssSelector, linkAttr) {
    if (!site || !cssSelector || !linkAttr) {
      throw new Error('You must provide a site, a cssSelector and a linkAttr');
    }

    await this.setLog('Create Browser');
    const browser = await puppeteer.launch(
        {ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']},
    );

    await this.setLog('Create page');
    this.page = await browser.newPage();

    await this.setLog('Goto ' + site);
    await this.page.goto(site, {waitUntil: 'networkidle0'});

    await this.setLog('SetViewport');
    await this.page.setViewport({width: 1920, height: 1080});

    await this.setLog('getFolderNameByLink');
    const folderPath = './downloads/' + await this.getFolderNameByLink(site);
    await this.createFolder(folderPath);

    await this.setLog('Screenshot1');
    await this.page.screenshot({path: folderPath + '/screenshot_1.png'});

    await this.infiniteScroll();

    await this.setLog('Screenshot2');
    await this.page.screenshot({path: folderPath + '/screenshot_2.png'});

    const metaAttributes = await this.page.$$eval(
        cssSelector,
        (el, linkAttr) => el.map((x) => x.getAttribute(linkAttr)),
        linkAttr,
    );

    await this.setLog('Found ' + metaAttributes.length + ' links to download');
    await this.downloadFiles(folderPath, metaAttributes);

    await browser.close();
    await this.setLog('Done');
  }

  /**
   * @param {String} folderPath
   * @param {Array} links
   */
  async downloadFiles(folderPath, links) {
    for (const link of links) {
      if (link) {
        let fileName = await this.getFileNameByLink(link);

        await axios({method: 'get', url: link, responseType: 'stream'})
          .then((response) => {
            let fileExtension = mime.extension(response.headers['content-type']);
            const file = fs.createWriteStream(folderPath + '/' + fileName + '.' + fileExtension);

            return new Promise((resolve, reject) => {
              response.data.pipe(file);
              let error = null;
              file.on('error', (err) => {
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
    }
  }

  async infiniteScroll() {
    if (!this.config.infiniteScroll) {
      return;
    }

    await this.setLog('AutoScrolling');
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
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

  /**
   * @param {Object} config
   */
  setConfig(config) {
    this.config = { ...this.config, ...config};
  }

  /**
   * @param {string} message
   */
  async setLog(message) {
    this.logs.push(message);

    if (this.config.showLogs) {
      console.log(message);
    }
  }

  /**
   * @return {Array}
   */
  getLogs() {
    return this.logs;
  }

  /**
   * @param {string} link
   * @return {string}
   */
  async getFolderNameByLink(link) {
    return link.replace(/[^\w\s]/gi, '');
  }

  /**
   * @param {string} link
   * @return {string}
   */
  async getFileNameByLink(link) {
    return md5(link.replace(/[^\w\s]/gi, ''));
  }

  /**
   * @param {string} folderPath
   */
  async createFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
      return;
    }

    await this.setLog('Creating folder: ' + folderPath);
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

export default GetFilesByCssSelectors;
