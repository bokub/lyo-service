const fs = require('fs');

const {log} = console;
const marked = require('marked');
const parse = require('parse-package-name');
const {send} = require('micro');
const template = require('lodash.template');
const compile = require('./lib/compile');

module.exports = async (req, res) => {
	if (req.url === '/') {
		res.end(index());
		return;
	}
	if (!req.url || req.url.indexOf('.') > -1 || req.url.indexOf('@lyo/') === 1) {
		send(res, 404, error(req.url, 'Invalid package name'));
		return;
	}

	try {
		const {name} = parse(req.url.substr(1).split('?')[0]);
		const readme = await compile(name);
		res.end(success(readme));
	} catch (err) {
		log(`Cannot compile or publish ${req.url.substr(1)}`);
		send(res, 500, error(req.url.substr(1), err));
	}
};

const indexTemplate = template(fs.readFileSync('templates/index.html', 'utf-8'), {imports: {marked}});
const indexReadme = fs.readFileSync('README.md', 'utf-8');
const html = x => indexTemplate({md: x});
const success = readme => html(readme);
const error = (pkg, err) => html('# Lyo error\nCannot run Lyo on **' + pkg + '**\n```\n' + err + '```');
const index = () => html(indexReadme);
