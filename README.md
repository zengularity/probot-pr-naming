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

[![CircleCI](https://circleci.com/gh/zengularity/probot-pr-naming.svg?style=svg)](https://circleci.com/gh/zengularity/probot-pr-naming)

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

## Contributing

If you have suggestions for how pr-naming could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Zengularity (https://github.com/zengularity/probot-pr-naming)
