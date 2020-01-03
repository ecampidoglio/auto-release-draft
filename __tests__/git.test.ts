import {exec} from '@actions/exec'
import {when} from 'jest-when'
import * as git from '../src/git'

jest.mock('@actions/core')
jest.mock('@actions/exec')

describe('When getting the changes introduced by the first tag', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining([
          'describe',
          '--match',
          'v[0-9]*',
          '--abbrev=0',
          '--first-parent',
          'v1.0.0^'
        ]),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from('fatal: No tags'))
        return Promise.resolve(128) // This is what Git returns when no tags are found
      })

    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining(['log', '--format=%s', 'v1.0.0']),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' First commit\nSecond commit '))
        return Promise.resolve(0)
      })
  })

  test('it should return the commit messages introduced by that first tag', async () => {
    expect(await git.getChangesIntroducedByTag('v1.0.0')).toBe('First commit\nSecond commit')
  })
})

describe('When getting the changes introduced by the second tag', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining([
          'describe',
          '--match',
          'v[0-9]*',
          '--abbrev=0',
          '--first-parent',
          'v2.0.0^'
        ]),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' v1.0.0 '))
        return Promise.resolve(0)
      })

    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining(['log', '--format=%s', 'v1.0.0..v2.0.0']),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' Third commit '))
        return Promise.resolve(0)
      })
  })

  test('it should return the commit messages introduced by the second tag', async () => {
    expect(await git.getChangesIntroducedByTag('v2.0.0')).toBe('Third commit')
  })
})

describe('When getting a previous version tag from a specific one', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining([
          'describe',
          '--match',
          'v[0-9]*',
          '--abbrev=0',
          '--first-parent',
          'v2.0.0^'
        ]),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' v1.0.0 '))
        return Promise.resolve(0)
      })
  })

  test('it should return the previous tag name without spaces before or after', async () => {
    expect(await git.getPreviousVersionTag('v2.0.0')).toBe('v1.0.0')
  })
})

describe('When getting a previous version tag from the first one', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining([
          'describe',
          '--match',
          'v[0-9]*',
          '--abbrev=0',
          '--first-parent',
          'v1.0.0^'
        ]),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from('fatal: No tags'))
        return Promise.resolve(128) // This is what Git returns when no tags are found
      })
  })

  test('it should return null', async () => {
    expect(await git.getPreviousVersionTag('v1.0.0')).toBeNull()
  })
})

describe('When getting the commit messages reachable from one reference', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining(['log', '--format=%s', 'v2.0.0']),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' First commit\nSecond commit '))
        return Promise.resolve(0)
      })
  })

  test('it should return the commit messages from that reference without spaces before or after', async () => {
    expect(await git.getCommitMessagesFrom('v2.0.0')).toBe('First commit\nSecond commit')
  })
})

describe('When getting the commit messages reachable between two references', () => {
  const fakeExec = exec as jest.MockedFunction<typeof exec>

  beforeAll(() => {
    when(fakeExec)
      .calledWith(
        'git',
        expect.arrayContaining(['log', '--format=%s', 'v1.0.0..v2.0.0']),
        expect.anything()
      )
      .mockImplementation(async (_command, _args, options) => {
        options?.listeners?.stdout?.call(options, Buffer.from(' Second commit '))
        return Promise.resolve(0)
      })
  })

  test('it should return the commit messages between those references without spaces before or after', async () => {
    expect(await git.getCommitMessagesBetween('v1.0.0', 'v2.0.0')).toBe('Second commit')
  })
})
