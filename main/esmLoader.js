// Handles loading ESModules in the renderer process.

const { protocol } = require('electron');
const { promises: { readFile } } = require('fs');
const { join } = require('path');

protocol.registerBufferProtocol('esm', async (req,cb) => {
	let url = req.url;
	if (!req.url.includes('.')) url += '.js'; // TODO: handle directories and other file type loaders
	const file = await readFile(join(__dirname, '..', url.replace('esm://', ''))).catch(() => cb({status: 404}));
	// do transpiling here
	cb({ mimeType: 'text/javascript', data: file });
})