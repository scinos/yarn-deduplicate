#!/usr/bin/env node

const commander = require('commander')
const fs = require('fs')
const promisify = require('util').promisify;

const listDuplicates = require('./modules/list-duplicates');
const fixDuplicates = require('./modules/fix-duplicates');
const readFile = promisify(fs.readFile);

commander
    .command('list-duplicates <file>')
    .description('List duplicated packages in a yarn.lock file')
    .action(async (file) => {
        try {
            const data = await readFile(file, 'utf8');
            const lines = await listDuplicates(data);
            lines.forEach(line => console.log(line));
            process.exit(0);
        } catch(e) {
            console.error(e);
            process.exit(1);
        }
    });

commander
    .command('fix-duplicates <file>')
    .description('Fix duplicated packages in a yarn.lock file')
    .action(async (file) => {
        try {
            const data = await readFile(file, 'utf8');
            const fixedFile = await fixDuplicates(data);
            console.log(fixedFile);
            process.exit(0);
        } catch(e) {
            console.error(e);
            process.exit(1);
        }
    });

commander
    .command('*', '', {noHelp: true, isDefault: true})
    .action(function(env){
        commander.help();
    });

commander.parse(process.argv);
if (!commander.args.length) commander.help();

