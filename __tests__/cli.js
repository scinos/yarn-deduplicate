const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFile = promisify(childProcess.execFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const cliFilePath = path.join(__dirname, '../cli.js');
const fixturesPath = path.join(__dirname, '../__fixtures__');
const yarnLockFilePath = path.join(fixturesPath, 'yarn.lock');

test('prints duplicates', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--list',
        yarnLockFilePath,
    ]);
    expect(stdout).toMatch(/^.+\n$/);
    expect(stderr).toBe('');
});

test('fails if given the fail option', async () => {
    const listProc = await childProcess.spawn(process.execPath, [
        cliFilePath,
        '--list',
        '--fail',
        yarnLockFilePath,
    ]);
    listProc.on('close', code => {
        expect(code).toBe(1);
    });

    const execProc = await childProcess.spawn(process.execPath, [
        cliFilePath,
        '--print',
        '--fail',
        yarnLockFilePath,
    ]);
    execProc.on('close', code => {
        expect(code).toBe(1);
    });
});

test('does not fail without the fail option', async () => {
    const listProc = await childProcess.spawn(process.execPath, [
        cliFilePath,
        '--list',
        yarnLockFilePath,
    ]);
    listProc.on('close', code => {
        expect(code).toBe(0);
    });

    const execProc = await childProcess.spawn(process.execPath, [
        cliFilePath,
        '--print',
        yarnLockFilePath,
    ]);
    execProc.on('close', code => {
        expect(code).toBe(0);
    });
});

test('prints fixed yarn.lock', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--print',
        yarnLockFilePath,
    ]);
    expect(stdout).not.toContain('lodash@>=1.0.0:');
    expect(stdout).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
    expect(stderr).toBe('');
});

test('prints fixed yarn.lock when listing lodash package', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--print',
        '--packages',
        'lodash',
        yarnLockFilePath,
    ]);
    expect(stdout).not.toContain('lodash@>=1.0.0:');
    expect(stdout).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
    expect(stderr).toBe('');
});

test('prints same yarn.lock when listing missing package', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--print',
        '--packages',
        'foo',
        yarnLockFilePath,
    ]);
    expect(stdout).toContain('lodash@>=1.0.0:');
    expect(stdout).not.toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
    expect(stderr).toBe('');
});

test('prints fixed yarn.lock when excluding lodash', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--print',
        '--exclude',
        'lodash',
        yarnLockFilePath,
    ]);
    expect(stdout).toContain('lodash@>=1.0.0:');
    expect(stdout).toContain('lodash@>=2.0.0:');
    expect(stdout).not.toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
    expect(stderr).toBe('');
});

test('edits yarn.lock and replaces its content with the fixed version', async () => {
    const oldFileContent = await readFile(yarnLockFilePath, 'utf8');
    try {
        const { stdout, stderr } = await execFile(process.execPath, [
            cliFilePath,
            yarnLockFilePath,
        ]);
        const newFileContent = await readFile(yarnLockFilePath, 'utf8');
        expect(oldFileContent).not.toBe(newFileContent);
        expect(oldFileContent).toContain('lodash@>=1.0.0:');
        expect(oldFileContent).not.toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
        expect(newFileContent).not.toContain('lodash@>=1.0.0:');
        expect(newFileContent).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
        expect(stdout).toBe('');
        expect(stderr).toBe('');
    } finally {
        await writeFile(yarnLockFilePath, oldFileContent, 'utf8');
    }
});

test('edits yarn.lock and replaces its content with the fixed version without specifying yarn.lock path', async () => {
    const oldFileContent = await readFile(yarnLockFilePath, 'utf8');
    try {
        const { stdout, stderr } = await execFile(process.execPath, [cliFilePath], {
            cwd: fixturesPath,
        });
        const newFileContent = await readFile(yarnLockFilePath, 'utf8');
        expect(oldFileContent).not.toBe(newFileContent);
        expect(oldFileContent).toContain('lodash@>=1.0.0:');
        expect(oldFileContent).not.toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
        expect(newFileContent).not.toContain('lodash@>=1.0.0:');
        expect(newFileContent).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
        expect(stdout).toBe('');
        expect(stderr).toBe('');
    } finally {
        await writeFile(yarnLockFilePath, oldFileContent, 'utf8');
    }
});

test('line endings are retained', async () => {
    const oldFileContent = await readFile(yarnLockFilePath, 'utf8');
    try {
        const { stdout, stderr } = await execFile(process.execPath, [
            cliFilePath,
            yarnLockFilePath,
        ]);
        const newFileContent = await readFile(yarnLockFilePath, 'utf8');
        const oldEol = oldFileContent.match(/(\r?\n)/)[0];
        const newEol = newFileContent.match(/(\r?\n)/)[0];
        expect(newEol).toBe(oldEol);
    } finally {
        await writeFile(yarnLockFilePath, oldFileContent, 'utf8');
    }
});

test('uses fewer strategy', async () => {
    const { stdout, stderr } = await execFile(process.execPath, [
        cliFilePath,
        '--print',
        '-s',
        'fewer',
        yarnLockFilePath,
    ]);
    expect(stdout).not.toContain('library@>=1.0.0:');
    expect(stdout).toContain('library@>=1.0.0, library@>=1.1.0, library@^2.0.0:');
    expect(stdout).toContain('resolved "https://example.net/library@^2.1.0"');
    expect(stderr).toBe('');
});
