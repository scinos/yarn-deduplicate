const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const cliFilePath = path.join(__dirname, '../cli.js');
const yarnLockFilePath = path.join(__dirname, '../__fixtures__/yarn.lock');

test('prints duplicates', async () => {
  const { stdout, stderr } = await exec(`${cliFilePath} --list ${yarnLockFilePath}`);
  expect(stdout).toMatch(/^.+\n$/);
  expect(stderr).toBe('');
});

test('prints fixed yarn.lock', async () => {
  const { stdout, stderr } = await exec(`${cliFilePath} --print ${yarnLockFilePath}`);
  expect(stdout).not.toContain('lodash@>=1.0.0:');
  expect(stdout).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
  expect(stderr).toBe('');
});

test('prints fixed yarn.lock when listing lodash package', async () => {
  const { stdout, stderr } = await exec(`${cliFilePath} --print --packages lodash ${yarnLockFilePath}`);
  expect(stdout).not.toContain('lodash@>=1.0.0:');
  expect(stdout).toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
  expect(stderr).toBe('');
});

test('prints same yarn.lock when listing missing package', async () => {
  const { stdout, stderr } = await exec(`${cliFilePath} --print --packages foo ${yarnLockFilePath}`);
  expect(stdout).toContain('lodash@>=1.0.0:');
  expect(stdout).not.toContain('lodash@>=1.0.0, lodash@>=2.0.0:');
  expect(stderr).toBe('');
});

test('edits yarn.lock and replaces its content with the fixed version', async () => {
  const oldFileContent = await readFile(yarnLockFilePath, 'utf8');
  try {
    const { stdout, stderr } = await exec(`${cliFilePath} ${yarnLockFilePath}`);
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
