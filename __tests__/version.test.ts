import * as version from '../src/version'

describe('When determining whether a version is a prerelease', () => {
  test('it should return true for versions with a prerelease tag', () => {
    expect(version.isPrerelease('1.0.0-preview')).toBe(true)
  })

  test('it should return false for versions without a prerelease tag', () => {
    expect(version.isPrerelease('1.0.0')).toBe(false)
  })

  test('it should return false for versions with a build metadata tag', () => {
    expect(version.isPrerelease('1.0.0+build.1')).toBe(false)
  })
})

describe('When determining whether a version conforms to SemVer', () => {
  test('it should return true for a valid SemVer version', () => {
    expect(version.isSemVer('1.0.0')).toBe(true)
  })

  test('it should return true for a valid SemVer version prefixed with v', () => {
    expect(version.isSemVer('v1.0.0')).toBe(true)
  })

  test('it should return false for an incomplete SemVer version', () => {
    expect(version.isSemVer('1.0')).toBe(false)
  })

  test('it should return false for an empty version', () => {
    expect(version.isSemVer('')).toBe(false)
  })
})

describe('When removing the v prefix from a SemVer version number', () => {
  test('it should return just the SemVer version', () => {
    expect(version.removePrefix('v1.0.0')).toBe('1.0.0')
  })

  test('it should return the original value for an invalid SemVer version', () => {
    expect(version.removePrefix('v1.0')).toBe('v1.0')
  })

  test('it should return the original value for any other prefix', () => {
    expect(version.removePrefix('z1.0.0')).toBe('z1.0.0')
  })
})
