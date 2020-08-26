const got = require('got');
const latestVersion = require('latest-version');
const template = require('lodash.template');

const compileButton = '\n<form method="POST" onsubmit="lockCta()"><button type="submit" id="cta">Run Lyo on <%= name %></button></form>\n\n';
const goBackButton = '\n<button id="cta" onclick="window.location.href = \'/\'">Try another module</button>';
const notFoundMessage = '# Not found\nOops, module <%= name %> does not exist on npm' + goBackButton;
const notCompiledMessage = '# Run Lyo on <%= name %>?\nIt looks like <%= name %> was never compiled by this service before' + compileButton;
const newVersionMessage = '# New version of <%= name %>\nThe last version of <%= name %> (<%= version %>) was never compiled by this service before' + compileButton;

async function check(name) {
	const publishedName = '@lyo/' + name.replace('@', '').replace('/', '.');
	let currentVersion = null;
	let lastVersion = null;

	try {
		await Promise.all([
			latestVersion(name).then(v => {
				lastVersion = v;
			}),
			latestVersion(publishedName).then(v => {
				currentVersion = v;
			}).catch(() => null)
		]);
	} catch {
		return {shouldCompile: false, message: template(notFoundMessage)({name})};
	}

	if (!currentVersion) {
		return {shouldCompile: true, message: template(notCompiledMessage)({name})};
	}

	const readme = await got(`https://cdn.jsdelivr.net/npm/${publishedName}/README.md`);
	return {
		shouldCompile: currentVersion !== lastVersion,
		message: currentVersion === lastVersion ? readme.body :
			(template(newVersionMessage)({name, version: lastVersion}) + readme.body)
	};
}

module.exports = check;
