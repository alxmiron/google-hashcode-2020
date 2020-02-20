const fs = require('fs');
const path = require('path');

const logging = false;
let daysAmount;
const books = [];
const libraries = [];

readInput(`${process.env.INPUT}.txt`);
addSignupSpeedRank();
addScanSpeedRank();
addBooksAmountRank();
addWeightRank();
calculateTotalRank(0.4, 0.2, 0.3, 0.1);
if (logging) console.log(libraries);
const orderedLibs = libraries.map(lib => ({ id: lib.id, rank: lib.totalRank })).sort((a, b) => (a.rank === b.rank ? 0 : a.rank < b.rank ? 1 : -1));
addOrderedBooks();
markDuplicatedBooks();
if (logging) console.log(orderedLibs);
saveOutput();

function addSignupSpeedRank() {
	const min = Math.min(...libraries.map(lib => lib.signupSpeed));
	const max = Math.max(...libraries.map(lib => lib.signupSpeed));
	const getRank = x => (max - x) / (max - min);
	libraries.forEach(lib => {
		lib.signupSpeedRank = getRank(lib.signupSpeed);
	});
}

function addScanSpeedRank() {
	const min = Math.min(...libraries.map(lib => lib.scanSpeed));
	const max = Math.max(...libraries.map(lib => lib.scanSpeed));
	const getRank = x => (x - min) / (max - min);
	libraries.forEach(lib => {
		lib.scanSpeedRank = getRank(lib.scanSpeed);
	});
}

function addBooksAmountRank() {
	const min = Math.min(...libraries.map(lib => lib.booksAmount));
	const max = Math.max(...libraries.map(lib => lib.booksAmount));
	const getRank = x => (x - min) / (max - min);
	libraries.forEach(lib => {
		lib.booksAmountRank = getRank(lib.booksAmount);
	});
}

function addWeightRank() {
	const getTotalBooksWeight = lib => Object.values(lib.books).reduce((acc, bookWeight) => acc + bookWeight, 0);
	const getLibWeight = lib => getTotalBooksWeight(lib) / lib.booksAmount;
	const libWeights = libraries.map(getLibWeight);
	const min = Math.min(...libWeights);
	const max = Math.max(...libWeights);
	const getRank = x => (x - min) / (max - min);
	libraries.forEach((lib, idx) => {
		lib.weightRank = getRank(libWeights[idx]);
	});
}

function calculateTotalRank(k1, k2, k3, k4) {
	libraries.forEach(lib => {
		lib.totalRank = k1 * lib.signupSpeedRank + k2 * lib.scanSpeedRank + k3 * lib.booksAmountRank + k4 * lib.weightRank;
	});
}

function addOrderedBooks() {
	orderedLibs.forEach(orderedLib => {
		const lib = libraries[orderedLib.id];
		const orderedBooks = Object.keys(lib.books)
			.map(id => ({ id, rank: lib.books[id] }))
			.sort((a, b) => (a.rank === b.rank ? 0 : a.rank < b.rank ? 1 : -1));
		orderedLib.orderedBooks = orderedBooks.map(orderedBook => orderedBook.id);
	});
}

function markDuplicatedBooks() {
	const isLibActiveOnDay = (dayId, orderedLib) => dayId >= orderedLib.startFrom;
	orderedLibs.reduce((acc, orderedLib) => {
		const lib = libraries[orderedLib.id];
		orderedLib.startFrom = acc + lib.signupSpeed;
		return acc + lib.signupSpeed;
	}, 0);

	const scannedBooks = {};
	for (let i = 0; i < daysAmount; i++) {
		orderedLibs.forEach(orderedLib => {
			if (!isLibActiveOnDay(i, orderedLib)) return;
			const lib = libraries[orderedLib.id];
			const startFromBook = (i - orderedLib.startFrom) * lib.scanSpeed;
			const booksToScan = orderedLib.orderedBooks.slice(startFromBook, startFromBook + lib.scanSpeed).reduce((acc, bookId) => {
				acc[bookId] = true;
				return acc;
			}, {});
			if (logging) console.log(i, lib.id, booksToScan);
			orderedLib.orderedBooks = orderedLib.orderedBooks.map(bookId => {
				const needScan = !!booksToScan[bookId];
				if (!needScan) return bookId;
				if (scannedBooks[bookId]) return null;
				scannedBooks[bookId] = true;
				return bookId;
			});
		});
	}
}

function readInput(inputFile) {
	const inputStr = fs.readFileSync(path.join(__dirname, `./task/${inputFile}`), { encoding: 'utf8' });
	const lines = inputStr.split('\n');

	const firstLine = lines[0].split(' ');
	// const booksAmount = toNum(firstLine[0]);
	const librariesAmount = toNum(firstLine[1]);
	daysAmount = toNum(firstLine[2]);

	lines[1].split(' ').forEach(bookWeight => books.push(toNum(bookWeight)));

	for (let i = 2; i < 2 + librariesAmount * 2; i += 2) {
		const lineA = lines[i].split(' ');
		const lineB = lines[i + 1].split(' ');
		libraries.push({
			id: libraries.length,
			booksAmount: toNum(lineA[0]),
			signupSpeed: toNum(lineA[1]),
			scanSpeed: toNum(lineA[2]),
			books: lineB.map(toNum).reduce((acc, bookId) => {
				acc[bookId] = books[bookId];
				return acc;
			}, {}),
		});
	}
}

function saveOutput() {
	const resultLines = [`${orderedLibs.length}`];
	orderedLibs.forEach(orderedLib => {
		const books = orderedLib.orderedBooks.filter(bookId => bookId !== null);
		resultLines.push(`${orderedLib.id} ${books.length}`);
		resultLines.push(books.join(' '));
	});
	const result = resultLines.join('\n');
	const outputFile = `${process.env.INPUT}-output.txt`;
	fs.writeFileSync(path.join(__dirname, `./task/${outputFile}`), result, { encoding: 'utf8' });
}

function toNum(str) {
	return parseInt(str, 10);
}
