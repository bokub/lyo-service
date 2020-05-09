const {join} = require('path');
const {readFileSync} = require('fs');

const marked = require('marked');
const template = require('lodash.template');

const indexTemplate = template(readFileSync(join(__dirname, '../html/index.html'), 'utf-8'), {imports: {marked}});
const html = x => indexTemplate({md: x});

module.exports = {
	success: readme => html(readme),
	error: (pkg, err) => html('# Lyo error\nCannot run Lyo on **' + pkg + '**\n```\n' + err + '```')
};
