import { Context } from 'probot';
import * as t from 'io-ts';
import { Option } from 'fp-ts/lib/Option';
export declare const Expression: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
export declare const MustMatchOnly: t.ExactC<t.TypeC<{
    mustMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
    mustNotMatch: t.UndefinedC;
}>>;
export declare const MustNotMatchOnly: t.ExactC<t.TypeC<{
    mustMatch: t.UndefinedC;
    mustNotMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
}>>;
export declare const FullyQualified: t.ExactC<t.TypeC<{
    mustMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
    mustNotMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
}>>;
export declare const Config: t.UnionC<[t.ExactC<t.TypeC<{
    mustMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
    mustNotMatch: t.UndefinedC;
}>>, t.ExactC<t.TypeC<{
    mustMatch: t.UndefinedC;
    mustNotMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
}>>, t.ExactC<t.TypeC<{
    mustMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
    mustNotMatch: t.UnionC<[t.StringC, t.ArrayC<t.StringC>]>;
}>>]>;
export declare type IConfig = t.TypeOf<typeof Config>;
export declare const DefaultConfig: IConfig;
export declare function getConfig(bot: Context, ref: string): Promise<IConfig>;
/**
 * @return none if `input` matches the `config`, or some error message
 */
export declare function match(input: string, config: IConfig): Option<string>;
