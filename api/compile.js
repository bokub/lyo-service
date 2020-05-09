const {log} = console;
const validate = require('validate-npm-package-name');
const check = require('../lib/check');
const compile = require('../lib/compile');
const html = require('../lib/html');

module.exports = async (req, res) => {
	if (req.method.toUpperCase() !== 'POST' && req.method.toUpperCase() !== 'GET') {
		return res.status(405).send('Method not allowed');
	}
	res.setHeader('Content-Type', 'text/html; charset=utf-8');

	// GET -> Check / POST -> Check then compile
	const canCompile = req.method.toUpperCase() === 'POST';

	// Validate module name
	const {name} = req.query;

	if (!validate(name).validForNewPackages || req.url.indexOf('.') > -1 || name.indexOf('@lyo/') === 0) {
		return res.status(404).send(html.error(req.url, 'Invalid package name'));
	}

	// Check if module was already compiled
	try {
		const result = await check(name);
		if (!canCompile || !result.shouldCompile) {
			return res.send(html.success(result.message));
		}
	} catch (err) {
		log(`Cannot run checks on ${name}: ${err}`);
		return res.status(500).send(html.error(name, err));
	}

	// Compile module
	try {
		console.log('HEHE');
		const result = await compile(name);
		return res.send(html.success(result));
	} catch (err) {
		log(`Cannot compile or publish ${name}`);
		return res.status(500).send(html.error(name, err));
	}
};
