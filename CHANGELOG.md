# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2020-02-29

### Added

- Typescript definitions (thanks to @bluelovers)
- Info about the source of duplication to README
- CLI option to exclude packages (thanks to @JacobBlomgren)
- Updated a bunch of dependencies

## [1.1.1] - 2019-02-03

### Fixed

- Fixed typos in doc and CLI (thanks to @ActuallyACat and @Alonski)
- Moved yarn from `peerDependencies` to `engines`

## [1.1.0] - 2018-12-22

### Added

- Option `--fail` to exit the process with an error if there are duplicated packages (thanks to @amark)
- If the path to `yarn.lock` is not specified, use `yarn.lock` as the default (thanks to @Joge97)

## [1.0.5] - 2018-12-15

### Changed

- Support for Node 6 (thanks @leipert)

### Chores

 - Moved eslint and stricter to devDependencies (thanks @hawkrives)
 - Re-enabled disabled tests (thanks @amark)

## [1.0.4] - 2018-12-12

### Changed

- Fixes parsing the strategy. Now specifying `-s fewer` actually does something! (thanks to @leipert)

### Chores

- Added eslint and prettier to keep the code consistent

## [1.0.3] - 2018-11-22

### Changed

- Retain Windows end-of-line (thanks to @Shingyx)

## [1.0.2] - 2018-11-02

### Chores

- Added `homepage` to package.json

## [1.0.1] - 2018-11-02

### Chores

- Removed unused files (tests, local `.history`) from the NPM package. Only `*.js` and
  text files are included now.

## [1.0.0] - 2018-10-31

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

## [0.4.1] - 2018-06-05

### Changed

- Use yarn ^1.0.0 and converted it to a peerDependency (thanks to @bj00rn)
- Remove deprecated `preferGlobal` in package.json (thanks to bjorn@binovi.se)

## [0.4.0] - 2018-01-18

### Added

- Restrict the list of packages to de-dupe on the command line.
- This file.
- Added AUTHORS.
- Cleaned Markdown files.
