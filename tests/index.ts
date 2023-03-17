import { fixDuplicates, listDuplicates } from '../src/index';
import * as lockfile from '@yarnpkg/lockfile';
import outdent from 'outdent';

test('dedupes lockfile to max compatible version', () => {
    const yarn_lock = outdent`
    library@^1.1.0:
      version "1.2.0"
      resolved "https://example.net/library@^1.1.0"

    library@^1.2.0:
      version "1.2.0"
      resolved "https://example.net/library@^1.2.0"

    library@^1.3.0:
      version "1.3.0"
      resolved "https://example.net/library@^1.3.0"
    `;
    const deduped = fixDuplicates(yarn_lock);
    const json = lockfile.parse(deduped).object;

    expect(json['library@^1.1.0']['version']).toEqual('1.3.0');
    expect(json['library@^1.2.0']['version']).toEqual('1.3.0');
    expect(json['library@^1.3.0']['version']).toEqual('1.3.0');

    const list = listDuplicates(yarn_lock, {});

    expect(list).toContain('Package "library" wants ^1.2.0 and could get 1.3.0, but got 1.2.0');
    expect(list).toContain('Package "library" wants ^1.1.0 and could get 1.3.0, but got 1.2.0');
});

test('dedupes lockfile to most common compatible version', () => {
    const yarn_lock = outdent`
    library@>=1.0.0:
      version "3.0.0"
      resolved "https://example.net/library@^3.0.0"

    library@>=1.1.0:
      version "3.0.0"
      resolved "https://example.net/library@^3.0.0"

    library@^2.0.0:
      version "2.1.0"
      resolved "https://example.net/library@^2.1.0"
  `;
    const deduped = fixDuplicates(yarn_lock, {
        useMostCommon: true,
    });
    const json = lockfile.parse(deduped).object;

    expect(json['library@>=1.0.0']['version']).toEqual('2.1.0');
    expect(json['library@>=1.1.0']['version']).toEqual('2.1.0');
    expect(json['library@^2.0.0']['version']).toEqual('2.1.0');

    const list = listDuplicates(yarn_lock, {
        useMostCommon: true,
    });

    expect(list).toContain('Package "library" wants >=1.0.0 and could get 2.1.0, but got 3.0.0');
    expect(list).toContain('Package "library" wants >=1.1.0 and could get 2.1.0, but got 3.0.0');
});

test('limits the scopes to be de-duplicated', () => {
    const yarn_lock = outdent`
    "@a-scope/a-package@^2.0.0":
      version "2.0.0"
      resolved "http://example.com/a-scope/a-package/2.1.0"

    "@a-scope/a-package@^2.0.1":
      version "2.0.1"
      resolved "http://example.com/a-scope/a-package/2.2.0"

    "@another-scope/a-package@^1.0.0":
      version "1.0.11"
      resolved "http://example.com/another-scope/a-package/1.0.0"

    "@another-scope/a-package@^1.0.1":
      version "1.0.12"
      resolved "http://example.com/another-scope/a-package/1.0.0"
  `;

    const deduped = fixDuplicates(yarn_lock, {
        includeScopes: ['@another-scope'],
    });
    const json = lockfile.parse(deduped).object;

    expect(json['@a-scope/a-package@^2.0.0']['version']).toEqual('2.0.0');
    expect(json['@a-scope/a-package@^2.0.1']['version']).toEqual('2.0.1');
    expect(json['@another-scope/a-package@^1.0.0']['version']).toEqual('1.0.12');
    expect(json['@another-scope/a-package@^1.0.1']['version']).toEqual('1.0.12');

    const list = listDuplicates(yarn_lock, {
        includeScopes: ['@another-scope'],
    });

    expect(list).toHaveLength(1);
    expect(list).toContain(
        'Package "@another-scope/a-package" wants ^1.0.0 and could get 1.0.12, but got 1.0.11'
    );
});

