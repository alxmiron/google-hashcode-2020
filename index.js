const fs = require('fs');
const path = require('path');

const books = [];
const libraries = [];

readInput(`${process.env.INPUT}.txt`);
//console.log(libraries);

saveOutput([{ id: 1, booksOrder: [1, 2, 3] }]);

function readInput(inputFile) {
	const inputStr = fs.readFileSync(path.join(__dirname, `./task/${inputFile}`), { encoding: 'utf8' });
	//console.log(inputStr);
	const lines = inputStr.split('\n');

	const firstLine = lines[0].split(' ');
	const booksAmount = toNum(firstLine[0]);
	const librariesAmount = toNum(firstLine[1]);
	const daysAmount = toNum(firstLine[2]);

	lines[1].split(' ').forEach(bookWeight => books.push(toNum(bookWeight)));

	for (let i = 2; i < 2 + librariesAmount * 2; i += 2) {
		const lineA = lines[i].split(' ');
		const lineB = lines[i + 1].split(' ');
		libraries.push({
			id: libraries.length,
			booksAmount: toNum(lineA[0]),
			signupDays: toNum(lineA[1]),
			booksSpeed: toNum(lineA[2]),
			books: lineB.map(toNum).reduce((acc, bookId) => {
				acc[bookId] = books[bookId];
				return acc;
			}, {}),
		});
	}
}

function saveOutput(libsOrder) {
	const resultLines = [`${libsOrder.length}`];
	libsOrder.forEach(libOrder => {
		resultLines.push(`${libOrder.id} ${libOrder.booksOrder.length}`);
		resultLines.push(libOrder.booksOrder.join(' '));
	});
	const result = resultLines.join('\n');
	const outputFile = `${process.env.INPUT}-output.txt`;
	fs.writeFileSync(path.join(__dirname, `./task/${outputFile}`), result, { encoding: 'utf8' });
}

function toNum(str) {
	return parseInt(str, 10);
}
