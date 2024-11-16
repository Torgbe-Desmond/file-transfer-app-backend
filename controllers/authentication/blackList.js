const blacklist = new Set();
let clearBlacklistTimer = null;

function addToBlacklist(token) {
    blacklist.add(token);

    if (!clearBlacklistTimer) {
        clearBlacklistTimer = setTimeout(() => {
            blacklist.clear();
            clearBlacklistTimer = null;
        }, 60 * 60 * 1000); 
    }
}

function isTokenBlacklisted(token) {
    return blacklist.has(token);
}

module.exports = { addToBlacklist, isTokenBlacklisted, blacklist };
