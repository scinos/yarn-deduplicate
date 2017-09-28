const fs = require('fs')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver');

const FILE = '../jira-frontend/yarn.lock';

module.exports = (data) => {
    const json = lockfile.parse(data).object;

    const packages={};
    const result = [];
    const re = /^(.*)@([^@]*?)$/;

    Object.entries(json).forEach(([name, package]) => {
        const [_, packageName, requestedVersion] = name.match(re);
        packages[packageName] = packages[packageName] || [];
        packages[packageName].push(Object.assign({}, {
            name,
            package,
            packageName,
            requestedVersion
        }));
    });

    Object.entries(packages).forEach(([name, packages]) => {
        const versions = packages
            .map(p => p.package.version)

        packages.forEach(p => {
            const targetVersion = semver.maxSatisfying(versions, p.requestedVersion);
            if (targetVersion === null) return;
            if (targetVersion !== p.package.version) {
                const dedupedPackage = packages.find( p => p.package.version === targetVersion);
                json[`${name}@${p.requestedVersion}`] = dedupedPackage.package;
            }
        })
    });

    return lockfile.stringify(json);
}

