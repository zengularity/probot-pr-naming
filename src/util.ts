import { either } from 'fp-ts'
import * as t from 'io-ts'

export function fromEither<T>(e: either.Either<t.Errors, T>): Promise<T> {
  return e.fold(
    cause => Promise.reject(new Error(JSON.stringify(cause))),
    res => Promise.resolve(res),
  )
}
