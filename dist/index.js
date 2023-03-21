"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Bot = void 0;
const discord_js_1 = __importStar(require("discord.js"));
const fs_1 = __importDefault(require("fs"));
const command_1 = require("./helpers/command");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return command_1.Command; } });
const handlers_1 = require("./helpers/handlers");
class Bot {
    constructor(options) {
        let intents = [
            discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
            discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            discord_js_1.Intents.FLAGS.MESSAGE_CONTENT,
            discord_js_1.Intents.FLAGS.GUILDS,
            discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
            discord_js_1.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
        ];
        this.commands = fs_1.default.readdirSync(options.commandsFolder).map(i => i.replace('.ts', ''));
        this.token = options.token;
        this.cmdFolder = options.commandsFolder;
        this.prefix = options.prefix;
        this.bot = new discord_js_1.default.Client({ intents });
        let cmdsCollectd = [];
        for (let command of this.commands) {
            let cmd = require(`${process.cwd()}/${this.cmdFolder}/${command}.ts`);
            cmdsCollectd.push(new cmd.default());
        }
        this.commandObjects = cmdsCollectd;
    }
    login(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.login(this.token);
            cb();
        });
    }
    start() {
        this.bot.on('messageCreate', (msg) => __awaiter(this, void 0, void 0, function* () {
            const cmdName = (0, handlers_1.revealNameOfCmd)(msg.content, this.prefix);
            if (!cmdName || !this.commands.includes(cmdName))
                return;
            let cmd = this.commandObjects.find(c => c.name == cmdName);
            if (!cmd)
                return;
            cmd.content = msg.content.replace(this.prefix, '').replace(/[ ]+/g, ' ').trim();
            yield cmd.execute(msg);
        }));
    }
}
exports.Bot = Bot;
