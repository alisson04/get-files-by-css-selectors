# Get Files By Css Selectors

## About
This package is recommended for situations where you want to download the files of a site by it doesn't
have an option like a download button or an easy way to do it

## Features
* ✅ Access a web page and take a print screen
* ✅ Create a specific folder using the given site link
* ✅ Download any type of file(with or without extension on url) using a given css selector

## Features in development
* ⚙️ Add replace option to get the original image using the thumb image
* ⚙️ Add login option with .ENV to sites that require authentication
* ⚙️ Verify if file already exists and don't save download again(in cases when the downloads break by some reason)

## Tecnologies Used
<table>
    <tr>
        <td>Node</td>
        <td>axios</td>
        <td>puppeteer</td>
    </tr>
    <tr>
        <td>16.13</td>
        <td>1.3.1</td>
        <td>19.6.3</td>
    </tr>
</table>

## Getting Started
Install @dev-alisson-fernandes/get-files-by-css-selectors as a npm module
```shell
npm i @dev-alisson-fernandes/get-files-by-css-selectors
```

## Usage
```javascript
// import
import GetFilesByCssSelectors from '@dev-alisson-fernandes/get-files-by-css-selectors';
const getFilesByCssSelectors = new GetFilesByCssSelectors;
```

### Example 1 - Twitter
```javascript
// define params
let randomSite = 'https://twitter.com/UOLEconomia';
let cssSelectors = 'img[class~="css-9pa8cd"]';
let attrName = 'src';

// run
await getFilesByCssSelectors.run(randomSite, cssSelectors, attrName);
```
### Example 2 - Instagram
```javascript
// define params
let randomSite = 'https://www.instagram.com/uoloficial/';
let cssSelectors = 'img[class="x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3"]';
let attrName = 'src';

// run
await getFilesByCssSelectors.run(randomSite, cssSelectors, attrName);
```
### Example 3 - Google Images
```javascript
// define params
let randomSite = 'https://www.google.com/search?q=imagem&source=lnms&tbm=isch';
let cssSelectors = 'img[class="rg_i Q4LuWd"]';
let attrName = 'src';

// run
await getFilesByCssSelectors.run(randomSite, cssSelectors, attrName);
```

### Logs
```javascript
// show array logs in the end
getFilesByCssSelectors.getLogs();

// Disable showing logs durant run process
getFilesByCssSelectors.setConfig({ infiniteScroll: false });
```

### InfiniteScroll
By default, all pages will be scrolled to the end before search elements, but you can disable this behavior 
with the code below 
```javascript
getFilesByCssSelectors.setConfig({ infiniteScroll: false });
```

## Dev
* RUN TESTS: npm test
* RUN LINT: npm eslint

## License
GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.html)