test('excludes scopes to be de-duplicated', () => {
    const yarn_lock = outdent`
    "@a-scope/package@^2.0.0":
      version "2.0.0"
      resolved "http://example.com/@a-scope/package/2.1.0"

    "@a-scope/package@^2.0.1":
      version "2.0.1"
      resolved "http://example.com/@a-scope/package/2.2.0"

    "@other-scope/package@^1.0.0":
      version "1.0.11"
      resolved "http://example.com/@other-scope/package/1.0.0"

    "@other-scope/package@^1.0.1":
      version "1.0.12"
      resolved "http://example.com/@other-package/package/1.0.0"
  `;

    const deduped = fixDuplicates(yarn_lock, {
        excludeScopes: ['@a-scope'],
    });
    const json = lockfile.parse(deduped).object;

    expect(json).toHaveProperty(['@a-scope/package@^2.0.0', 'version'], '2.0.0');
    expect(json).toHaveProperty(['@a-scope/package@^2.0.1', 'version'], '2.0.1');
    expect(json).toHaveProperty(['@other-scope/package@^1.0.0', 'version'], '1.0.12');
    expect(json).toHaveProperty(['@other-scope/package@^1.0.1', 'version'], '1.0.12');

    const list = listDuplicates(yarn_lock, {
        excludeScopes: ['@a-scope'],
    });

    expect(list).toHaveLength(1);
    expect(list).toContain(
        'Package "@other-scope/package" wants ^1.0.0 and could get 1.0.12, but got 1.0.11'
    );
});

test('includePrerelease options dedupes to the prerelease', () => {
    const yarn_lock = outdent`
  typescript@^4.1.0-beta:
    version "4.1.0-beta"
    resolved "https://registry.yarnpkg.com/typescript/-/typescript-4.1.0-beta.tgz#e4d054035d253b7a37bdc077dd71706508573e69"
    integrity sha512-b/LAttdVl3G6FEmnMkDsK0xvfvaftXpSKrjXn+OVCRqrwz5WD/6QJOiN+dTorqDY+hkaH+r2gP5wI1jBDmdQ7A==

  typescript@^4.0.3:
    version "4.0.3"
    resolved "https://packages.atlassian.com/api/npm/npm-remote/typescript/-/typescript-4.0.3.tgz#153bbd468ef07725c1df9c77e8b453f8d36abba5"
    integrity sha1-FTu9Ro7wdyXB35x36LRT+NNqu6U=

`;

    const deduped = fixDuplicates(yarn_lock, {
        includePrerelease: true,
    });
    const json = lockfile.parse(deduped).object;

    expect(json['typescript@^4.0.3']['version']).toEqual('4.1.0-beta');
    expect(json['typescript@^4.1.0-beta']['version']).toEqual('4.1.0-beta');

    const list = listDuplicates(yarn_lock, {
        includePrerelease: true,
    });

    expect(list).toHaveLength(1);
    expect(list).toContain(
        'Package "typescript" wants ^4.0.3 and could get 4.1.0-beta, but got 4.0.3'
    );
});

test('limits the packages to be de-duplicated', () => {
    const yarn_lock = outdent`
    a-package@^2.0.0:
      version "2.0.0"
      resolved "http://example.com/a-package/2.1.0"

    a-package@^2.0.1:
      version "2.0.1"
      resolved "http://example.com/a-package/2.2.0"

    other-package@^1.0.0:
      version "1.0.11"
      resolved "http://example.com/other-package/1.0.0"

    other-package@^1.0.1:
      version "1.0.12"
      resolved "http://example.com/other-package/1.0.0"
  `;

    const deduped = fixDuplicates(yarn_lock, {
        includePackages: ['other-package'],
    });
    const json = lockfile.parse(deduped).object;

    expect(json['a-package@^2.0.0']['version']).toEqual('2.0.0');
    expect(json['a-package@^2.0.1']['version']).toEqual('2.0.1');
    expect(json['other-package@^1.0.0']['version']).toEqual('1.0.12');
    expect(json['other-package@^1.0.1']['version']).toEqual('1.0.12');

    const list = listDuplicates(yarn_lock, {
        includePackages: ['other-package'],
    });

    expect(list).toHaveLength(1);
    expect(list).toContain(
        'Package "other-package" wants ^1.0.0 and could get 1.0.12, but got 1.0.11'
    );
});

