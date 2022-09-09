import * as lockfile from '@yarnpkg/lockfile';
import semver from 'semver';

type PackageJson = {
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
    optionalDependencies?: Record<string, string>
}

type YarnEntry = {
    resolved: string
    version: string
}

type YarnEntries = Record<string,YarnEntry>;

type Packages = Record<string, Package[]>;

type Package = {
    installedVersion:string,
    name: string,
    pkg: YarnEntry,
    satisfiedBy: Set<string>
    candidateVersions?: string[],
    requestedVersion: string,
    bestVersion?: string,
    versions: Versions
}

type Version = {
    pkg: YarnEntry,
    isDirectDependency: boolean,
    satisfies: Set<Package>
}

type Versions = Map<string, Version>;

export type Strategy = 'highest' | 'fewer' | 'direct';

type Options = {
    packageJson?: string | null;
    includeScopes?: string[];
    includePackages?: string[];
    excludePackages?: string[];
    excludeScopes?: string[];
    strategy?: Strategy;
    includePrerelease?: boolean;
}

const getDirectDependencies = (file: string | null): Set<string> => {
    const result = new Set<string>();
    if (file === null) {
        return result;
    }

    const packageJson = JSON.parse(file) as PackageJson;
    for (const [packageName, requestedVersion] of Object.entries(packageJson.dependencies ?? {})) {
        result.add(`${packageName}@${requestedVersion}`);
    }
    for (const [packageName, requestedVersion] of Object.entries(packageJson.devDependencies ?? {})) {
        result.add(`${packageName}@${requestedVersion}`);
    }
    for (const [packageName, requestedVersion] of Object.entries(packageJson.optionalDependencies ?? {})) {
        result.add(`${packageName}@${requestedVersion}`);
    }
    return result;
}

const parseYarnLock = (file:string) => lockfile.parse(file).object as YarnEntries;

const extractPackages = (
    yarnEntries: YarnEntries,
    includeScopes:string[] = [],
    includePackages:string[] = [],
    excludePackages:string[] = [],
    excludeScopes:string[] = []
): Packages => {
    const packages: Packages = {};
    const re = /^(.*)@([^@]*?)$/;

    for (const [entryName, entry] of Object.entries(yarnEntries)) {
        const match = entryName.match(re);

        let packageName:string, requestedVersion:string;
        // TODO: make this ignore other urls like:
        //      git...
        //      user/repo
        //      tag
        //      path/path/path
        if (match) {
            [, packageName, requestedVersion] = match;
        } else {
            // If there is no match, it means there is no version specified. According to the doc
            // this means "*" (https://docs.npmjs.com/files/package.json#dependencies)
            packageName = entryName;
            requestedVersion = '*';
        }

        // If there is a list of scopes, only process those.
        if (
            includeScopes.length > 0 &&
            !includeScopes.find((scope) => packageName.startsWith(`${scope}/`))
        ) {
            continue;
        }

        if (
            excludeScopes.length > 0 &&
            excludeScopes.find((scope) => packageName.startsWith(`${scope}/`))
        ) {
            continue;
        }

        // If there is a list of package names, only process those.
        if (includePackages.length > 0 && !includePackages.includes(packageName)) continue;

        if (excludePackages.length > 0 && excludePackages.includes(packageName)) continue;

        packages[packageName] = packages[packageName] || [];
        packages[packageName].push({
            pkg: entry,
            name: packageName,
            requestedVersion,
            installedVersion: entry.version,
            satisfiedBy: new Set(),
            versions: new Map()
        });
    };
    return packages;
};

