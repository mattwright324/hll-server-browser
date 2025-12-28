import * as util from "util";
import * as gamestate from "gamestate";
import * as gsp from "gsp";

const statusDesc = {
    O: "Offline",
    E: "Empty (0 pop)",
    P: "People (empty)",
    S: "Seeding (3-50)",
    L: "Live (40-91, no queue)",
    F: "Full (92-100, likely queue)",
}

export class Server {
    /**
     * {
     *     gameId: num,
     *     name: string,
     *     map: string,
     *     players: num,
     *     maxPlayers: num,
     *     player_list: [
     *         {
     *             duration: num,
     *             name: string,
     *         },
     *     ],
     *     query: string (ip:port, query port),
     *     port: num (join port),
     *     visibility: num (0 = public, 1 = password protected),
     *     rules: [
     *         {
     *             name: string,
     *             value: string
     *         },
     *     ],
     *     gamestate: {
     *         raw: string,
     *         bin: string,
     *         decoded: {
     *             currentQueue: num,
     *             currentVip: num,
     *             gamemode: num,
     *             isCrossplay: bool,
     *             isDynWthrDisabled: bool,
     *             isOfficial: bool,
     *             map: num,
     *             matchTimeMin: 0,
     *             maxQueue: num,
     *             maxVip: num,
     *             offensiveSide: num,
     *             players: num,
     *             timeOfDay: num,
     *             version: num,
     *             warmupTimeMin: num,
     *             weather: num
     *         }
     *     }
     * }
     * @param {Object} data
     */
    constructor(data) {
        this.#data = data;
        this.#gamestate = this.#data?.gamestate?.decoded;

        this.#players = this.#data?.players || this.#gamestate?.players || this.#data?.player_list?.length || 0;
        let status = "";
        if (this.#players <= 0) status += "E"; // Empty
        if (this.#players >= 1 && this.#players < 3) status += "P"; // People (empty)
        if (this.#players >= 3 && this.#players <= 50) status += "S"; // Seeding
        if (this.#players >= 40 && this.#players <= 91) status += "L"; // Live/populated
        if (this.#players > 91) status += "F"; // Full
        this.#status = status;

        let status_sort = -1;
        if (this.#status.includes("S")) status_sort = 10;
        else if (this.#status.includes("L")) status_sort = 9;
        else if (this.#status.includes("F")) status_sort = 8;
        else if (this.#status.includes("P")) status_sort = 7;
        else if (this.#status.includes("E")) status_sort = 6;
        if (this.#status.includes("O")) status_sort = 0;
        this.#status_sort = status_sort;

        this.connect_url = `steam://connect/${this.#data.query}?appid=${this.#data.gameId}`;

        this.#row_data = this.#build_row_data();
    }

    #data;
    #gamestate;
    #row_data;

    #players;
    #status;
    #status_sort;
    #connect_url;

    get data() {
        return this.#data;
    }

    get row_data() {
        return this.#row_data;
    }

    get gamestate() {
        return this.#gamestate;
    }

    get isOffline() {
        return this.#data.hasOwnProperty("last_success");
    }

    get isPasswordProtected() {
        return this.#data.visibility === 1;
    }

    get isOfficial() {
        return this.#gamestate?.isOfficial ||
            this.data?.name?.startsWith("HLL Official");
    }

    get isDev() {
        return this.data?.gameId !== 686810 ||
            (this.#gamestate?.isOfficial && !this.data?.name?.startsWith("HLL Official")) ||
            this.#data?.name?.includes("DevQA") ||
            this.#data?.name.includes("HLL Dev Team") ||
            this.#data?.name.includes("QA Testing") ||
            this.#data?.name.includes("Playtest");
    }

    #build_row_data() {
        const statuses = this.#status.split("");
        const tooltipLines = []
        for (let i = 0; i < statuses.length; i++) {
            tooltipLines.push(statusDesc[statuses[i]])
        }

        let tooltipPlayers = ""
        if (this.#players === 0) {
            tooltipPlayers = "Empty"
        } else if (this.#players > 0 && (this.#data.player_list || []).length === 0) {
            tooltipPlayers = "Failed players query"
        } else if (this.#players > 0 && (this.#data.player_list || []).length > 0) {
            tooltipPlayers = this.#data.player_list.slice(0, 7).map(x => x?.name || "").join(", ");

            if (this.#data.player_list.length > 7) {
                tooltipPlayers += `... and ${this.#data.player_list.length - 7} more`
            }
        }
        tooltipPlayers = tooltipPlayers.replaceAll('"', '&quot;')
            .replaceAll('[', '')
            .replaceAll(']', '');

        const serverDetails = [`<span class="map-name">${server.mapDisplayHtml}</span>`]
        if (offline_time || runtime) {
            serverDetails.push(offline_time || runtime)
        }
        if (crossplay) {
            serverDetails.push(crossplay)
        }
        if (wrongVersion) {
            serverDetails.push(wrongVersion)
        }
        if (wrongGameId) {
            serverDetails.push(wrongGameId)
        }

        const serverInfoHtml = `
            <div style="white-space: nowrap; text-overflow: ellipsis; min-width: 100px" class="server-info ${statuses.join(" ")}">
                <div style="display:inline-block; height: 0px">
                    <img class="map-icon ${server.mapDisplay.includes("Night") ? "night" : ""}" src="./maps/${getMapImage(server.mapDisplay, server.status)}">
                </div>
                <div style="display:inline-block">
                    ${server.name}<br>
                    <small class="text-muted">
                        ${serverDetails.join("<span class='separator'></span>")}
                    </small>
                </div>
             </div>`;

        let queueBadge = `<span data-bs-toggle="tooltip" data-bs-title="No gamestate info" data-bs-html="true" class="badge text-bg-dark">?</span>`
        if (this.#gamestate?.hasOwnProperty('currentQueue')) {
            const currentQueue = this.#gamestate.currentQueue;
            let badge = 'text-bg-secondary'
            if (currentQueue <= 2) {
                badge = 'text-bg-success'
            }

            if (currentQueue || this.#players > 91) {
                queueBadge = `<sup><span data-bs-toggle="tooltip" data-bs-title="Players in Queue" data-bs-html="true" class="badge ${badge}">${currentQueue}/${this.#gamestate.maxQueue}</span></sup>`
            } else {
                queueBadge = ""
            }
        }

        let favorites = []
        if (localStorage && localStorage.getItem("favorites")) {
            favorites = JSON.parse(localStorage.favorites);
        }
        let server_vip = []
        if (localStorage && localStorage.getItem("server_vip")) {
            server_vip = JSON.parse(localStorage.server_vip);
        }

        const serverQuery = this.#data.query;

        return [
            // 0: serverMap key; hidden
            this.#data.query,
            // 1: buttons
            `<a data-for="${this.#data.query}" class="btn btn-outline-secondary open-info ${statuses.join(" ")}" href="javascript:">Info</a>
            <a id="connect-${this.#data.query}" class="btn btn-outline-primary ${statuses.join(" ")}" href="${this.#connect_url}">Join</a>`,
            // 2: password protected; default hidden
            {
                "display": this.#data.visibility === 1 ? `<i class="bi bi-key-fill ${statuses.join(" ")}" style="color:rgb(255, 193, 7)"></i>` : "",
                "num": this.#data.visibility
            },
            // 3: status s/p/e/f
            {
                "display": `<span class="badge ${statuses.join(" ")}" data-bs-toggle="tooltip" data-bs-title="${tooltipLines.join('<br>') || " "}" data-bs-html="true">
                                             ${this.#data.status}</span>`,
                "num": this.#status_sort
            },
            // 4: players, max players, queue
            {
                "display": `<span data-bs-toggle="tooltip" data-bs-title="${tooltipPlayers || " "}" data-bs-html="true" class="player-count ${statuses.join(" ")}">${this.#data.players}/${this.#data.maxPlayers}</span> ${queueBadge}`,
                "num": Number(this.#data.players)
            },
            // 5: server name and map
            serverInfoHtml,
            // 6: "I have vip here" button
            {
                display: `<i id="fav-${serverQuery}" class='bi bi-award vip ${server_vip.includes(serverQuery) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${serverQuery}' title='I have VIP here'></i>`,
                num: function () {
                    return server_vip.includes(serverQuery) ? 1 : 0
                }
            },
            // 7: favorite button
            {
                display: `<i id="fav-${serverQuery}" class='bi bi-star fav ${favorites.includes(serverQuery) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${serverQuery}' title='Favorite'></i>`,
                num: function () {
                    return favorites.includes(serverQuery) ? 1 : 0
                }
            }
        ]
    }
}