test('excludes packages to be de-duplicated', () => {
    const yarn_lock = outdent`
    a-package@^2.0.0:
      version "2.0.0"
      resolved "http://example.com/a-package/2.1.0"

    a-package@^2.0.1:
      version "2.0.1"
      resolved "http://example.com/a-package/2.2.0"

    other-package@^1.0.0:
      version "1.0.11"
      resolved "http://example.com/other-package/1.0.0"

    other-package@^1.0.1:
      version "1.0.12"
      resolved "http://example.com/other-package/1.0.0"
  `;

    const deduped = fixDuplicates(yarn_lock, {
        excludePackages: ['a-package'],
    });
    const json = lockfile.parse(deduped).object;

    expect(json['a-package@^2.0.0']['version']).toEqual('2.0.0');
    expect(json['a-package@^2.0.1']['version']).toEqual('2.0.1');
    expect(json['other-package@^1.0.0']['version']).toEqual('1.0.12');
    expect(json['other-package@^1.0.1']['version']).toEqual('1.0.12');

    const list = listDuplicates(yarn_lock, {
        excludePackages: ['a-package'],
    });

    expect(list).toHaveLength(1);
    expect(list).toContain(
        'Package "other-package" wants ^1.0.0 and could get 1.0.12, but got 1.0.11'
    );
});

test('should support the integrity field if present', () => {
    const yarn_lock = outdent({ trimTrailingNewline: false })`
    # THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
    # yarn lockfile v1


    a-package@^2.0.0:
      version "2.0.1"
      resolved "http://example.com/a-package/2.0.1"
      integrity sha512-ptqFDzemkXGMf7ylch/bCV+XTDvVjD9dRymzcjOPIxg8Hqt/uesOye10GXItFbsxJx9VZeJBYrR8FFTauu+hHg==
      dependencies:
        a-second-package "^2.0.0"

    a-second-package@^2.0.0:
      version "2.0.1"
      resolved "http://example.com/a-second-package/2.0.1"
      integrity sha512-ptqFDzemkXGMf7ylch/bCV+XTDvVjD9dRymzcjOPIxg8Hqt/uesOye10GXItFbsxJx9VZeJBYrR8FFTauu+hHg==
  `;

    const deduped = fixDuplicates(yarn_lock);

    // We should not have made any change to the order of outputted lines (@yarnpkg/lockfile 1.0.0 had this bug)
    expect(yarn_lock).toBe(deduped);
});

test('dedupes lockfile to join multiple dependencies with different version property', () => {
    const yarn_lock = outdent`
schema-utils@^3.0.0:
  version "3.0.0"

schema-utils@^3.1.0:
  version "3.1.0"

schema-utils@^3.1.1:
  version "3.1.1"
    `;
    const deduped = fixDuplicates(yarn_lock);

    expect(deduped).toBe(outdent`
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


schema-utils@^3.0.0, schema-utils@^3.1.0, schema-utils@^3.1.1:
  version "3.1.1"

    `);
});

test('dedupes lockfile to join multiple dependencies with same version property', () => {
    const yarn_lock = outdent`
schema-utils@^3.0.0:
  version "3.1.1"

schema-utils@^3.1.0:
  version "3.1.1"

schema-utils@^3.1.1:
  version "3.1.1"
    `;
    const deduped = fixDuplicates(yarn_lock);

    expect(deduped).toBe(outdent`
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


schema-utils@^3.0.0, schema-utils@^3.1.0, schema-utils@^3.1.1:
  version "3.1.1"

    `);
});
