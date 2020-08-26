const {readFileSync} = require('fs');
const {join} = require('path');

const marked = require('marked');
const template = require('lodash.template');

module.exports = (request, response) => {
	const indexTemplate = template(readFileSync(join(__dirname, '../html/index.html'), 'utf-8'), {imports: {marked}});
	const indexReadme = readFileSync(join(__dirname, '../html/index.md'), 'utf-8');
	response.setHeader('Content-Type', 'text/html; charset=utf-8');
	response.send(indexTemplate({md: indexReadme}));
};
