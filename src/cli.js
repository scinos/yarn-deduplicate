#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');

const { fixDuplicates, listDuplicates } = require('./index');
const version = require('../package.json').version;

const FAIL_MESSAGE = '\nFound duplicated entries. Run yarn-deduplicate to deduplicate them.';

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
    .option('--scopes <scopes...>', 'a list of scopes to deduplicate. Defaults to all packages.')
    .option(
        '--packages <packages...>',
        'a list of packages to deduplicate. Defaults to all packages.'
    )
    .option('--exclude <exclude...>', 'a list of packages not to deduplicate.')
    .option('--exclude-scopes <excluded scopes...>', 'a list of scopes not to deduplicate.')
    .option('--print', 'instead of saving the deduplicated yarn.lock, print the result in stdout')
    .option(
        '--includePrerelease',
        'Include prereleases in version comparisons, e.g. ^1.0.0 will be satisfied by 1.0.1-alpha'
    );

commander.parse(process.argv);

const {
    strategy,
    scopes,
    packages,
    exclude,
    excludeScopes,
    list,
    fail,
    includePrerelease,
    print,
    noStats,
} = commander.opts();

const file = commander.args.length ? commander.args[0] : 'yarn.lock';

if (scopes && packages) {
    console.error('Please specify either scopes or packages, not both.');
    commander.help();
}

if (strategy !== 'highest' && strategy !== 'fewer') {
    console.error(`Invalid strategy ${strategy}`);
    commander.help();
}

try {
    const yarnLock = fs.readFileSync(file, 'utf8');
    const useMostCommon = strategy === 'fewer';

    if (list) {
        const duplicates = listDuplicates(yarnLock, {
            useMostCommon,
            includeScopes: scopes,
            includePackages: packages,
            excludePackages: exclude,
            excludeScopes: excludeScopes,
            includePrerelease: includePrerelease,
        });
        duplicates.forEach((logLine) => console.log(logLine));
        if (fail && duplicates.length > 0) {
            console.error(FAIL_MESSAGE);
            process.exit(1);
        }
    } else {
        let dedupedYarnLock = fixDuplicates(yarnLock, {
            useMostCommon,
            includeScopes: scopes,
            includePackages: packages,
            excludePackages: exclude,
            excludeScopes: excludeScopes,
            includePrerelease: includePrerelease,
        });

        if (print) {
            console.log(dedupedYarnLock);
        } else {
            const eolMatch = yarnLock.match(/(\r?\n)/);
            if (eolMatch && eolMatch[0] === '\r\n') {
                dedupedYarnLock = dedupedYarnLock.replace(/\n/g, '\r\n');
            }
            fs.writeFileSync(file, dedupedYarnLock);
        }

        if (fail && yarnLock !== dedupedYarnLock) {
            console.error(FAIL_MESSAGE);
            process.exit(1);
        }
    }

    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
