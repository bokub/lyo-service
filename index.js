const {log} = console;
const {send} = require('micro');
const validate = require('validate-npm-package-name');
const compile = require('./lib/compile');
const check = require('./lib/check');
const html = require('./lib/html');

module.exports = async (req, res) => {
	if (req.url === '/') {
		return html.index;
	}
	// Validate module name
	const name = require('url').parse(req.url).pathname.substr(1);
	if (!validate(name).validForNewPackages || req.url.indexOf('.') > -1 || name.indexOf('@lyo/') === 0) {
		send(res, 404, html.error(req.url, 'Invalid package name'));
		return;
	}

	// Check if module was already compiled
	try {
		const result = await check(name);
		if (result) {
			return html.success(result);
		}
	} catch (err) {
		log(`Cannot run checks on ${name}`);
		send(res, 500, html.error(name, err));
		return;
	}

	// Compile module
	try {
		const result = await compile(name);
		return html.success(result);
	} catch (err) {
		log(`Cannot compile or publish ${name}`);
		send(res, 500, html.error(name, err));
	}
};