const computePackageInstances = (
    packages: Packages,
    name: string,
    strategy: Strategy,
    directDependencies: Set<string>,
    includePrerelease = false,
): Package[] => {
    // Instances of this package in the tree
    const packageInstances = packages[name];

    // Extract the list of unique versions for this package
    const versions:Versions = new Map();
    for (const packageInstance of packageInstances) {
        // Mark candidates which have at least one requested version matching a
        // direct dependency as direct
        const isDirectDependency = directDependencies.has(`${name}@${packageInstance.requestedVersion}`);
        if (versions.has(packageInstance.installedVersion)) {
            const existingPackage = versions.get(packageInstance.installedVersion)!;
            existingPackage.isDirectDependency ||= isDirectDependency;
        } else {
            versions.set(packageInstance.installedVersion, {
                pkg: packageInstance.pkg,
                satisfies: new Set(),
                isDirectDependency,
            });
        }
    }

    // Link each package instance with all the versions it could satisfy.
    for (const [version, {satisfies}] of versions) {
        packageInstances.forEach((packageInstance) => {
            // We can assume that the installed version always satisfied the requested version.
            packageInstance.satisfiedBy.add(packageInstance.installedVersion);
            // In some cases the requested version is invalid form a semver point of view (for
            // example `sinon@next`). Just ignore those cases, they won't get deduped.
            if (
                semver.validRange(packageInstance.requestedVersion, { includePrerelease }) &&
                semver.satisfies(version, packageInstance.requestedVersion, { includePrerelease })
            ) {
                satisfies.add(packageInstance);
                packageInstance.satisfiedBy.add(version);
            }
        });
    };

    // Sort the list of satisfied versions
    packageInstances.forEach((packageInstance) => {
        // Save all versions for future reference
        packageInstance.versions = versions;

        // Compute the versions that actually satisfy this instance
        packageInstance.candidateVersions = Array.from(packageInstance.satisfiedBy);
        packageInstance.candidateVersions.sort((versionA:string, versionB:string) => {
            if (strategy === 'direct') {
                // Sort versions that are specified in package.json first. In
                // case of a tie, use the highest version.
                const isDirectA = versions.get(versionA)!.isDirectDependency;
                const isDirectB = versions.get(versionB)!.isDirectDependency;
                if (isDirectA && !isDirectB) return -1;
                if (!isDirectB && isDirectA) return 1;
            }
            if (strategy === 'fewer') {
                // Sort verions based on how many packages it satisfies. In case of a tie, put the
                // highest version first.
                const satisfiesA = (versions.get(versionA) as Version).satisfies;
                const satisfiesB = (versions.get(versionB) as Version).satisfies;
                if (satisfiesB.size > satisfiesA.size) return 1;
                if (satisfiesB.size < satisfiesA.size) return -1;
            }
            return semver.rcompare(versionA, versionB);
        });

        // The best package is always the first one in the list thanks to the sorting above.
        packageInstance.bestVersion = packageInstance.candidateVersions[0];
    });

    return packageInstances;
};

export const getDuplicates = (
    yarnEntries: YarnEntries,
    {
        packageJson = null,
        includeScopes = [],
        includePackages = [],
        excludePackages = [],
        excludeScopes = [],
        strategy = 'highest',
        includePrerelease = false,
    }: Options = {}
): Package[] => {
    const packages = extractPackages(
        yarnEntries,
        includeScopes,
        includePackages,
        excludePackages,
        excludeScopes
    );

    const directDependencies = getDirectDependencies(packageJson);

    return Object.keys(packages)
        .reduce(
            (acc:Package[], name) =>
                acc.concat(
                    computePackageInstances(packages, name, strategy, directDependencies, includePrerelease)
                ),
            []
        )
        .filter(({ bestVersion, installedVersion }) => bestVersion !== installedVersion);
};

export const listDuplicates = (yarnLock:string, options: Options = {}): string[] => {
    const packages = getDuplicates(parseYarnLock(yarnLock), options);
    const result = packages.map(({ bestVersion, name, installedVersion, requestedVersion }) => {
        return `Package "${name}" wants ${requestedVersion} and could get ${bestVersion}, but got ${installedVersion}`;
    });
    return result;
};

export const fixDuplicates = ( yarnLock: string, options: Options = {} ) => {
    const json = parseYarnLock(yarnLock);
    const duplicatedPackages = getDuplicates(json, options);

    for (const duplicatedPackage of duplicatedPackages) {
        const { bestVersion, name, versions, requestedVersion } = duplicatedPackage;
        json[`${name}@${requestedVersion}`] = (versions.get((bestVersion as string)) as Version).pkg;
    }

    return lockfile.stringify(json);
};
