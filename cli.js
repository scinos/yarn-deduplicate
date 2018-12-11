#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');

const { fixDuplicates, listDuplicates } = require('./index');
const version = require('./package.json').version;

commander
    .version(version)
    .usage('[options] <yarn.lock path>')
    .option(
        '-s, --strategy <strategy>',
        'deduplication strategy. Valid values: fewer, highest. Default is "highest"',
        'highest'
    )
    .option('-l, --list', 'do not change yarn.lock, just output the diagnosis')
    .option(
        '--packages <packages>',
        'a comma separated list of packages to deduplicate. Defaults to all packages.',
        val => val.split(',').map(v => v.trim())
    )
    .option('--print', 'instead of saving the deduplicated yarn.lock, print the result in stdout');
commander.parse(process.argv);
if (!commander.args.length) commander.help();
if (commander.strategy !== 'highest' && commander.strategy !== 'fewer') {
    console.error(`Invalid strategy ${commander.strategy}`);
    commander.help();
}

const file = commander.args[0];

try {
    const yarnLock = fs.readFileSync(file, 'utf8');
    const useMostCommon = commander.strategy === 'fewer';

    if (commander.list) {
        listDuplicates(yarnLock, {
            useMostCommon,
            includePackages: commander.packages,
        }).forEach(logLine => console.log(logLine));
    } else {
        let dedupedYarnLock = fixDuplicates(yarnLock, {
            useMostCommon,
            includePackages: commander.packages,
        });

        if (commander.print) {
            console.log(dedupedYarnLock);
        } else {
            const eolMatch = yarnLock.match(/(\r?\n)/);
            if (eolMatch && eolMatch[0] === '\r\n') {
                dedupedYarnLock = dedupedYarnLock.replace(/\n/g, '\r\n');
            }
            fs.writeFileSync(file, dedupedYarnLock);
        }
    }

    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
