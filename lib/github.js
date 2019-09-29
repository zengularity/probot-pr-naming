"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var t = __importStar(require("io-ts"));
var util = __importStar(require("./util"));
function getContent(bot, path, ref) {
    return bot.github.repos
        .getContents(bot.repo({ path: path, ref: ref }))
        .then(function (payload) { return util.fromEither(exports.GetContentResponse.decode(payload)); });
}
exports.getContent = getContent;
// --- Model
var Content = t.exact(t.type({
    name: t.string,
    path: t.string,
    sha: t.string,
    size: t.number,
    type: t.string,
    content: t.string,
    encoding: t.string,
}));
exports.GetContentResponse = t.exact(t.type({
    data: Content,
}));
//# sourceMappingURL=github.js.map