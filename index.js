const {log} = console;
const {send} = require('micro');
const validate = require('validate-npm-package-name');
const serveHandler = require('serve-handler');
const finalHandler = require('finalhandler');
const router = require('router')();
const compile = require('./lib/compile');
const check = require('./lib/check');
const html = require('./lib/html');

router.get('/', (req, res) => {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.end(html.index);
});

router.get('/static/*', (req, res) => serveHandler(req, res, {
	public: 'static',
	rewrites: [{source: '/static/:rest', destination: '/:rest'}]
}));

router.get('/:name', (req, res) => {
	return index(req, res, false);
});

router.post('/:name', (req, res) => {
	return index(req, res, true);
});

async function index(req, res, canCompile) {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');

	// Validate module name
	const {name} = req.params;
	if (!validate(name).validForNewPackages || req.url.indexOf('.') > -1 || name.indexOf('@lyo/') === 0) {
		send(res, 404, html.error(req.url, 'Invalid package name'));
		return;
	}

	// Check if module was already compiled
	try {
		const result = await check(name);
		if (!canCompile || !result.shouldCompile) {
			res.end(html.success(result.message));
			return;
		}
	} catch (err) {
		log(`Cannot run checks on ${name}: ${err}`);
		send(res, 500, html.error(name, err));
		return;
	}

	// Compile module
	try {
		const result = await compile(name);
		res.end(html.success(result));
	} catch (err) {
		log(`Cannot compile or publish ${name}`);
		send(res, 500, html.error(name, err));
	}
}

module.exports = (req, res) => {
	router(req, res, finalHandler(req, res));
};
