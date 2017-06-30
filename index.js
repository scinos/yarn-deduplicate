const commander = require('commander')

const listDupes = require('./modules/list-dupes');
const fixDupes = require('./modules/fix-dupes');

commander
    .command('list-dupes <file>')
    .description('List duplicated packages in a yarn.lock file')
    .action(async (file) => {
        const lines = await listDupes(file);
        lines.forEach(line => {
            console.log(line);
        });
        process.exit(0);
    });

commander
    .command('fix-dupes <file>')
    .description('Fix duplicated packages in a yarn.lock file')
    .action(async (file) => {
        const fixedFile = await fixDupes(file);
        console.log(fixedFile);
        process.exit(0);
    });

commander.parse(process.argv);

