"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var t = __importStar(require("io-ts"));
var Option_1 = require("fp-ts/lib/Option");
var util = __importStar(require("./util"));
var gh = __importStar(require("./github"));
var pr_naming_json_1 = __importDefault(require("./resources/pr-naming.json"));
// --- Model
exports.Expression = t.union([t.string, t.array(t.string)]);
exports.MustMatchOnly = t.exact(t.type({
    mustMatch: exports.Expression,
    mustNotMatch: t.undefined,
}));
exports.MustNotMatchOnly = t.exact(t.type({
    mustMatch: t.undefined,
    mustNotMatch: exports.Expression,
}));
exports.FullyQualified = t.exact(t.type({
    mustMatch: exports.Expression,
    mustNotMatch: exports.Expression,
}));
exports.Config = t.union([exports.MustMatchOnly, exports.MustNotMatchOnly, exports.FullyQualified]);
exports.DefaultConfig = pr_naming_json_1.default;
// --- Utilities
function getFromJson(bot, path, ref) {
    bot.log("getContent(" + path + " @ " + ref + ")");
    return gh.getContent(bot, path, ref).then(function (resp) {
        var buff = Buffer.from(resp.data.content, resp.data.encoding);
        return JSON.parse(buff.toString('ascii'));
    });
}
function getConfig(bot, ref) {
    return getFromJson(bot, '.github/pr-naming.json', ref).then(function (json) { return util.fromEither(exports.Config.decode(json)); }, function (_err) { return exports.DefaultConfig; });
}
exports.getConfig = getConfig;
// ---
/**
 * @return none if `input` matches the `config`, or some error message
 */
function match(input, config) {
    var mustMatch = !config.mustMatch
        ? []
        : config.mustMatch instanceof Array
            ? config.mustMatch
            : [config.mustMatch.toString()];
    var matchIdx = mustMatch.findIndex(function (re) { return !!input.match(re); });
    if (matchIdx < 0) {
        return Option_1.some("must match " + mustMatch.join(', '));
    }
    // ---
    var mustNotMatch = !config.mustNotMatch
        ? []
        : config.mustNotMatch instanceof Array
            ? config.mustNotMatch
            : [config.mustNotMatch.toString()];
    var notIdx = mustNotMatch.findIndex(function (re) { return !!input.match(re); });
    return notIdx < 0 ? Option_1.none : Option_1.some("must not match " + mustNotMatch.join(', '));
}
exports.match = match;
//# sourceMappingURL=config.js.map