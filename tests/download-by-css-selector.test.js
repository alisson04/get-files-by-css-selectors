import GetFilesByCssSelectors from '../index.js';

describe('Tests of getFilesByCssSelectors', () => {
  it('Must throw error when try to run without valid params', async () => {
    const expected = 'You must provide a site, a cssSelector and a linkAttr';
    async function tryToRun() {
      const getFilesByCssSelectors = new GetFilesByCssSelectors;
      await getFilesByCssSelectors.run('', '', '');
    }

    await expect(tryToRun).rejects.toThrow(expected)
  });

  it.each([
    [ 'https://www.google.com', './downloads/https___www_google_com' ],
    [ 'https://twitter.com', './downloads/https___twitter_com' ],
    [ 'https://instagram.com', './downloads/https___instagram_com' ],
  ])('is getting a correct download file path by link', (link, expected) => {
    const getFilesByCssSelectors = new GetFilesByCssSelectors;

    return getFilesByCssSelectors.getFolderNameByLink(link).then((data) => { expect(data).toBe(expected) });
  });

  it('is getting a correct file name by link', () => {
    const getFilesByCssSelectors = new GetFilesByCssSelectors;
    const link = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    const expected = 'googlelogocolor272x92dppng.png';

    return getFilesByCssSelectors.getFileNameByLink(link).then((data) => { expect(data).toBe(expected) });
  });
});
