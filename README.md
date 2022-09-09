# yarn-deduplicate

Cleans up `yarn.lock` by removing duplicates.

Builds:
[![Node.js CI](https://github.com/scinos/yarn-deduplicate/actions/workflows/node.js.yml/badge.svg)](https://github.com/scinos/yarn-deduplicate/actions/workflows/node.js.yml)

This package only works with Yarn v1. Yarn v2 supports package deduplication
[natively](https://github.com/yarnpkg/berry/pull/1558)!

A duplicate package is when two dependencies are resolved to a different version, even when a single
version matches the range specified in the dependencies. See the
[Deduplication strategies](#deduplication-strategies) section for a few examples.

## Installation

Install the package globally:

```sh
npm install -g yarn-deduplicate
```

or

```sh
yarn global add yarn-deduplicate
```

This package also works wth
[npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b), so you
don't need to install it.

---

## Usage

The most common scenario is to run

```sh
yarn-deduplicate yarn.lock
```

This will use the default strategy to remove duplicated packages in `yarn.lock`.

If you do not specify the yarn.lock path, it defaults to `yarn.lock`.

Check all available options with:

```sh
yarn-deduplicate --help
```

---

## Duplicated packages

`yarn.lock` contains a list of all the dependencies required by your project (including transitive
dependencies), and the actual package version installed to satisfy those dependencies.

For the context of this project, a "duplicated package" is a package that appears on multiple nodes
of the dependency tree with overlapping version ranges but resolved to different versions.

For example, imagine that your project directly depends on `lodash` and `babel`, and `babel` depends
on `lodash` as well. Specifically, your project depends on `lodash@^1.0.0` and `babel` depends on
`lodash@^1.1.0`. Because how the resolution algorithm works in Yarn, you might end up with two
different copies of `lodash` (for example, version `1.0.1` and `1.2.0`) in your project, even when
`1.2.0` will suffice to satisfy both requirements for `lodash`. That's a "duplicated package".

It is important to note that we do not consider duplicated packages when the version ranges don't
overlap. For example, if your project depends on `underscore@^1.0.0` and `underscore@^2.0.0`. Your
project will end up with two versions of `underscore`, and `yarn-deduplicate` won't change that.

When using `yarn-deduplicate` remember that **it will change your dependency tree**. There are
certain code paths that now will run with a different set of dependencies. It is highly recommended
that you review each change to `yarn.lock`. If the change is too big, use the flag `--packages` to
deduplicate them gradually.

### Why is this necessary?

Yarn documentation seems to suggest this package shouldn't be necessary. For example, in
https://classic.yarnpkg.com/en/docs/cli/dedupe/, it says

> The dedupe command isn’t necessary. `yarn install` will already dedupe.

This is, however, not exactly true. There are cases where yarn will _not_ deduplicate existing
packages. For example, this scenario:

- Install `libA`. It depends on `libB ^1.1.0`. At this point, the latest version of `libB` is
  `1.1.2`, so it gets installed as a transitive dependency in your repo

- After a few days, install `libC`. It also depends on `libB ^1.1.0`. But this time, the latest
  `libB` version is `1.1.3`.

In the above scenario, you'll end up with `libB@1.1.2` and `libB@1.1.3` in your repo.

Find more examples in:

- [yarn-deduplicate — The Hero We Need](https://medium.com/@bnaya/yarn-deduplicate-the-hero-we-need-f4497a362128)
- [De-duplicating yarn.lock](https://medium.com/@scinos/de-duplicating-yarn-lock-ae30be4aa41a)
- https://github.com/yarnpkg/yarn/issues/3778

### Deduplication strategies

`--strategy <strategy>`

`highest` will try to use the highest installed version. For example, with the following
`yarn.lock`:

```text
library@^1.1.0:
  version "1.2.0"

library@^1.2.0:
  version "1.2.0"

library@^1.3.0:
  version "1.3.0"
```

It will deduplicate `library@^1.1.0` and `library@^1.2.0` to `1.3.0`

`fewer` will try to minimize the number of installed versions by trying to deduplicate to the
version that satisfies most of the ranges first. For example, with the following `yarn.lock`:

```text
library@*:
  version "2.0.0"

library@>=1.1.0:
  version "3.0.0"

library@^1.2.0:
  version "1.2.0"
```

It will deduplicate `library@*` and `library@>=1.1.0` to `1.2.0`.

Note that this may cause some packages to be **downgraded**. Be sure to check the changelogs between
all versions and understand the consequences of that downgrade. If unsure, don't use this strategy.

`direct` will prioritize dependencies specified in `package.json` but will use the highest version
otherwise. For example, with the following `yarn.lock`:

```text
library@*:
  version "2.0.0"

library@^1.2.0:
  version "1.2.0"

other@*:
  version "2.0.0"

other@^1.3.0:
  version "1.3.0"
```

and `package.json`:
```
{
  "dependencies": {
    "library": "^1.2.0",
    ...
  },
}
```

It will deduplicate `library@*` to `1.2.0` but keep `other@^1.3.0` as is.

It is not recommended to use different strategies for different packages. There is no guarantee that
the strategy will be honored in subsequent runs of `yarn-deduplicate` unless the same set of flags
is specified again.

### Progressive deduplication

`--packages <package1> <package2> <packageN>`

Receives a list of packages to deduplicate. It will ignore any other duplicated package not in the
list. This option is recommended when the number of duplicated packages in `yarn.lock` is too big to
be easily reviewed by a human. This will allow for a more controlled and progressive deduplication
of `yarn.lock`.

`--scopes <scope1> <scope2> <scopeN>`

Receives a list of scopes to deduplicate. It will ignore any other duplicated package not in the
list. This option is recommended when deduplicating a large number of inter-dependent packages from
a single scope, such as @babel. This will allow for a more controlled and progressive deduplication
of `yarn.lock` without specifying each package individually.

### Excluding packages

`--exclude <package1> <package2> <packageN`

`--exclude-scopes <scope1> <scope2> <scopeN>`

With these commands you can exclude certain packages/scopes from the deduplication process. This is
specially useful if you want to apply a different strategy for a scope, for example.

### Pre-release versions

By default, `yarn-deduplicate` will only match pre-release versions if they share they share the
same `major`, `minor` and `patch` versions (example: `^1.2.3-alpha.1` and `1.2.3-alpha.2` can be
deduplicated, but `^1.2.3` and `1.2.4-alpha.1` can't). This matches the behaviour of
[semver](https://docs.npmjs.com/misc/semver#prerelease-tags).

To change this behaviour you can use the flag `--includePrerelease`. This will treat all pre-release
versionas as if they were normal versions (`^1.2.3` and `1.2.4-alpha.1` can be deduplicated).

### Usage in CI

This tool can be used as part of a CI workflow. Adding the flag `--fail` will force the process to
exit with status 1 if there are duplicated packages. Example:

```sh
# Print the list of duplicated packages and exit with status 1
yarn-deduplicate --list --fail

# Deduplicate yarn.lock and exit with status 1 if changes were required
yarn-deduplicate --fail
```

---

## Migration guide

### From 2.x to 3.x

In this version we have adopted variadic arguments from commander.js. These are the equivalent
commands:

```sh
#Old
yarn-deduplicate --packages libA,libB
yarn-deduplicate --scopes @scopeA,@scopeB
yarn-deduplicate --exclude libA,libB

#New
yarn-deduplicate --packages libA libB
yarn-deduplicate --scopes @scopeA @scopeB
yarn-deduplicate --exclude libA libB
```

A consequence of this change is that if you were using one or more of the affected options (
`--packages`, `--scopes` or `--exclude`) **and** a custom path for `yarn.lock`, you need to use `--`
to "stop" package/scope/exclude parsing:

```sh
yarn-deduplicate --packages libA libB -- path/to/yarn.lock
```

### From 0.x to 1.x

In this version we have renamed the project and refactored the CLI. These are the equivalent
commands:

#### Installation

```sh
# Old
npm install -g yarn-tools

# New
npm install -g yarn-deduplicate
```

#### List duplicates

```sh
# Old
yarn-tools list-duplicates path/to/yarn.lock

# New
yarn-deduplicate --list path/to/yarn.lock
```

### Deduplicate yarn.lock

```sh
# Old
yarn-tools fix-duplicates path/to/yarn.lock > tmp
mv tmp path/to/yarn.lock

# New
yarn-deduplicate path/to/yarn.lock
```

### Limit packages to deduplicate yarn.lock

```sh
# Old
yarn-tools fix-duplicates path/to/yarn.lock package1 package2


# New
yarn-deduplicate --packages package1,package2 path/to/yarn.lock
```

## License

Copyright (c) 2022 Sergio Cinos and others. Apache 2.0 licensed, see [LICENSE.txt](LICENSE.txt)
file.
