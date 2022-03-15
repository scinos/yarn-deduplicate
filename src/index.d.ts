export declare function listDuplicates(yarnLock: string, { includePackages, useMostCommon }: {
    includePackages?: string[];
    useMostCommon?: boolean;
}): string[];
export declare function fixDuplicates(yarnLock: string, { includePackages, useMostCommon }?: {
    includePackages?: string[];
    useMostCommon?: boolean;
}): string;
