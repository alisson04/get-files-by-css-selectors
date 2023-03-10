import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import mime from 'mime-types';
import md5 from 'md5';

/**
 * Represents a GetFilesByCssSelectors
 */
class GetFilesByCssSelectors {
  /**
   * @return {void}
   */
  constructor() {
    this.logs = [];
    this.page = null;
    this.browser = null;
    this.config = {infiniteScroll: true, showLogs: true};
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

    await this.createBrowserAndPage(site);

    const folderPath = './downloads/' + await this.getFolderNameByLink(site);
    await this.createFolder(folderPath);

    await this.takeScreenshot(folderPath + '/screenshot_1.png');

    await this.infiniteScroll();

    await this.takeScreenshot(folderPath + '/screenshot_2.png');

    const metaAttributes = await this.getLinksToDownload(cssSelector, linkAttr);

    await this.downloadFilesWithValidExtension(folderPath, metaAttributes);

    await this.finish();
  }

  /**
   * @return {void}
   */
  async finish() {
    await this.browser.close();
    await this.setLog('Finished');
  }

  /**
   * @param {String} cssSelector
   * @param {String} linkAttr
   * @return {Array} metaAttributes
   */
  async getLinksToDownload(cssSelector, linkAttr) {
    const metaAttributes = await this.page.$$eval(
        cssSelector,
        (el, linkAttr) => el.map((x) => x.getAttribute(linkAttr)),
        linkAttr,
    );
    await this.setLog('Found ' + metaAttributes.length + ' links to download');
    return metaAttributes;
  }

  /**
   * @param {String} path
   */
  async takeScreenshot(path) {
    await this.setLog('takeScreenshot');
    await this.page.screenshot({path: path});
  }

  /**
   * @param {String} site
   */
  async createBrowserAndPage(site) {
    await this.setLog('Create Browser');
    this.browser = await puppeteer.launch(
        {ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']},
    );

    await this.setLog('Create page');
    this.page = await this.browser.newPage();

    await this.setLog('Goto ' + site);
    await this.page.goto(site, {waitUntil: 'networkidle0'});

    await this.setLog('SetViewport');
    await this.page.setViewport({width: 1920, height: 1080});
  }

  /**
   * @param {String} folderPath
   * @param {Array} links
   */
  async downloadFilesWithValidExtension(folderPath, links) {
    for (const link of links) {
      if (link) {
        let fileName = await this.getFileNameByLink(link);

        await axios({method: 'get', url: link, responseType: 'stream'})
            .then((response) => {
              const contentType = response.headers['content-type'];
              const fileExtension = mime.extension(contentType);

              fileName = fileName + '.' + fileExtension;

              if (fileExtension) {
                const file = fs.createWriteStream(folderPath + '/' + fileName);

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
              }
            });
      }
    }
  }

  /**
   * @return {void}
   */
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
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, scrollHeight);
          totalHeight += distance;

          if (totalHeight >= scrollHeight - window.innerHeight) {
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
    this.config = {...this.config, ...config};
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
    await this.setLog('setFolderNameByLink');
    return link.replace(/[^\w\s]/gi, '');
  }

  /**
   * @param {string} link
   * @return {string}
   */
  async getFileNameByLink(link) {
    return md5(link);
  }

  /**
   * @param {string} folderPath
   */
  async createFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
      return;
    }

    await this.setLog('Creating folder: ' + folderPath);
    fs.mkdirSync(folderPath, {recursive: true});
  }
}

export default GetFilesByCssSelectors;
