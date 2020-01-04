import * as core from '@actions/core'
import * as event from '../src/event'
import * as version from '../src/version'
import * as git from '../src/git'
import * as github from '../src/github'
import {when} from 'jest-when'
import {run} from '../src/main'

jest.mock('@actions/core')
jest.mock('../src/event')
jest.mock('../src/version')
jest.mock('../src/git')
jest.mock('../src/github')

describe('When running the action with a created version tag event', () => {
  const fakeGetCreatedTag = event.getCreatedTag as jest.MockedFunction<typeof event.getCreatedTag>
  const fakeIsSemVer = version.isSemVer as jest.MockedFunction<typeof version.isSemVer>
  const fakeGetChanges = git.getChangesIntroducedByTag as jest.MockedFunction<typeof git.getChangesIntroducedByTag>
  const fakeGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>
  const fakeCreateRelease = github.createReleaseDraft as jest.MockedFunction<typeof github.createReleaseDraft>
  const fakeSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>

  beforeAll(() => {
    fakeGetCreatedTag.mockReturnValue('v1.0.0')
    when(fakeIsSemVer)
      .calledWith('v1.0.0')
      .mockReturnValue(true)
    when(fakeGetChanges)
      .calledWith('v1.0.0')
      .mockReturnValue(Promise.resolve('changelog'))
    when(fakeGetInput)
      .calledWith('repo-token')
      .mockReturnValue('the-token')
    when(fakeCreateRelease)
      .calledWith('v1.0.0', 'the-token', 'changelog')
      .mockReturnValue(Promise.resolve('http://release'))
  })

  beforeEach(async () => {
    await run()
  })

  test('it should create a release draft for the created version tag', () => {
    expect(fakeCreateRelease).toHaveBeenCalledWith('v1.0.0', 'the-token', 'changelog')
  })

  test('it should set the created release URL as output parameter', () => {
    expect(fakeSetOutput).toHaveBeenCalledWith('release-url', 'http://release')
  })
})

describe('When running the action with another kind of event', () => {
  const fakeGetCreatedTag = event.getCreatedTag as jest.MockedFunction<typeof event.getCreatedTag>
  const fakeCreateRelease = github.createReleaseDraft as jest.MockedFunction<typeof github.createReleaseDraft>
  const fakeSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>

  beforeAll(() => {
    fakeGetCreatedTag.mockReturnValue(null)
  })

  beforeEach(async () => {
    await run()
  })

  test('it should not create any release draft', () => {
    expect(fakeCreateRelease).not.toHaveBeenCalled()
  })

  test('it should set the release-url output parameter to an empty string', () => {
    expect(fakeSetOutput).toHaveBeenCalledWith('release-url', '')
  })
})

describe('When running the action with a tag created event that does not conform to SemVer', () => {
  const fakeGetCreatedTag = event.getCreatedTag as jest.MockedFunction<typeof event.getCreatedTag>
  const fakeIsSemVer = version.isSemVer as jest.MockedFunction<typeof version.isSemVer>
  const fakeCreateRelease = github.createReleaseDraft as jest.MockedFunction<typeof github.createReleaseDraft>
  const fakeSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>

  beforeAll(() => {
    fakeGetCreatedTag.mockReturnValue('1.0')
    when(fakeIsSemVer)
      .calledWith('1.0')
      .mockReturnValue(false)
  })

  beforeEach(async () => {
    await run()
  })

  test('it should not create any release draft', () => {
    expect(fakeCreateRelease).not.toHaveBeenCalled()
  })

  test('it should set the release-url output parameter to an empty string', () => {
    expect(fakeSetOutput).toHaveBeenCalledWith('release-url', '')
  })
})

describe('When creating a release draft fails', () => {
  const fakeIsSemVer = version.isSemVer as jest.MockedFunction<typeof version.isSemVer>
  const fakeCreateRelease = github.createReleaseDraft as jest.MockedFunction<typeof github.createReleaseDraft>
  const fakeSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>
  const fakeSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>

  beforeAll(() => {
    fakeIsSemVer.mockReturnValue(true)
    fakeCreateRelease.mockImplementation(() => {
      throw new Error('Failed to create the release')
    })
  })

  beforeEach(async () => {
    await run()
  })

  test('it should set the action status to failed with the error message', () => {
    expect(fakeSetFailed).toHaveBeenCalledWith('Failed to create the release')
  })

  test('it should not set the release-url output parameter', () => {
    expect(fakeSetOutput).not.toHaveBeenCalledWith('release-output', expect.anything())
  })
})
