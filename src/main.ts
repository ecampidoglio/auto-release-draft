import * as core from '@actions/core'
import * as event from './event'
import * as version from './version'
import * as git from './git'

export async function run(): Promise<void> {
  try {
    const tag = event.getCreatedTag()

    if (tag && version.isSemVer(tag)) {
      const changelog = await git.getChangesIntroducedByTag(tag)

      core.debug(`Detected changelog:\n${changelog}`)
    }

    core.setOutput('release-url', 'https://example.com')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
