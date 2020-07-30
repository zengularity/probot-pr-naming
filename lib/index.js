"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var t = __importStar(require("io-ts"));
var Option_1 = require("fp-ts/lib/Option");
var util_1 = require("./util");
var c = __importStar(require("./config"));
var PullRequestEvent = t.exact(t.type({
    pull_request: t.exact(t.type({
        number: t.number,
        title: t.string,
        base: t.exact(t.type({
            ref: t.string,
        })),
        head: t.exact(t.type({
            sha: t.string,
        })),
    })),
}));
var StatusContext = 'pr-naming';
var successData = {
    state: 'success',
    description: 'Everything is alright',
    targetUrl: Option_1.none,
};
// --- GitHub integration
function toggleState(bot, sha, data) {
    return getCommitState(bot, sha, StatusContext).then(function (state) {
        var alreadySet = state.filter(function (s) { return s == data.state; });
        if (!alreadySet) {
            return Promise.resolve();
        }
        else {
            return bot.github.repos
                .createStatus(bot.repo(__assign({ sha: sha, context: StatusContext, target_url: data.targetUrl.toUndefined() }, data)))
                .then(function (_r) { return Promise.resolve(); });
        }
    });
}
function getCommitState(bot, ref, ctx) {
    return bot.github.repos.listStatusesForRef(bot.repo({ ref: ref })).then(function (resp) {
        var found = resp.data.find(function (s) { return s.context == ctx; });
        if (!found) {
            return Promise.resolve(Option_1.none);
        }
        else {
            return Promise.resolve(Option_1.some(found.state));
        }
    });
}
module.exports = function (app) {
    app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var event, pr, config, m, st, toggle;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, util_1.fromEither(PullRequestEvent.decode(context.payload))];
                case 1:
                    event = _a.sent();
                    pr = event.pull_request;
                    context.log("Updated pull request #" + pr.number, pr);
                    return [4 /*yield*/, c.getConfig(context, pr.head.sha)];
                case 2:
                    config = _a.sent();
                    context.log.debug('config', config);
                    m = c.match(pr.title, config);
                    return [4 /*yield*/, getCommitState(context, pr.head.sha, StatusContext)];
                case 3:
                    st = _a.sent();
                    toggle = m.fold(function () {
                        context.log("Title of pull request #" + pr.number + " match configuration");
                        // TODO: Config to always set 'success' (false by default)
                        return st.exists(function (s) { return s != 'success'; })
                            ? context.github.repos
                                .createStatus(context.repo(__assign({ sha: pr.head.sha, context: StatusContext }, successData)))
                                .then(function (_r) { return Promise.resolve(); })
                            : Promise.resolve();
                    }, function (msg) { return function () {
                        context.log("Title of pull request #" + pr.number + " doesn't match configuration: " + msg, config);
                        var repoInfo = context.repo({});
                        var htmlUrl = "https://github.com/" + repoInfo.owner + "/" + repoInfo.repo + "/tree/" + pr.base.ref + "/.github/pr-naming.json";
                        return st.exists(function (s) { return s == 'error'; })
                            ? Promise.resolve()
                            : context.github.repos
                                .createStatus(context.repo({
                                sha: pr.head.sha,
                                context: StatusContext,
                                state: 'error',
                                description: msg.substring(0, 140),
                                targetUrl: Option_1.some(htmlUrl),
                            }))
                                .then(function (_r) { return Promise.resolve(); });
                    }; });
                    return [4 /*yield*/, toggle()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
};
//# sourceMappingURL=index.js.map