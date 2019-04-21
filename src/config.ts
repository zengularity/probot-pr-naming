import { Context } from 'probot' // eslint-disable-line no-unused-vars

import * as t from 'io-ts'
import { none, some, Option } from 'fp-ts/lib/Option'

import * as util from './util'
import * as gh from './github'

import dc from './resources/pr-naming.json'

// --- Model

export const Expression = t.union([t.string, t.array(t.string)])

export const MustMatchOnly = t.exact(
  t.type({
    mustMatch: Expression,
    mustNotMatch: t.undefined,
  }),
)

export const MustNotMatchOnly = t.exact(
  t.type({
    mustMatch: t.undefined,
    mustNotMatch: Expression,
  }),
)

export const FullyQualified = t.exact(
  t.type({
    mustMatch: Expression,
    mustNotMatch: Expression,
  }),
)

export const Config = t.union([MustMatchOnly, MustNotMatchOnly, FullyQualified])

export type IConfig = t.TypeOf<typeof Config>

export const DefaultConfig: IConfig = dc as IConfig

type Enc =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'latin1'
  | 'binary'
  | 'hex'
  | undefined

// --- Utilities

function getFromJson(bot: Context, path: string, ref: string): Promise<{}> {
  bot.log(`getContent(${path} @ ${ref})`)

  return gh.getContent(bot, path, ref).then(resp => {
    const buff = Buffer.from(resp.data.content, resp.data.encoding as Enc)

    return JSON.parse(buff.toString('ascii'))
  })
}

export function getConfig(bot: Context, ref: string): Promise<IConfig> {
  return getFromJson(bot, '.github/pr-naming.json', ref).then(
    json => util.fromEither(Config.decode(json)),
    _err => DefaultConfig,
  )
}

// ---

/**
 * @return none if `input` matches the `config`, or some error message
 */
export function match(input: string, config: IConfig): Option<string> {
  const mustMatch: ReadonlyArray<string> = !config.mustMatch
    ? []
    : config.mustMatch instanceof Array
    ? (config.mustMatch as Array<string>)
    : [config.mustMatch.toString()]

  const matchIdx = mustMatch.findIndex(re => !!input.match(re))

  if (matchIdx < 0) {
    return some(`must match ${mustMatch.join(', ')}`)
  }

  // ---

  const mustNotMatch: ReadonlyArray<string> = !config.mustNotMatch
    ? []
    : config.mustNotMatch instanceof Array
    ? (config.mustNotMatch as Array<string>)
    : [config.mustNotMatch.toString()]

  const notIdx = mustNotMatch.findIndex(re => !!input.match(re))

  return notIdx < 0 ? none : some(`must not match ${mustNotMatch.join(', ')}`)
}
