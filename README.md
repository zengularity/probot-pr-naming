# pr-naming

> A GitHub App built with [Probot](https://github.com/probot/probot) that check the naming of pull requests

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start
```

[![CircleCI](https://circleci.com/gh/faberNovel/probot-pr-naming.svg?style=svg)](https://circleci.com/gh/faberNovel/probot-pr-naming)

## Configuration

On repository for which the application is installed,
a file named [`pr-naming.json`](./src/resources/pr-naming.json) can be defined on the base (release) branches, in a `.github` directory at root. Default:

```json
{
  "mustMatch": "(.+)"
}
```

- `mustMatch`: one or more [regular expression](https://en.wikipedia.org/wiki/Regular_expression)
- `mustNotMatch`: one or more [regular expression](https://en.wikipedia.org/wiki/Regular_expression)

## GitHub Actions

To use this bot with [GitHub Actions](https://github.com/features/actions), the following workflow can be defined as `.github/workflows/pr-naming.yml` in your repository.

```
name: PR naming
on: [pull_request]

jobs:
  check_pr_naming:
    runs-on: ubuntu-latest
    steps:
      - uses: faberNovel/probot-pr-naming@ghaction-1.0.x
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Alternatives

- [probot-app-pr-title](https://github.com/uber-workflow/probot-app-pr-title)
- [li-boxuan/Regex-Checker](https://github.com/li-boxuan/Regex-Checker)

## Contributing

If you have suggestions for how pr-naming could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Fabernovel (https://github.com/faberNovel/probot-pr-naming)
