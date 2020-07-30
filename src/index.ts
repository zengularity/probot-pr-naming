import { Application, Context } from 'probot'

import * as t from 'io-ts'
import { none, some, Option } from 'fp-ts/lib/Option'

import { fromEither } from './util'
import * as c from './config'

const PullRequestEvent = t.exact(
  t.type({
    pull_request: t.exact(
      t.type({
        number: t.number,
        title: t.string,
        base: t.exact(
          t.type({
            ref: t.string,
          }),
        ),
        head: t.exact(
          t.type({
            sha: t.string,
          }),
        ),
      }),
    ),
  }),
)

const StatusContext = 'pr-naming'

type CommitState = 'success' | 'error' | 'failure' | 'pending'

type StatusData = {
  state: CommitState
  description: string
  targetUrl: Option<string>
}

const successData: StatusData = {
  state: 'success',
  description: 'Everything is alright', // TODO: Config
  targetUrl: none,
}

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async (context) => {
    const event = await fromEither(PullRequestEvent.decode(context.payload))
    const pr = event.pull_request

    context.log(`Updated pull request #${pr.number}`, pr)

    const config = await c.getConfig(context, pr.head.sha)

    context.log.debug('config', config)

    // TODO: Add report as comment (e.g. that pr.title.strip != pr.title)

    const m = c.match(pr.title, config)
    const st = await getCommitState(context, pr.head.sha, StatusContext)

    const toggle: () => Promise<void> = m.fold(
      () => {
        context.log(`Title of pull request #${pr.number} match configuration`)

        // TODO: Config to always set 'success' (false by default)

        return st.exists((s) => s != 'success')
          ? context.github.repos
              .createStatus(
                context.repo({
                  sha: pr.head.sha,
                  context: StatusContext,
                  ...successData,
                }),
              )
              .then((_r) => Promise.resolve())
          : Promise.resolve()
      },
      (msg) => () => {
        context.log(`Title of pull request #${pr.number} doesn't match configuration: ${msg}`, config)

        const repoInfo = context.repo({})
        const htmlUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/tree/${pr.base.ref}/.github/pr-naming.json`

        return st.exists((s) => s == 'error')
          ? Promise.resolve()
          : context.github.repos
              .createStatus(
                context.repo({
                  sha: pr.head.sha,
                  context: StatusContext,
                  state: 'error',
                  description: msg.substring(0, 140),
                  targetUrl: some(htmlUrl),
                }),
              )
              .then((_r) => Promise.resolve())
      },
    )

    await toggle()
  })
}

// --- GitHub integration

function toggleState(bot: Context, sha: string, data: StatusData): Promise<void> {
  return getCommitState(bot, sha, StatusContext).then((state) => {
    const alreadySet = state.filter((s) => s == data.state)

    if (!alreadySet) {
      return Promise.resolve()
    } else {
      return bot.github.repos
        .createStatus(
          bot.repo({
            sha: sha,
            context: StatusContext,
            target_url: data.targetUrl.toUndefined(),
            ...data,
          }),
        )
        .then((_r) => Promise.resolve())
    }
  })
}

function getCommitState(bot: Context, ref: string, ctx: string): Promise<Option<string>> {
  return bot.github.repos.listStatusesForRef(bot.repo({ ref })).then((resp) => {
    const found = resp.data.find((s) => s.context == ctx)

    if (!found) {
      return Promise.resolve(none)
    } else {
      return Promise.resolve(some(found.state))
    }
  })
}
