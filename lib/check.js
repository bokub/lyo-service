const got = require('got');
const latestVersion = require('latest-version');

async function check(name) {
	const publishedName = '@lyo/' + name.replace('@', '').replace('/', '.');
	const latest = await latestVersion(name);

	try {
		const lyoVersion = await latestVersion(publishedName);
		if (lyoVersion !== latest) {
			return null;
		}
	} catch (e) {
		return null;
	}

	const readme = await got(`https://cdn.jsdelivr.net/npm/${publishedName}/README.md`);
	return readme.body;
}

module.exports = check;
