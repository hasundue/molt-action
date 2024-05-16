# 🦕 molt-action

> [!WARNING]\
> Not released yet.

A GitHub Action to update dependencies in Deno projects with
[molt](https://github.com/hasundue/molt).

## Usage

```yaml
- uses: actions/checkout@v4

- uses: hasundue/molt-action@v1
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
| `base`            | Base branch for the pull request.                                                                                        | `${{ github.ref }}`                                                                                         |
| `branch`          | Head branch for the pull request.                                                                                        | `molt-action`                                                                                               |
| `commit`          | Whether to commit changes locally.                                                                                       | `true`                                                                                                      |
| `commit-prefix`   | Prefix for commit messages.                                                                                              | `chore:`                                                                                                    |
| `committer`       | Name of the committer in the format of `Display Name <email@address.com>`                                                | `github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>`                               |
| `draft`           | Whether to create a draft pull request.                                                                                  | `false`                                                                                                     |
| `labels`          | Comma or newline-separated list of labels to add to the pull request.                                                    | `dependencies`                                                                                              |
| `pull-request`    | Whether to create a pull request.                                                                                        | `true`                                                                                                      |
| `resolve-imports` | Resolve local imports to find dependencies recursively.                                                                  | `false`                                                                                                     |
| `root`            | Root directory of the relevant source files.                                                                             | The shallowest directory containing `deno.json` or `deno.jsonc` if available, otherwise the repository root |
| `script`          | Specifier of the main script.                                                                                            | `jsr:@molt/action@1.0.0-rc.1`                                                                               |
| `source`          | Glob patterns to match source files.                                                                                     | `deno.json{,c}` if available with imports, otherwise `**/*.ts`                                              |
| `token`           | GitHub token with permissions `contents: write` and `pull-requests: write` or a repo scoped personal access token (PAT). | `${{ secrets.GITHUB_TOKEN }}`                                                                               |
