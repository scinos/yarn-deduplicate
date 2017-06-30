# Yarn tools

Collection of tools to work with yarn repositories

--- 
## list-dupes

### Descirption
Inspect a `yarn.lock` file looking for modules that can be de-duplicated. See `fix-dupes` to automatically fix those duplicated packages.

### Command
`list-dupes <yarn.lock file>`

* `<yarn.lock file>`: path to yarn.lock file, relative to index.js

### Example

```
 └▸ node index.js list-dupes ../my-project/yarn.lock

Package "supports-color" wants ^3.1.0 and could get 3.2.3, but got 3.1.2
Package "supports-color" wants ^3.1.1 and could get 3.2.3, but got 3.1.2
Package "supports-color" wants ^3.1.2 and could get 3.2.3, but got 3.1.2
```

--- 

## fix-dupes

### Descirption
Fixes duplicates packages in a `yarn.lock` file.

### Command
`fix-dupes <yarn.lock file>`

* `<yarn.lock file>`: path to yarn.lock file, relative to index.js

### Example

```
 └▸ node index.js fix-dupes ../my-project/yarn.lock > fixed-yarn.lock
```