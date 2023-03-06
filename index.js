import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';

/**
 * Represents a GetFilesByCssSelectors
 */
class GetFilesByCssSelectors {
  /**
   * @param {string} site
   * @param {string} cssSelector
   * @param {string} linkAttr
   */
  async run(site, cssSelector, linkAttr) {
    console.log('Create Browser');
    const browser = await puppeteer.launch(
        {ignoreDefaultArgs: ['--disable-extensions'], args: ['--no-sandbox']},
    );

    console.log('Create page');
    this.page = await browser.newPage();

    console.log('Goto ' + site);
    await this.page.goto(site, {waitUntil: 'networkidle0'});

    console.log('SetViewport');
    await this.page.setViewport({width: 1920, height: 1080});

    console.log('getFolderNameByLink');
    const folderPath = await this.getFolderNameByLink(site);
    await this.createFolder(folderPath);

    console.log('Screenshot1');
    await this.page.screenshot({path: folderPath + '/screenshot_1.png'});

    await this.autoScroll();

    console.log('Screenshot2');
    await this.page.screenshot({path: folderPath + '/screenshot_2.png'});

    const metaAttributes = await this.page.$$eval(
        cssSelector,
        (el, linkAttr) => el.map((x) => x.getAttribute(linkAttr)),
        linkAttr,
    );

    for (const link of metaAttributes) {
      if (link) {
        const fileName = await this.getFileNameByLink(link);

        const file = fs.createWriteStream(folderPath + '/' + fileName);

        await axios({method: 'get', url: link, responseType: 'stream'})
            .then((response) => {
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

    await browser.close();
    console.log('Done');
  }

  async autoScroll() {
    await console.log('AutoScrolling...');
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
   * @param {string} link
   * @return {string}
   */
  async getFolderNameByLink(link) {
    return './downloads/' + link.replace(/[^\w\s]/gi, '_');
  }

  /**
   * @param {string} link
   * @return {string}
   */
  async getFileNameByLink(link) {
    console.log(link)
    const arrayQueryString = link.split('?');
    link = arrayQueryString[0];

    const arrayType = link.split('.');
    const fileType = arrayType[arrayType.length - 1];

    const arrayName = link.split('/');
    const fileName = arrayName[arrayName.length - 1];

    return fileName.replace(/[^a-z0-9]/gi, '') + '.' + fileType;
  }

  /**
   * @param {string} folderPath
   */
  async createFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
      return;
    }

    console.log('Creating folder: ' + folderPath);
    fs.mkdirSync(folderPath, {recursive: true});
  }
}

export default GetFilesByCssSelectors;
