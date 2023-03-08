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
    [ 'https://www.google.com', 'httpswwwgooglecom' ],
    [ 'https://twitter.com', 'httpstwittercom' ],
    [ 'https://instagram.com', 'httpsinstagramcom' ],
  ])('is getting a correct download file path by link', (link, expected) => {
    const getFilesByCssSelectors = new GetFilesByCssSelectors;

    return getFilesByCssSelectors.getFolderNameByLink(link).then((data) => { expect(data).toBe(expected) });
  });

  it.each([
    [ 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', '49051a2b08761814117b58c38593a0c3' ],
    [ 'https://pbs.twimg.com/profile_banners/14594760/1676488748/600x200', '5edff99de030b2d2d7c373ec643dd18b' ],
  ])('is getting a correct file name by link', (link, expected) => {
    const getFilesByCssSelectors = new GetFilesByCssSelectors;

    return getFilesByCssSelectors.getFileNameByLink(link).then((data) => { expect(data).toBe(expected) });
  });
});
