#!/usr/bin/env node

const commander = require('commander');
const fs = require('fs');

const {fixDuplicates, listDuplicates} = require('./index');
const version = require('./package.json').version;

commander
    .version(version)
    .usage('[options] <yarn.lock path>')
    .option('-s, --strategy <strategy>', 'deduplication strategy. Valid values: fewer, highest. Default is "highest"', /^(fewer|highest)$/i, 'highest')
    .option('-l, --list', 'do not change yarn.lock, just output the diagnosis')
    .option('--packages <packages>', 'a comma separated list of packages to dedupe. Defauls to all packages.', val => val.split(',').map(v => v.trim()))
    .option('--print', 'instead of saving the deduped yarn.lock, print the result in stdout')
commander.parse(process.argv);
if (!commander.args.length) commander.help();

const file = commander.args[0];

try {
    const yarnLock = fs.readFileSync(file, 'utf8');

    if (commander.list) {
        listDuplicates(yarnLock,{
            useMostCommon: commander.mostCommon,
            includePackages: commander.packages,
        }).forEach(logLine => console.log(logLine))
    }else {
        const dedupedYarnLock = fixDuplicates(yarnLock,{
            useMostCommon: commander.mostCommon,
            includePackages: commander.packages,
        });

        if (commander.print) {
            console.log(dedupedYarnLock);
        } else {
            fs.writeFileSync(file, dedupedYarnLock);
        }
    }

    process.exit(0);
} catch(e) {
    console.error(e);
    process.exit(1);
}
