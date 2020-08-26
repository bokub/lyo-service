const {log} = console;
const validate = require('validate-npm-package-name');
const check = require('../lib/check');
const compile = require('../lib/compile');
const html = require('../lib/html');

module.exports = async (request, response) => {
	if (request.method.toUpperCase() !== 'POST' && request.method.toUpperCase() !== 'GET') {
		return response.status(405).send('Method not allowed');
	}

	response.setHeader('Content-Type', 'text/html; charset=utf-8');

	// GET -> Check / POST -> Check then compile
	const canCompile = request.method.toUpperCase() === 'POST';

	// Validate module name
	const {name} = request.query;

	if (!validate(name).validForNewPackages || request.url.includes('.') || name.indexOf('@lyo/') === 0) {
		return response.status(404).send(html.error(request.url, 'Invalid package name'));
	}

	// Check if module was already compiled
	try {
		const result = await check(name);
		if (!canCompile || !result.shouldCompile) {
			return result.send(html.success(result.message));
		}
	} catch (err) {
		log(`Cannot run checks on ${name}: ${err}`);
		return response.status(500).send(html.error(name, err));
	}

	// Compile module
	try {
		console.log('HEHE');
		const result = await compile(name);
		return result.send(html.success(result));
	} catch (err) {
		log(`Cannot compile or publish ${name}`);
		return response.status(500).send(html.error(name, err));
	}
};
