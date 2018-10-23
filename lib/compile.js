const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

const indentString = require('indent-string');
const lyo = require('lyo');
const npmi = require('npmi');
const pify = require('pify');
const template = require('lodash.template');
const usage = require('lyo/lib/usage');

const {log} = console;
const install = pify(npmi);
const packageTemplate = template(fs.readFileSync('templates/package.json', 'utf-8'));
const readmeTemplate = template(fs.readFileSync('templates/README.md', 'utf-8'), {imports: {indent: indentString}});

if (process.env.NODE_ENV !== 'dev') {
	console.info = () => null;
	console.log = () => null;
	console.error = () => null;
}

async function compile(module) {
	const installOpts = {name: module, path: path.join(__dirname, '../tmp')};
	await install(installOpts);
	const dir = path.join(__dirname, '../tmp', 'node_modules', module);
	const pkg = require(path.join(dir, 'package.json'));
	const flags = {
		remote: module,
		inputDir: dir,
		output: path.join('dist', module),
		banner: `${module} ${pkg.version} ${pkg.description ? ('- ' + pkg.description) : ''}\n` +
            `<https://npmjs.com/package/${module}>\n` +
            'Built automatically with Lyo - github.com/bokub/lyo'
	};
	await lyo(flags, pkg);
	log('Transpiled ' + module);
	const readme = prepare(flags, pkg);
	await publish(path.dirname(flags.output));
	return readme;
}

function prepare(opts, pkg) {
	pkg.file = path.basename(opts.output);
	pkg.exportedName = path.basename(opts.name);
	pkg.publishName = '@lyo/' + pkg.name.replace('@', '').replace('/', '.');
	pkg.usage = usage.getModuleSignature({input: opts.output, name: opts.name});

	const packageContent = packageTemplate(pkg);
	const readmeContent = readmeTemplate(pkg);
	fs.writeFileSync(path.dirname(opts.output) + '/package.json', packageContent);
	fs.writeFileSync(path.dirname(opts.output) + '/README.md', readmeContent);
	return readmeContent;
}

async function publish(dir) {
	if (!process.env.NPM_TOKEN) {
		return;
	}
	const cmd = `npm publish ${dir} --access=public`;
	const {stdout} = await exec(cmd);
	log('Published', stdout);
}

module.exports = compile;
