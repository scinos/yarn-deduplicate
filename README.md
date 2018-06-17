# Yarn tools

Collection of tools to work with yarn-based repositories.

## Installation

Install the package globally:

```bash
npm install -g yarn-dedupe
```

or

```bash
yarn global add yarn-dedupe
```

---

## Usage

### list-duplicates

#### Description

Inspect a `yarn.lock` file looking for modules that can be de-duplicated. See `fix-duplicates` to automatically fix those duplicated packages.

#### Command

`list-duplicates <yarn.lock file>`

* `<yarn.lock file>`: path to yarn.lock file, relative to index.js

#### Example

```bash
$ list-duplicates my-project/yarn.lock

Package "supports-color" wants ^3.1.0 and could get 3.2.3, but got 3.1.2
Package "supports-color" wants ^3.1.1 and could get 3.2.3, but got 3.1.2
Package "supports-color" wants ^3.1.2 and could get 3.2.3, but got 3.1.2
```

---

### fix-duplicates

#### Description

Fixes duplicates packages in a `yarn.lock` file.

After running this command, you should run `yarn` again. This will cleanup orphan packages in your
`yarn.lock` file.

#### Command

`fix-duplicates <yarn.lock file> [packages]`

* `<yarn.lock file>`: path to yarn.lock file, relative to index.js

#### Example

```bash
# De-duplicate all packages
$ yarn-dedupe fix-duplicates my-project/yarn.lock > fixed-yarn.lock

# Only de-duplicate lodash and babel
$ yarn-dedupe fix-duplicates my-project/yarn.lock lodash babel > fixed-yarn.lock
```

## Contributors

Pull requests, issues and comments welcome. For pull requests:

* Add tests for new features and bug fixes
* Follow the existing style
* Separate unrelated changes into multiple pull requests

See the existing issues for things to start contributing.

For bigger changes, make sure you start a discussion first by creating
an issue and explaining the intended change.

Atlassian requires contributors to sign a Contributor License Agreement,
known as a CLA. This serves as a record stating that the contributor is
entitled to contribute the code/documentation/translation to the project
and is willing to have it used in distributions and derivative works
(or is willing to transfer ownership).

Prior to accepting your contributions we ask that you please follow the appropriate
link below to digitally sign the CLA. The Corporate CLA is for those who are
contributing as a member of an organization and the individual CLA is for
those contributing as an individual.

* [CLA for corporate contributors](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=e1c17c66-ca4d-4aab-a953-2c231af4a20b)
* [CLA for individuals](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=3f94fbdc-2fbe-46ac-b14c-5d152700ae5d)

## License

Copyright (c) 2017 Atlassian and others.
Apache 2.0 licensed, see [LICENSE.txt](LICENSE.txt) file.
