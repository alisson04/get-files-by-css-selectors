import process from 'node:process';
import rdl from 'node:readline';

// const rdl = require("readline")
class LoadingBar {
    constructor(size) {
        this.size = size
    }

    setSize(size) {
        this.size = size;
    }

    async showProgress(progress) {
        let percentage = Math.round((progress * 100) / this.size);
        let dots = Math.round(percentage);

        console.clear();
        process.stdout.write("\x1B[?25l")
        process.stdout.write("[")

        for (let i = 0; i < 100; i++) {
            if (i < dots) {
                process.stdout.write("█")
            } else {
                process.stdout.write("░")
            }
        }
        process.stdout.write("]" + percentage + '%' + ' (' + progress + ' of ' + this.size + ')');
        rdl.cursorTo(process.stdout, 0, 1);

        // process.stdout.write("█");
    }
}

// class LoadingBar {
//     constructor() {
//         this.size = 900;
//         this.achieved = 100;
//     }
//
//     show() {
//         let percentage = Math.round((this.achieved * 100) / this.size);
//         let dots = Math.round((50 / 100) * percentage);
//         let dotsToShow = '|';
//
//         for (let i = 0; i < 50; i++) {
//             if (i <= dots) {
//                 dotsToShow += "█";
//                 continue;
//             }
//
//             dotsToShow += "░";
//         }
//
//         dotsToShow += '|';
//
//         console.clear()
//         console.log('[==================================================]');
//         console.log(dotsToShow + ' ' + percentage + '%' + ' (' + this.achieved + ' of ' + this.size + ')');
//         console.log('[==================================================]');
//     }
// }

// let cx = new LoadingBar(100);
// cx.start();
export default LoadingBar;
