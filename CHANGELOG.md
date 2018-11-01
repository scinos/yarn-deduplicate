# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
