import { Intents } from 'discord.js';
const regex = {
    stateOperateExp: /<<[a-zA-Z0-9$%+\-*/()\[\]<>?:="'^.! ]+?>>/g,
    stateExp: /\$[a-zA-Z0-9-]+\$/g
};
// Convert field values into their defined types.
export const extractFieldValuesHandler = {
    'string': (data, strict, name) => {
        if (strict && !isNaN(data))
            console.log(err("the data provided is purely a number while the field is string type", name, true));
        return data;
    },
    'number': (data, strict, name) => {
        if (isNaN(data)) {
            if (strict)
                throw Error(err("Data provided for number type field is not a number", name));
            else
                return data;
        }
        return Number(data);
    }
};
export function revealNameOfCmd(content, prefix) {
    content = content.trim();
    if (!content.toLowerCase().startsWith(prefix))
        return false;
    return content.replace(prefix, '').replace(/[ ]+/g, ' ').trim().split(' ')[0].toLowerCase();
}
// Calculate and replace state references and [operations] in a string.
export function formatString(text, states) {
    if (!checkForOperation(text))
        return stateExtracter(text, states);
    const operations = text.match(regex.stateOperateExp);
    //@ts-ignore - operations is not null, cause we are already checking for it (look up)
    for (let rawOperation of operations) {
        let operation = rawOperation.replace(/<<|>>/g, '');
        operation = stateExtracter(operation, states);
        let afterOperation;
        try {
            afterOperation = eval(operation);
        }
        catch (e) {
            console.error(`[err] Invalid State Operation:\n\n${rawOperation}\n\n${e}`);
        }
        if (typeof afterOperation == 'undefined')
            return text;
        text = text.replace(rawOperation, afterOperation);
    }
    return stateExtracter(text, states);
}
// Calculate and replace state references in a string.
export function stateExtracter(text, states) {
    const stateNames = text.match(regex.stateExp);
    if (stateNames) {
        for (let stateRaw of stateNames) {
            const state = stateRaw.replace(/\$/g, '');
            if (typeof states.states[state] == null)
                continue;
            let stateVal = states.get(state);
            if (typeof stateVal == 'object')
                stateVal = JSON.stringify(stateVal);
            text = text.replace(stateRaw, `${stateVal}`);
        }
    }
    return text;
}
// check if their is any stateful-operation to calculate in a string
export function checkForOperation(text) {
    return regex.stateOperateExp.test(text);
}
export function getIntents() {
    return [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.MESSAGE_CONTENT,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
    ];
}
export function err(desc, cmd, warn = false) {
    return `[${warn ? 'warn' : 'err'}][cmd: ${cmd}] ${desc}`;
}
