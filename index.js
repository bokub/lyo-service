const {log} = console;
const {send} = require('micro');
const validate = require('validate-npm-package-name');
const compile = require('./lib/compile');
const check = require('./lib/check');
const html = require('./lib/html');
const serveHandler = require('serve-handler');
const Router       = require('router');
const finalHandler = require('finalhandler');

const router = Router();

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html.index);
});

router.get('/static/*', (req, res) => serveHandler(req, res, {
    public: 'static',
    rewrites: [{ source: '/static/:rest', destination: '/:rest' }]
}));

router.get('/:name', async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Validate module name
    const name = req.params.name;
	if (!validate(name).validForNewPackages || req.url.indexOf('.') > -1 || name.indexOf('@lyo/') === 0) {
		send(res, 404, html.error(req.url, 'Invalid package name'));
		return;
	}

    // Check if module was already compiled
	try {
		console.log(1);
		const result = await check(name);
        console.log(2);

        if (result) {
            res.end(html.success(result));
			return ;
		}
	} catch (err) {
		log(`Cannot run checks on ${name}`);
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
});

module.exports = async (req, res) => {
    router(req, res, finalHandler(req, res))
};