import * as t from 'io-ts'

import { Context } from 'probot'

import * as util from './util'

export function getContent(bot: Context, path: string, ref: string): Promise<IGetContentResponse> {
  return bot.github.repos
    .getContents(bot.repo({ path, ref }))
    .then(payload => util.fromEither(GetContentResponse.decode(payload)))
}

// --- Model

const Content = t.exact(
  t.type({
    name: t.string,
    path: t.string,
    sha: t.string,
    size: t.number,
    type: t.string,
    content: t.string,
    encoding: t.string,
  }),
)

export const GetContentResponse = t.exact(
  t.type({
    data: Content,
  }),
)

export type IGetContentResponse = t.TypeOf<typeof GetContentResponse>
