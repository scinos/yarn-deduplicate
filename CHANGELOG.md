# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project
adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Chores

- Re-release 5.0.1, it's missing from NPM 🤷
- Update Yarn to v3.2.2 (#170)
- Update dependency @release-it/keep-a-changelog to ^3.1.0 (#172)
- Update dependency commander to ^9.4.0 (#166)
- Update dependency release-it to ^15.3.0 (#167)
- Update dependency @types/semver to ^7.3.12 (#171)
- Update babel monorepo to ^7.18.10 (#169)
- Update jest monorepo (#164)
- Update dependency eslint-plugin-jest to ^26.8.2 (#165)
- Update dependency eslint to ^8.22.0 (#168)

## [5.0.1] - 2022-07-05

### Chores

- Update all transitive dependencies
- Adds Node 18 to the test matix (#154)
- Update Yarn to v3.2.1 (#148)
- Update dependency release-it to v15 (#162)
- Update dependency @release-it/keep-a-changelog to v3 (#161)
- Update dependency prettier to ^2.7.1 (#160)
- Update dependency release-it to ^14.14.3 (#157)
- Update dependency commander to ^9.3.0 (#158)
- Update dependency eslint-plugin-prettier to ^4.2.1 (#159)
- Update dependency semver to ^7.3.7 (#114)
- Update dependency tslib to ^2.4.0 (#149)
- Update dependency eslint to ^8.19.0 (#150)
- Update babel monorepo to ^7.18.6 (#156)
- Update dependency eslint-plugin-jest to ^26.5.3 (#151)
- Update dependency @tsconfig/node12 to ^1.0.11 (#155)
- Update jest monorepo to v28 (major) (#152)
- Update dependency typescript to ^4.7.4 (#153)

## [5.0.0] - 2022-04-23

### Breaking

- Migration to TypeScript. This is a breacking changes because previously we provided TypeScript
  types, and those have changed. If you were not using the exported types, this change should be
  transparent for you.

### Chores

- Configured which files goes into npm package
- Updated dependencies

## [4.0.0] - 2022-03-21

### Breaking

- Dropped support for Node 10

### Added

- Added `--exclude-scopes` flag to exclude scopes (thanks to @sventschui)
- Documented `--exclude` flags in `README.md`
- Added support for Node 16

### Fixed

- Fixed typo in documentation (thanks to @ChetanGoti)
- Updated repository information in `package.json`
- Do not publish test files

### Chores

- Updated dependencies
- Rename some directories/files
- Addded `typescript` 4.6.2 (via peer dependency)

## 3.1.0 - 2020-10-25

### Chores

- Updated dependency `jest` to 26.6.1
- Updated `yarn` to 1.22.10 (via policy)
- Updated `eslint-config-prettier` to 6.14.0
- Updated `prettier` to 2.1.2
- Updated `eslint-plugin-jest` to 24.1.0
- Updated `eslint` to 7.12.0
- Prettify and fix typos in README.md (thanks to @friederbluemle)

### Added

- Added flag to include pre-release versions in the deduplication process. (thanks to @marcodejongh)

## 3.0.0- 2020-10-29

### Breaking

#### Variadic flags

Flags `--packages`, `--scopes` and `--exclude` don't support comma-separated values anymore (eg:
`--packages libA,libB`). Instead, you can pass multiple values per flag (eg: `--packages libA libB`)
or pass the flag multiple times (eg: `--packages libA --packages libB`).

If you use one of those flags _and_ you want to specify a custom `yarn.lock` file, you need to use
`--` to separate the arg. Example `--packages libA -- ../project/yarn.lock`

### Chores

- Updated Commander to 6.1.0
- Updated eslint to 7.7.0
- Updated yarn to 1.22.5
- Updated prettier to 2.1.1
- Updated jest to 26.4.2
- Updated eslint-plugin-jest to 23.20.0

## 2.1.0- 2020-07-10

### Chores

- Updated dependencies
- Move from CircleCI to GitHub actions
- Clean up and dedupe `yarn.lock`

### Added

- Option `--scopes` to limit changes to a list of scopes (thanks to @sgomes)
- Improve documentation for `--strategy` (thanks to @KubaJastrz)
- Clean up .npmignore (thanks to @bluelovers)

## 2.0.0- 2020-02-29

### Breaks

- Drop support for Node < 10

## 1.2.0- 2020-02-29

Edit: _Do not use. It breaks Node 8 compatiblity. Use 2.0.0 instead_

### Added

- TypeScript definitions (thanks to @bluelovers)
- Info about the source of duplication to README
- CLI option to exclude packages (thanks to @JacobBlomgren)
- Updated a bunch of dependencies

## 1.1.1- 2019-02-03

### Fixed

- Fixed typos in doc and CLI (thanks to @ActuallyACat and @Alonski)
- Moved yarn from `peerDependencies` to `engines`

## 1.1.0- 2018-12-22

### Added

- Option `--fail` to exit the process with an error if there are duplicated packages (thanks to
  @amark)
- If the path to `yarn.lock` is not specified, use `yarn.lock` as the default (thanks to @Joge97)

## 1.0.5- 2018-12-15

### Changed

- Support for Node 6 (thanks @leipert)

### Chores

- Moved eslint and stricter to devDependencies (thanks @hawkrives)
- Re-enabled disabled tests (thanks @amark)

## 1.0.4- 2018-12-12

### Changed

- Fixes parsing the strategy. Now specifying `-s fewer` actually does something! (thanks to
  @leipert)

### Chores

- Added eslint and prettier to keep the code consistent

## 1.0.3- 2018-11-22

### Changed

- Retain Windows end-of-line (thanks to @Shingyx)

## 1.0.2- 2018-11-02

### Chores

- Added `homepage` to package.json

## 1.0.1- 2018-11-02

### Chores

- Removed unused files (tests, local `.history`) from the npm package. Only `*.js` and text files
  are included now.

## 1.0.0- 2018-10-31

### Breaking

- Renamed project from `yarn-tools` to `yarn-deduplicate`
- CLI unification (see Migration to 1.0 guide)
- Save changes back to `yarn.lock` by default (thanks to @felipemsantana)

### Added

- Added an option to specify the strategy when deduping files
- Support for packages without the `@<version>` part
- Support for non-semver versions, like `<package>@next`

### Changed

- Do not change the order of integrity field (thanks to @lukebatchelor)

### Chores

- Added support to CircleCI (thanks to @lukebatchelor)
- Moved repo from BitBucket to GitHub
- Bumped `@yarnpkg/lockfile` to 1.1.0 (thanks to @lukebatchelor)
- Added 'dedupe' as package keyword (thanks to @gfx)

## 0.4.1- 2018-06-05

### Changed

- Use yarn ^1.0.0 and converted it to a peerDependency (thanks to @bj00rn)
- Remove deprecated `preferGlobal` in package.json (thanks to bjorn@binovi.se)

## 0.4.0- 2018-01-18

### Added

- Restrict the list of packages to de-dupe on the command line.
- This file.
- Added AUTHORS.
- Cleaned Markdown files.

[unreleased]: https://github.com/scinos/yarn-deduplicate/compare/v5.0.1...HEAD
[5.0.1]: https://github.com/scinos/yarn-deduplicate/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/scinos/yarn-deduplicate/compare/v4.0.0...v5.0.0
