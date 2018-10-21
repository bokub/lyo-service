const fs = require('fs');

const marked = require('marked');
const template = require('lodash.template');

const indexTemplate = template(fs.readFileSync('index.html', 'utf-8'), {imports: {marked}});
const indexReadme = fs.readFileSync('index.md', 'utf-8');
const html = x => indexTemplate({md: x});
const index = html(indexReadme);

module.exports = {
	success: readme => html(readme),
	error: (pkg, err) => html('# Lyo error\nCannot run Lyo on **' + pkg + '**\n```\n' + err + '```'),
	index
};
