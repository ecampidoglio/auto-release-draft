# Auto Release Draft

A GitHub action that automatically drafts a GitHub release based on a newly created version tag.

The commit messages between the created version tag and the one that came before it will become the release notes.

Here's an example. Let's assume the history of your repository looks like this:

```
    ┌────┐      ╔════╗
    │ v1 │      ║ v2 ║           # Release Notes
    └────┘      ╚════╝
       │           │     ━━━━▶   - D
       ▼           ▼             - C
 A ─ ─ B ─ ─ C ─ ─ D
```

Here, `v2` is the last created version tag. When `auto-release-draft` runs, it will draft a release with the commit messages for `C` and `D` as the release notes.

If the created version tag is the first one in the repository, then all commit messages from the beginning of the repository's history will be included in the release notes:

```
                ╔════╗           # Release Notes
                ║ v1 ║
                ╚════╝           - D
                   │     ━━━━▶   - C
                   ▼             - B
 A ─ ─ B ─ ─ C ─ ─ D             - A
```

In this case, the release notes will contain the messages for `A`, `B`, `C` and `D`.

A version tag is an [annotated tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging#_annotated_tags) whose name starts with the prefix `v` followed by one or more characters. This means `v1`, `v.1`, `v1.0.0` and `v1.0.0-beta1` are all valid version tags. If you don't know which versioning scheme to adopt for your project, [Semantic Versioning](https://semver.org) is a very good choice.

## Inputs

### `repo-token`

**(Required)** The `GITHUB_TOKEN` used to access the current repository from the GitHub REST API.

## Outputs

### `release-url`

The URL of the GitHub release that was drafted. Defaults to an empty string.

## Usage

Here's an example of a workflow that listens for the `create` event and automatically creates a release draft with the commit messages as release notes. It also prints the URL of the release page to the build log.

```yaml
name: Test
on:
  create:
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Create a release draft for a version tag
        id: create-release-draft
        uses: ecampidoglio/auto-release-draft@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Print the URL of the release draft
        if: steps.create-release-draft.outputs.release-url != ''
        run: echo ${{ steps.create-release-draft.outputs.release-url }}
```
