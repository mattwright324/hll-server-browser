import {Server} from "server";
import * as gamestate from "gamestate";
import * as gsp from "gsp";

export class StatsCounter {

    constructor() {
        this.reset();
    }

    #data;

    reset() {
        this.#data = {
            players: {
                total: 0,
                official: 0,
                community: 0,
                dev: 0,
                steam: 0,
                nonSteam: 0,
                unknownPlatform: 0,
                inQueue: 0,
            },
            servers: {
                online: {
                    total: 0,
                    official: 0,
                    community: 0,
                    dev: 0,
                    crossplay: {
                        on: 0,
                        off: 0,
                        unknown: 0,
                    }
                },
                offline: 0,
            },
            mapCounts: {},
            modeCounts: {},
            versionCounts: {},
            hostCounts: {},
        };
    }

    /**
     * @param server {Server}
     */
    count(server) {
        if (server.status.includes("O")) {
            this.#data.servers.offline += 1
            return
        }

        const players = server.players;
        const isOfficial = server?.gs_decoded?.isOfficial || server.data?.name?.startsWith("HLL Official") || false;
        const isDev = server.data?.name?.includes("DevQA") ||
            server.data?.name?.includes("HLL Dev Team") ||
            server.data?.name?.includes("QA Testing") ||
            server.data?.name?.includes("HLL Playtest") || false;

        const serverStats = this.#data.servers.online;
        serverStats.total += 1
        if (isDev) {
            serverStats.dev += 1
        } else if (isOfficial) {
            serverStats.official += 1
        } else {
            serverStats.community += 1
        }

        if (server.hasOwnProperty("rules")) {
            if (server.crossplay_is("true")) {
                serverStats.crossplay.on += 1
            } else if (server.crossplay_is("false")) {
                serverStats.crossplay.off += 1
            } else {
                serverStats.crossplay.unknown += 1
            }
        } else {
            serverStats.crossplay.unknown += 1
        }

        const gsMap = server.gs_decoded?.map;
        const mapDecoded = gamestate.determine.mapDecode[gsMap] || "Unknown (dev/old)";
        if (!this.#data.mapCounts.hasOwnProperty(mapDecoded)) {
            this.#data.mapCounts[mapDecoded] = {
                servers: 1,
                players: players,
                list: [server]
            }
        } else {
            this.#data.mapCounts[mapDecoded].servers += 1
            this.#data.mapCounts[mapDecoded].players += players
            this.#data.mapCounts[mapDecoded].list.push(server)
        }

        const gsMode = server.gs_decoded?.gamemode;
        const modeDecoded = gamestate.determine.modeDecode[gsMode] || "Unknown (dev/new)";
        if (!this.#data.modeCounts.hasOwnProperty(modeDecoded)) {
            this.#data.modeCounts[modeDecoded] = {
                servers: 1,
                players: players,
                list: [server]
            }
        } else {
            this.#data.modeCounts[modeDecoded].servers += 1
            this.#data.modeCounts[modeDecoded].players += players
            this.#data.modeCounts[modeDecoded].list.push(server)
        }

        const gsVersion = server.gs_decoded?.version;
        const versionDecoded = gamestate.determine.serverVersion[gsVersion] || "Unknown (dev/old)";
        if (!this.#data.versionCounts.hasOwnProperty(versionDecoded)) {
            this.#data.versionCounts[versionDecoded] = {
                servers: 1,
                players: players,
                list: [server]
            }
        } else {
            this.#data.versionCounts[versionDecoded].servers += 1
            this.#data.versionCounts[versionDecoded].players += players
            this.#data.versionCounts[versionDecoded].list.push(server)
        }

        const host = gsp.findMostLikely(server)
        if (!this.#data.hostCounts.hasOwnProperty(host)) {
            this.#data.hostCounts[host] = {
                servers: 1,
                players: players,
                list: [server]
            }
        } else {
            this.#data.hostCounts[host].servers += 1
            this.#data.hostCounts[host].players += players
            this.#data.hostCounts[host].list.push(server)
        }

        if (!players) {
            return
        }

        const playerStats = this.#data.players;
        playerStats.total += players;
        playerStats.inQueue += server.gs_decoded?.currentQueue || 0;
        if (!server.data.player_list) {
            playerStats.unknownPlatform += players;
        } else {
            if (isDev) {
                playerStats.dev += players
            } else if (isOfficial) {
                playerStats.official += players
            } else {
                playerStats.community += players
            }

            server.data.player_list.forEach(player => {
                if (!player.name && player.duration > 180) {
                    playerStats.nonSteam += 1
                } else {
                    playerStats.steam += 1
                }
            })
        }
    }

    #percent(x, total) {
        return Number(Number(x / total).toFixed(4) * 100).toFixed(2)
    }

    #makeList(groupTitle, list) {
        const listItems = []
        list.forEach((item) => {
            listItems.push(`<li>${item.key} &mdash; ${item.value.players.toLocaleString()} players ${item.value.servers.toLocaleString()} servers</li>`)
        })

        return `<li>${groupTitle}<ul>${listItems.join("")}</ul></li>`
    }

    #sortObjectDesc(obj) {
        var arr = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key': prop,
                    'value': obj[prop]
                });
            }
        }
        arr.sort(function(a, b) { return (b.value.players + b.value.servers) - (a.value.players + a.value.servers); });
        return arr;
    }

    to_html() {
        const serverStats = this.#data.servers.online;
        const playerStats = this.#data.players;

        const mapCounts = this.#sortObjectDesc(this.#data.mapCounts)
        const modeCounts = this.#sortObjectDesc(this.#data.modeCounts)
        const versionCounts = this.#sortObjectDesc(this.#data.versionCounts)
        const hostCounts = this.#sortObjectDesc(this.#data.hostCounts)

        return `
            <li>${playerStats.total.toLocaleString()} total players
                <ul>
                    <li>${playerStats.steam.toLocaleString()} steam players (${this.#percent(playerStats.steam, playerStats.total)}%)
                    </li>
                    <li>${playerStats.nonSteam.toLocaleString()} non-steam players (${this.#percent(playerStats.nonSteam, playerStats.total)}%) 
                        <i class="bi bi-info-circle" data-bs-toggle="modal" data-bs-target="#winPlayersModal" style="cursor:pointer;color:cornflowerblue" title="Server breakdown"></i>
                    </li>
                    <li>${playerStats.unknownPlatform.toLocaleString()} 
                        unknown platform
                        (${this.#percent(playerStats.unknownPlatform, playerStats.total)}%)
                        <span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="Total from servers that the steam A2S_PLAYER query failed. Platform (steam or not) is determined if a player's name comes back blank from the players query.">
                            <i class="bi bi-info-circle" data-bs-toggle="modal" data-bs-target="#failedPlayersModal" style="cursor:pointer;color:cornflowerblue"></i>
                        </span>
                    </li>
                    <li>${playerStats.official.toLocaleString()} on official servers (${this.#percent(playerStats.official, playerStats.total)}%)</li>
                    <li>${playerStats.community.toLocaleString()} on community servers (${this.#percent(playerStats.community, playerStats.total)}%)</li>
                    <li>${playerStats.dev.toLocaleString()} on pte/dev/qa servers (${this.#percent(playerStats.dev, playerStats.total)}%)</li>
                </ul>
            </li>
            <li>${playerStats.inQueue.toLocaleString()} players sitting in a queue 
                <i class="bi bi-info-circle" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="How many people are idling in a server queue waiting to join"></i>
            </li>
            <br>
            <li>${serverStats.total.toLocaleString()} servers online
                <ul>
                    <li>${serverStats.official.toLocaleString()} official servers (${this.#percent(serverStats.official, serverStats.total)}%)</li>
                    <li>${serverStats.community.toLocaleString()} community servers (${this.#percent(serverStats.community, serverStats.total)}%)</li>
                    <li>${serverStats.dev.toLocaleString()} pte/dev/qa servers (${this.#percent(serverStats.dev, serverStats.total)}%)</li>
                    <li>${serverStats.crossplay.on.toLocaleString()} servers have crossplay on (${this.#percent(serverStats.crossplay.on, serverStats.total)}%)</li>
                    <li>${serverStats.crossplay.off.toLocaleString()} servers have crossplay off (${this.#percent(serverStats.crossplay.off, serverStats.total)}%)</li>
                    <li>${serverStats.crossplay.unknown.toLocaleString()} servers do not have crossplay status (${this.#percent(serverStats.crossplay.unknown, serverStats.total)}%)</li>
                </ul>
            </li>
            <li>${this.#data.servers.offline.toLocaleString()} servers offline (or address changed)</li>
            <br>
            
            ${this.#makeList("Mode Breakdown", modeCounts)}
            ${this.#makeList("Map Breakdown", mapCounts)}
            ${this.#makeList("Server Version Breakdown", versionCounts)}
            ${this.#makeList("Server Host Breakdown", hostCounts)}`;
    }

}