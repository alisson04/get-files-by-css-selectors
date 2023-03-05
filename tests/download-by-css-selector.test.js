import DownloadByCssSelector from '../index.js';
const downloadByCssSelector = new DownloadByCssSelector;

test('is getting a correct download file path by link', () => {
  return downloadByCssSelector.getFolderNameByLink('https://www.google.com').then((data) => {
    expect(data).toBe('./downloads/https___www_google_com');
  });
});

test('is getting a correct file name by link', () => {
  return downloadByCssSelector.getFileNameByLink(
      'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
  ).then((data) => {
    expect(data).toBe('googlelogocolor272x92dppng.png');
  });
});
