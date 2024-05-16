# 🦕 molt-action

> [!WARNING]\
> Not released yet. You may try the `v1-rc` tag, but it is not guaranteed to
> work.

A GitHub Action to update dependencies in Deno projects with
[molt](https://github.com/hasundue/molt).

## Example

![image](https://github.com/hasundue/molt-action/assets/309723/92246a9c-c86a-4dee-bef8-468ae8ac448d)

## Usage

```yaml
runs-on: ubuntu-latest

steps:
    - uses: actions/checkout@v4

    - uses: hasundue/molt-action@v1-rc
      with:
        # optional inputs
```

### Inputs

All inputs are **optional**. If not set, sensible defaults will be used. Many of
them are inherited from
[peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request)
and passed through to it.

| Name              | Description                                                                                                              | Default                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `author`          | Author of the pull request in the format of `Display Name <email@adress.com>`.                                           | `${{ github.actor }} <${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com>`                 |
| `base`            | Base branch to create the pull request against.                                                                          | The branch checked out in the workflow                                                                      |
| `branch`          | Head branch to create the pull request from.                                                                             | `molt-action`                                                                                               |
| `commit`          | Whether to commit changes locally.                                                                                       | `true`                                                                                                      |
| `commit-prefix`   | Prefix for commit messages.                                                                                              | `chore:`                                                                                                    |
| `committer`       | Name of the committer in the format of `Display Name <email@address.com>`                                                | `github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>`                               |
| `draft`           | Whether to create a draft pull request.                                                                                  | `false`                                                                                                     |
| `labels`          | Comma or newline-separated list of labels to add to the pull request.                                                    | `dependencies`                                                                                              |
| `pull-request`    | Whether to create a pull request.                                                                                        | `true`                                                                                                      |
| `resolve-imports` | Resolve local imports to find dependencies recursively.                                                                  | `false`                                                                                                     |
| `root`            | Root directory of the relevant source files.                                                                             | The shallowest directory containing `deno.json` or `deno.jsonc` if available, otherwise the repository root |
| `source`          | Glob patterns to match source files.                                                                                     | `deno.json{,c}` if available with imports, otherwise `**/*.ts`                                              |
| `token`           | GitHub token with permissions `contents: write` and `pull-requests: write` or a repo scoped personal access token (PAT). | `${{ secrets.GITHUB_TOKEN }}`                                                                               |
