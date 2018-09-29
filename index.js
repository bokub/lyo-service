const {log} = console;
const parse = require('parse-package-name');
const {send} = require('micro');
const html = require('./lib/html');
const compile = require('./lib/compile');

module.exports = async (req, res) => {
	if (req.url === '/') {
		return html.index;
	}
	if (!req.url || req.url.indexOf('.') > -1 || req.url.indexOf('@lyo/') === 1) {
		send(res, 404, html.error(req.url, 'Invalid package name'));
		return;
	}

	try {
		const {name} = parse(req.url.substr(1).split('?')[0]);
		const readme = await compile(name);
		res.end(html.success(readme));
	} catch (err) {
		log(`Cannot compile or publish ${req.url.substr(1)}`);
		send(res, 500, html.error(req.url.substr(1), err));
	}
};
