import * as util from "util";
import * as gamestate from "gamestate";
import * as gsp from "gsp";

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
     *     query: string (ip:query port),
     *     port: num (join port),
     *     visibility: num (0 = public, 1 = password protected),
     *     map_change: string (ISO 8601; present when last map change detected),
     *     last_success: string (ISO 8601; present when query failed),
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
     *             matchTimeMin: num,
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

        this.#connect_url = `steam://connect/${this.#data.query}?appid=${this.#data.gameId}`;

        this.#is_offline = this.#data.hasOwnProperty("last_success");
        this.#is_password_protected = this.#data.visibility === 1;
        this.#is_official = this.#gamestate?.isOfficial || this.data?.name?.startsWith("HLL Official");
        this.#is_dev = this.data?.gameId !== 686810 ||
            (this.#gamestate?.isOfficial && !this.data?.name?.startsWith("HLL Official")) ||
            this.#data?.name?.includes("DevQA") ||
            this.#data?.name.includes("HLL Dev Team") ||
            this.#data?.name.includes("QA Testing") ||
            this.#data?.name.includes("Playtest");

        this.#players = this.#data?.players || this.#gamestate?.players || this.#data?.player_list?.length || 0;

        let status = "";
        if (this.#players <= 0) status += "E"; // Empty
        if (this.#players >= 1 && this.#players < 3) status += "P"; // People (empty)
        if (this.#players >= 3 && this.#players <= 50) status += "S"; // Seeding
        if (this.#players >= 40 && this.#players <= 91) status += "L"; // Live/populated
        if (this.#players > 91) status += "F"; // Full
        if (this.#data.hasOwnProperty("last_success")) status = "O"; // Offline
        this.#status = status;

        let status_sort = -1;
        if (this.#status.includes("S")) status_sort = 10;
        else if (this.#status.includes("L")) status_sort = 9;
        else if (this.#status.includes("F")) status_sort = 8;
        else if (this.#status.includes("P")) status_sort = 7;
        else if (this.#status.includes("E")) status_sort = 6;
        if (this.#status.includes("O")) status_sort = 0;
        this.#status_sort = status_sort;

        this.#map_display = gamestate.determine.mapDisplayName(this.#data);

        this.#row_data = this.#build_row_data();
    }

    #data;
    #gamestate;
    #row_data;

    #connect_url;
    #players;
    #map_display;
    #status;
    #status_sort;

    #is_offline;
    #is_password_protected;
    #is_official;
    #is_dev;

    get data() {
        return this.#data;
    }

    get gamestate() {
        return this.#gamestate;
    }

    get row_data() {
        return this.#row_data;
    }

    #map_image() {
        const name = this.#map_display;

        if (this.#is_offline) return "offline.jpg";

        if (name.includes("Foy")) return "foy.webp";
        else if (name.includes("du Mont")) return "stmariedumont.webp";
        else if (name.includes("Hurtgen")) return "hurtgenforest.webp";
        else if (name.includes("Utah")) return "utahbeach.webp";
        else if (name.includes("Omaha")) return "omahabeach.webp";
        else if (name.includes("Eglise")) return "stmereeglise.webp";
        else if (name.includes("Purple")) return "purpleheartlane.webp";
        else if (name.includes("Hill 400")) return "hill400.webp";
        else if (name.includes("Carentan")) return "carentan.webp";
        else if (name.includes("Kursk")) return "kursk.webp";
        else if (name.includes("Stalin")) return "stalingrad.webp";
        else if (name.includes("Remagen")) return "remagen.webp";
        else if (name.includes("Kharkov")) return "kharkov.webp";
        else if (name.includes("Alamein")) return "elalamein.webp";
        else if (name.includes("Driel")) return "driel.webp";
        else if (name.includes("Mortain")) return "mortain.webp";
        else if (name.includes("Elsenborn")) return "elsenborn.webp";
        else if (name.includes("Tobruk")) return "tobruk.webp";
        else if (name.includes("Smolensk")) return "smolensk.webp";

        return "unknown.jpg";
    }

    #crossplay_is(enabled) {
        if (this.#data.hasOwnProperty("rules")) {
            const stringify = JSON.stringify(this.#data.rules);
            if (enabled === "true" && stringify.includes("crossplayenabled") ||
                enabled === "false" && stringify.includes("crossplaydisabled")) {
                return true
            }

            // New crossplay status
            for (let i = 0; i < this.#data.rules.length; i++) {
                const rule = this.#data.rules[i];
                if (rule.name.toLowerCase() === "crossplay_b" && rule.value === enabled) {
                    return true;
                }
            }
        }
        return false;
    }

    #build_row_data() {
        const statusDesc = {
            O: "Offline",
            E: "Empty (0 pop)",
            P: "People (empty)",
            S: "Seeding (3-50)",
            L: "Live (40-91, no queue)",
            F: "Full (92-100, likely queue)",
        }

        const statuses = this.#status.split("");
        const tooltipStatus = []
        for (let i = 0; i < statuses.length; i++) {
            tooltipStatus.push(statusDesc[statuses[i]])
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

        let offline_time = ""
        if (this.#data.hasOwnProperty("last_success")) {
            const changeTime = moment(this.#data.last_success);
            const duration = moment.duration(moment().diff(changeTime))

            let tooltipText = "Time since last successful query";
            let text = util.formatDuration(duration, true)

            offline_time = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
        }

        let runtime = ""
        if (this.#data.hasOwnProperty("map_change")) {
            const changeTime = moment(this.#data.map_change);
            const duration = moment.duration(moment().diff(changeTime))
            const warfareEndTime = moment(this.#data.map_change).add(1.5, 'hour')
            const warfareDurationUntilEnd = moment.duration(warfareEndTime.diff(moment()))
            const skirmishEndTime = moment(this.#data.map_change).add(30, 'minute')
            const skirmishDurationUntilEnd = moment.duration(skirmishEndTime.diff(moment()))

            let tooltipText;
            let text;
            if (this.#map_display.includes("Warfare") && duration.asMinutes() <= 92) {
                tooltipText = "Map time remaining<br>(Warfare)"
                text = `${util.formatDuration(warfareDurationUntilEnd, true)} left`
            } else if (this.#map_display.includes("Skirmish") && duration.asMinutes() <= 32) {
                tooltipText = "Map time remaining<br>(Skirmish)"
                text = `${util.formatDuration(skirmishDurationUntilEnd, true)} left`
            } else if (this.#map_display.includes("Offensive") && duration.asMinutes() <= 152) {
                tooltipText = "Map time elapsed<br>(Offensive)"
                text = `${util.formatDuration(duration, true)} elapsed`
            } else {
                tooltipText = "Map time elapsed<br>Same map more than once?"
                text = `<span style="color:darkgoldenrod">${util.formatDuration(duration, true)} elapsed</span>`
            }

            runtime = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}"><i class="bi bi-clock-history"></i> ${text}</span>`

            // Server died and the map likely won't change anytime soon
            if (duration.asHours() >= 4 && this.#players === 0) {
                runtime = ""
            }
        }

        let crossplay = ""
        if (this.#data.hasOwnProperty("rules")) {
            let tooltipText;
            let text;
            if (this.#crossplay_is("true")) {
                tooltipText = "Crossplay enabled: Steam+Windows+Epic"
                text = "<span class='crossplay enabled'><i class=\"bi bi-controller\"></i><i class=\"bi bi-check2\"></i></span>"
            } else if (this.#crossplay_is("false")) {
                tooltipText = "Crossplay disabled"
                text = "<span class='crossplay disabled'><i class=\"bi bi-controller\"></i><i class=\"bi bi-x-lg\"></i></span>"
            } else {
                tooltipText = "Crossplay unknown"
                text = "<span class='crossplay unknown'><i class=\"bi bi-controller\"></i><i class=\"bi bi-question-lg\"></i></span>"
            }

            crossplay = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
        }

        const version = this?.#gamestate?.version;
        let wrongVersion = ""
        if (version && gamestate.LATEST_SERVER_VERSION !== version) {
            let text = `<span class="wrong-version"><i class="bi bi-exclamation-diamond"></i> ${gamestate.determine.serverVersion[version] || version}</span>`
            let tooltipText = `Server version does not match latest. This server is not joinable.`
            wrongVersion = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
        }

        let wrongGameId = ""
        if (this.#data.gameId !== 686810) {
            let text = `<span class="wrong-gameid"><i class="bi bi-exclamation-diamond"></i> ${this.#data.gameId || "???"}</span>`
            let tooltipText = `Server is not for the base game (686810).`
            wrongGameId = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
        }

        const serverDetails = [`<span class="map-name">${this.#map_display}</span>`]
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
                    <img class="map-icon ${this.#map_display.includes("Night") ? "night" : ""}" src="./maps/${this.#map_image()}">
                </div>
                <div style="display:inline-block">
                    ${this.#data.name}<br>
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
                "display": `<span class="badge ${statuses.join(" ")}" data-bs-toggle="tooltip" data-bs-title="${tooltipStatus.join('<br>') || " "}" data-bs-html="true">
                                             ${this.#status}</span>`,
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
                display: `<i id="fav-${this.#data.query}" class='bi bi-award vip ${server_vip.includes(this.#data.query) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${this.#data.query}' title='I have VIP here'></i>`,
                num: () =>  server_vip.includes(this.#data.query) ? 1 : 0
            },
            // 7: favorite button
            {
                display: `<i id="fav-${this.#data.query}" class='bi bi-star fav ${favorites.includes(this.#data.query) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${this.#data.query}' title='Favorite'></i>`,
                num: () => favorites.includes(this.#data.query) ? 1 : 0
            }
        ]
    }
}