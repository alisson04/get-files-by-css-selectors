# Get Files By Css Selectors

## Features
* Access a web page and take a print screen
* Create a specific folder using the given site link
* Download images using a given css selector

## Features in development
* Download images without extension like (.png, .jpg)
* Add replace option to get the original image using the thumb image
* Download files other types of files

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

## Usage Example
```javascript
// import
import GetFilesByCssSelectors from '@dev-alisson-fernandes/get-files-by-css-selectors';
const getFilesByCssSelectors = new GetFilesByCssSelectors;

// define params
let randomSite = 'https://www.bikewale.com/honda-bikes/activa-6g/images/';
let cssSelectors = 'img[class~="gallery-swiper-image"]';
let attrName = 'data-original';

// run
await getFilesByCssSelectors.run(randomSite, cssSelectors, attrName);

// show logs
getFilesByCssSelectors.getLogs();
```

## Dev
* RUN TESTS: npm test
* RUN LINT: npm eslint

## License
GNU General Public License v3.0 (https://www.gnu.org/licenses/gpl-3.0.html)