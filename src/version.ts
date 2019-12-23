import * as semver from 'semver'

export function isSemVer(version: string): boolean {
  return semver.valid(version) !== null
}

export function isPrerelease(version: string): boolean {
  return semver.prerelease(version) !== null
}

export function removePrefix(version: string): string {
  const parsedVersion = semver.valid(version)
  return parsedVersion ? parsedVersion : version
}
