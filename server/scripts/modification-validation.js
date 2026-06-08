import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data_files');

const normalize = (content) => content.replace(/\r\n/g, '\n');

const walkTxtFiles = (directory) => {
	const entries = fs.readdirSync(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.resolve(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...walkTxtFiles(fullPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.txt')) {
			files.push(fullPath);
		}
	}

	return files;
};

const readFileIfExists = (filePath) => {
	if (!fs.existsSync(filePath)) {
		return null;
	}

	return fs.readFileSync(filePath, 'utf-8');
};

const compareFiles = (modifiedPath) => {
	const modifiedName = path.basename(modifiedPath);
	const originalPath = path.resolve(
		path.dirname(modifiedPath),
		modifiedName.replace('2.txt', '.txt'),
	);

	const originalContent = readFileIfExists(originalPath);
	const modifiedContent = readFileIfExists(modifiedPath);

	if (originalContent === null || modifiedContent === null) {
		return {
			file: path.relative(DATA_DIR, originalPath),
			status: 'SIN_PAREJA',
		};
	}

	return {
		file: path.relative(DATA_DIR, originalPath),
		status: normalize(originalContent) === normalize(modifiedContent)
			? 'SIN_CAMBIOS'
			: 'MODIFICADO',
	};
};

function main() {
	const modifiedFiles = walkTxtFiles(DATA_DIR)
		.filter((filePath) => path.basename(filePath).endsWith('2.txt'))
		.sort();

	const results = modifiedFiles.map(compareFiles);

	console.log('--- RESULTADO DE COMPARACION ---');
	console.table(results);

	const modified = results.filter((result) => result.status === 'MODIFICADO').map((result) => result.file);
	const unchanged = results.filter((result) => result.status === 'SIN_CAMBIOS').map((result) => result.file);
	const withoutPair = results.filter((result) => result.status === 'SIN_PAREJA').map((result) => result.file);

	console.log(`Modificados: ${modified.length ? modified.join(', ') : 'ninguno'}`);
	console.log(`Sin cambios: ${unchanged.length ? unchanged.join(', ') : 'ninguno'}`);
	console.log(`Sin pareja: ${withoutPair.length ? withoutPair.join(', ') : 'ninguno'}`);
}

main();

