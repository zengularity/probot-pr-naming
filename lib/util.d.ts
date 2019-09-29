import { either } from 'fp-ts';
import * as t from 'io-ts';
export declare function fromEither<T>(e: either.Either<t.Errors, T>): Promise<T>;
