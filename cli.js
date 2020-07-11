#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');

const { fixDuplicates, listDuplicates } = require('./index');
const version = require('./package.json').version;

commander
    .version(version)
    .usage('[options] [yarn.lock path (default: yarn.lock)]')
    .option(
        '-s, --strategy <strategy>',
        'deduplication strategy. Valid values: fewer, highest. Default is "highest"',
        'highest'
    )
    .option('-l, --list', 'do not change yarn.lock, just output the diagnosis')
    .option(
        '-f, --fail',
        'if there are duplicates in yarn.lock, terminate the script with exit status 1'
    )
    .option(
        '--scopes <scopes>',
        'a comma separated list of scopes to deduplicate. Defaults to all packages.',
        (val) => val.split(',').map((v) => v.trim())
    )
    .option(
        '--packages <packages>',
        'a comma separated list of packages to deduplicate. Defaults to all packages.',
        (val) => val.split(',').map((v) => v.trim())
    )
    .option(
        '--exclude <exclude>',
        'a comma separated list of packages not to deduplicate.',
        (val) => val.split(',').map((v) => v.trim())
    )
    .option('--print', 'instead of saving the deduplicated yarn.lock, print the result in stdout');

commander.parse(process.argv);

if (commander.scopes && commander.packages) {
    console.error('Please specify either scopes or packages, not both.');
    commander.help();
}

if (commander.strategy !== 'highest' && commander.strategy !== 'fewer') {
    console.error(`Invalid strategy ${commander.strategy}`);
    commander.help();
}

const file = commander.args.length ? commander.args[0] : 'yarn.lock';

try {
    const yarnLock = fs.readFileSync(file, 'utf8');
    const useMostCommon = commander.strategy === 'fewer';

    if (commander.list) {
        const duplicates = listDuplicates(yarnLock, {
            useMostCommon,
            includeScopes: commander.scopes,
            includePackages: commander.packages,
            excludePackages: commander.exclude,
        });
        duplicates.forEach((logLine) => console.log(logLine));
        if (commander.fail && duplicates.length > 0) {
            process.exit(1);
        }
    } else {
        let dedupedYarnLock = fixDuplicates(yarnLock, {
            useMostCommon,
            includeScopes: commander.scopes,
            includePackages: commander.packages,
            excludePackages: commander.exclude,
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

        if (commander.fail && yarnLock !== dedupedYarnLock) {
            process.exit(1);
        }
    }

    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
