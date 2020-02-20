const fs = require('fs');
const path = require('path');

const inputFile = 'a_example.txt';
const inputStr = fs.readFileSync(path.join(__dirname, `./task/${inputFile}`), { encoding: 'utf8' });
console.log(inputStr);
