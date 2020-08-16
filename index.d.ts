export declare function listDuplicates(
    yarnLock: string,
    {
        includeScopes = [],
        includePackages = [],
        excludePackages = [],
        useMostCommon = false,
    }?: {
        includeScopes?: string[];
        includePackages?: string[];
        excludePackages?: string[];
        useMostCommon?: boolean;
    }
): string[];

export declare function fixDuplicates(
    yarnLock: string,
    {
        includeScopes = [],
        includePackages = [],
        excludePackages = [],
        useMostCommon = false,
    }?: {
        includeScopes?: string[];
        includePackages?: string[];
        excludePackages?: string[];
        useMostCommon?: boolean;
    }
): string;
