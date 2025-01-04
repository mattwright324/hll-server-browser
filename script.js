(function () {
    'use strict';

    function init() {
        new ClipboardJS(".clipboard");

        const LATEST_SERVER_VERSION = 757054685;
        const gs = {
            serverVersion: {
                572092818: "v15.2",
                1945600328: "v15.2.1",
                2386721110: "v15.3",
                3988232635: "v16",
                757054685: "v16.0.1",
            },
            mapDecode: {
                1: "Foy",
                2: "St Marie du Mont (SMDM)",
                3: "Hurtgen",
                4: "Utah Beach",
                5: "Omaha Beach",
                6: "St Mere Eglise (SME)",
                7: "Purple Heart Lane",
                8: "Hill 400",
                9: "Carentan",
                10: "Kursk",
                11: "Stalingrad",
                12: "Remagen",
                13: "Kharkov",
                14: "El Alamein",
                15: "Driel",
                16: "Mortain",
                17: "Elsenborn",
            },
            modeDecode: {
                2: "Warfare",
                3: "Offensive",
                7: "Skirmish",
                // 10: "Objective", // Maybe?
            },
            offAttackSide: {
                0: "GER",
                1: "US",
                2: "RUS",
                3: "GB",
                4: "DAK",
                5: "B8A"
            },
            weatherDecode: {
                1: "Clear",
                2: "Overcast",
                3: "Rain",
                4: "Snow"
            },
            timeOfDayDecode: {
                1: "Day",
                2: "Night",
                3: "Dusk",
                5: "Dawn",
            },

            steamMapStartsWith: {
                Foy: "Foy",
                DEV_B: "Foy",
                StMarie: "St Marie du Mont (SMDM)",
                DEV_M: "St Marie du Mont (SMDM)",
                DEV_E: "Brecourt (SMDM)",
                Hurtgen: "Hurtgen",
                Utah: "Utah Beach",
                Omaha: "Omaha Beach",
                DEV_L: "Omaha Beach",
                SME: "St Mere Eglise (SME)",
                DEV_I: "St Mere Eglise (SME)",
                PHL: "Purple Heart Lane",
                DEV_K: "Purple Heart Lane",
                Hill400: "Hill 400",
                DEV_H: "Hill 400",
                CT: "Carentan",
                DEV_F: "Carentan",
                Kursk: "Kursk",
                Stalin: "Stalingrad",
                Remagen: "Remagen",
                DEV_J: "Remagen",
                Kharkov: "Kharkov",
                DEV_A: "Kharkov",
                elalamein: "El Alamein",
                DEV_D: "El Alamein",
                Driel: "Driel",
                DEV_C: "Driel",
                Mortain: "Mortain",
                DEV_G: "Mortain",
                DEV_Z: "Mortain",
                DEV_N: "Elsenborn",
                DEN_O: "Tobruk",
                DEV_P: "Juno Beach",
            },

            determineDisplayMapName: function (server) {
                const decodedGs = server?.gamestate?.decoded;
                const gsMap = decodedGs?.map;
                const gsMode = decodedGs?.gamemode;
                const gsOffAttkSide = decodedGs?.offensiveSide;
                const gsWeather = decodedGs?.weather;
                const gsTimeOfDay = decodedGs?.timeOfDay;

                const steamMap = server?.map;
                let steamDisplay;
                Object.keys(this.steamMapStartsWith).forEach(key => {
                    if (steamMap.startsWith(key)) {
                        steamDisplay = this.steamMapStartsWith[key];
                    }
                })
                if (!steamDisplay) {
                    return;
                }

                let displayMap;
                if (this.mapDecode.hasOwnProperty(gsMap)) {
                    displayMap = this.mapDecode[gsMap];
                    displayMap += " " + this.modeDecode[gsMode];
                    if (gsMode === 3) {
                        displayMap += " " + this.offAttackSide[gsOffAttkSide];
                    }
                    let modifiers = []
                    const timeOfDay = this.timeOfDayDecode[gsTimeOfDay];
                    if (timeOfDay && gsTimeOfDay !== 1) {
                        modifiers.push(timeOfDay);
                    }
                    const weather = this.weatherDecode[gsWeather]
                    if (weather && gsWeather !== 1) {
                        modifiers.push(weather)
                    }
                    if (modifiers.length) {
                        displayMap += ` (${modifiers.join(", ")})`
                    }
                    return displayMap;
                }
                if (steamDisplay) {
                    displayMap = steamDisplay;
                    displayMap += " " + this.modeDecode[gsMode];
                    if (gsMode === 3) {
                        displayMap += " " + this.offAttackSide[gsOffAttkSide];
                    }
                    let modifiers = []
                    if (gsTimeOfDay && gsTimeOfDay !== 1) {
                        modifiers.push(this.timeOfDayDecode[gsTimeOfDay]);
                    }
                    if (gsWeather && gsWeather !== 1) {
                        modifiers.push(this.weatherDecode[gsWeather])
                    }
                    if (modifiers.length) {
                        displayMap += ` (${modifiers.join(", ")})`
                    }
                    return displayMap;
                }
            }
        }

        let unknownMapNames = [];

        const serverTable = new DataTable("#server-table", {
            layout: {
                topStart: 'info'
            },
            columns: [
                {
                    title: "IP",
                    className: "dt-nowrap",
                    visible: false
                },
                {
                    title: "",
                    className: "dt-nowrap",
                    sortable: false
                },
                {
                    title: "PW",
                    type: "num",
                    visible: false,
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                    className: "dt-nowrap dt-center"
                },
                {
                    title: "Status",
                    type: "num",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                    className: "dt-nowrap dt-center"
                },
                {
                    title: "Players",
                    type: "num",
                    className: "dt-nowrap dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {title: "Server"},
                {
                    title: "<i class='bi bi-award' title='VIP'></i>",
                    type: "num",
                    className: "dt-nowrap dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {
                    title: "<i class='bi bi-star-half' title='Favorite'></i>",
                    type: "num",
                    className: "dt-nowrap dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
            ],
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
            }, {
                "width": "100%",
                "targets": 5
            }],
            order: [[7, 'desc'], [3, 'desc'], [4, 'desc'], [5, 'asc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1,
            drawCallback: function (settings) {
                var api = this.api();
                var rows = api.rows({page: 'current'}).nodes()
                var last = null;

                api.column(0, {page: 'current'})
                    .data()
                    .each(function (ip, i) {
                        if (last !== ip) {
                            const server = ip2server[ip];

                            let hex = "", bin = "";
                            if (server?.gamestate?.raw && query.hasOwnProperty("debug")) {
                                hex = base64ToHex(server?.gamestate?.raw);
                                bin = hex2bin(hex);

                                let bits = []
                                let sections = []
                                let descs = []
                                let bin2 = bin;

                                function readBin(len, desc, color, func) {
                                    color = color || "cornflowerblue";
                                    const bitStr = bin2.slice(0, len);
                                    bits.push(`<td style="color:${color};border:2px dashed ${color};text-wrap: nowrap">${bitStr.split("").reverse().join("").replaceAll(/(\d{4})/g, '$1 ').trim().split("").reverse().join("")}</td>`)
                                    descs.push(`<td style="color:${color};border:2px dashed ${color}">${desc}</td>`)
                                    const value = parseInt(bitStr, 2);
                                    bin2 = bin2.slice(len)
                                    sections.push(`<td style="color:${color};border:2px dashed ${color}">${func ? func(value) : value}</td>`)
                                    return value;
                                }

                                readBin(2, "???", "yellowgreen");
                                readBin(2, "_", "gray");
                                const gamemode = readBin(4, "Game mode");

                                // readBin(1, "_", "gray");
                                const foo1 = readBin(8, "???", "yellowgreen");

                                readBin(16, "???", "yellowgreen");
                                const version = readBin(32, "Build/Version");
                                const players = readBin(7, "Players");
                                const official = readBin(1, "Official", "cornflowerblue", val => val === 1);

                                readBin(1, "_", "gray") === 1;
                                const currentVips = readBin(7, "Curr VIP");

                                readBin(1, "???", "yellowgreen") === 1;
                                const maxVips = readBin(7, "Max VIP");

                                readBin(2, "???", "yellowgreen");
                                const currentQueue = readBin(3, "Cur Que");
                                const maxQueue = readBin(3, "Max Que");

                                readBin(4, "???", "yellowgreen");
                                const crossplay = readBin(1, "Crss Play", "cornflowerblue", val => val === 1);
                                const attackers = readBin(3, "Off. Attk");
                                const map = readBin(8, "Map");
                                const timeOfDay = readBin(8, "Time o Day");
                                const weather = readBin(8, "Weather");

                                if (bin2) {
                                    readBin(bin2.length, "Remaining", "red")
                                }

                                // ${bin.replaceAll(/(\d{4})/g, '$1 ')}<br>
                                // ${hex.replaceAll(/(\w{2})/g, '$1 ')}<br>

                                $(rows).eq(i).after(`<tr>
                                        <td colspan="7">
                                            <small class="text-muted" style="font-family: Consolas, monospace">
                                                <table class="bit-table">
                                                <tbody>
                                                <tr>${bits.join('')}</tr>
                                                <tr>${sections.join('')}</tr>
                                                <tr>${descs.join('')}</tr>
                                                </tbody>
                                                </table>
                                                Map & Mode: 
                                                    ${gs.mapDecode[map]} 
                                                    ${gs.modeDecode[gamemode]} 
                                                    ${gamemode === 3 ? gs.offAttackSide[attackers] : ""}
                                                    ${weather !== 1 ? gs.weatherDecode[weather] : ""}
                                                    ${timeOfDay !== 1 ? gs.timeOfDayDecode[timeOfDay] : ""}
                                                <br>VIP:
                                                    [${currentVips} / ${maxVips}]
                                                <br>Queue:
                                                    [${currentQueue} / ${maxQueue}]
                                            </small>
                                        </td>
                                    </tr>`)

                                last = ip;
                            }
                        }
                    })
            }
        });

        const findPlayerTable = new DataTable("#find-players-table", {
            columns: [
                {
                    title: "Player",
                    className: "dt-nowrap",
                    type: "html"
                },
                {
                    title: "Duration",
                    type: "num",
                    className: "dt-nowrap dt-left",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                    searchable: false,
                },
                {
                    title: "Server",
                    className: "dt-nowrap",
                    searchable: false,
                },
                {
                    title: "",
                    className: "dt-nowrap",
                    sortable: false,
                    searchable: false,
                },
            ],
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
            }, {
                "width": "100%",
                "targets": 2
            }],
            order: [[1, 'desc'], [2, 'desc']],
            lengthMenu: [[10, 25, 50, 100, 250], [10, 25, 50, 100, 250]],
            deferRender: true,
            bDeferRender: true,
        });

        const winPlayerServerTable = new DataTable("#winplayer-server-table", {
            layout: {
                topStart: 'info'
            },
            paging: false,
            columns: [
                {
                    title: "Players",
                    type: "num",
                    className: "dt-nowrap  dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {
                    title: "Non-Steam<br>Players",
                    type: "num",
                    className: "dt-nowrap  dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {title: "Server"},
            ],
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
            }, {
                "width": "100%",
                "targets": 2
            }],
            order: [[1, 'desc'], [2, 'asc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1
        })

        let favorites = []
        if (localStorage && localStorage.getItem("favorites")) {
            favorites = JSON.parse(localStorage.favorites);
        }
        let server_vip = []
        if (localStorage && localStorage.getItem("server_vip")) {
            server_vip = JSON.parse(localStorage.server_vip);
        }

        const shareLink = $("#shareLink")
        const btnConnectSeeding = $("#join-seeding");
        const btnConnectPopulated = $("#join-populated");
        const btnConnectAny = $("#join-any");
        const checkLatestOnly = $("#latest-only");
        const checkHidePassworded = $("#hide-passworded");
        const checkHideEmpty = $("#hide-empty");
        const checkMax100 = $("#max-100-only");
        const checkIgnoreKeywords = $("#ignore-keywords");
        const ignoreWordsTextbox = $("#ignoreWords");
        const checkOnlyKeywords = $("#only-keywords");
        const onlyWordsTextbox = $("#onlyWords");
        const crossplayEnabled = $("#crossplayEnabled");
        const crossplayAny = $("#crossplayAny");
        const crossplayDisabled = $("#crossplayDisabled");
        const checkMapKeywords = $("#map-keywords");
        const mapWordsTextbox = $("#mapWords");

        [checkLatestOnly, checkHidePassworded, checkHideEmpty, checkMax100, checkIgnoreKeywords, checkOnlyKeywords, crossplayEnabled, crossplayAny, crossplayDisabled, checkMapKeywords].forEach(el => {
            el.change(() => {
                serverTable.draw()
                serverTable.column(2).visible(!checkHidePassworded.is(":checked"))
                updateShareLink()
            })
        });
        [ignoreWordsTextbox, onlyWordsTextbox].forEach(el => {
            el.on('keyup', () => {
                serverTable.draw();
                $(".name-filter[data-val='custom']").click();
                updateShareLink()
            })
        });
        [checkIgnoreKeywords, checkOnlyKeywords].forEach(el => {
            el.change(() => {
                $(".name-filter[data-val='custom']").click();
                updateShareLink()
            })
        });
        [mapWordsTextbox].forEach(el => {
            el.on('keyup', () => {
                serverTable.draw();
                updateShareLink()
            })
        });

        function initTooltip() {
            // try {
            //     const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            //     const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
            // } catch (e) {
            //     console.warn("Failed to init tooltips")
            // }
        }

        $(document).on('mouseover', '[data-bs-toggle="tooltip"]', function (e) {
            const target = e.currentTarget;
            if (target && !target.hasAttribute("tooltip-hovered")) {
                target.setAttribute("tooltip-hovered", "true")

                new bootstrap.Tooltip(target)
                $(target).tooltip('show')
            }
        })

        const commonIgnore = "event, training, test, team17, dev team"
        const commonIgnoreOfficial = `${commonIgnore}, hll official`
        const euOnly = "(eu, [eu, eu], euro, eu/, /eu, /en, eng/, en/, english, exd, ww, [taw, wth"
        const frOnly = "fr o, fr -, [fr, fr/, /fr"
        const cnOnly = "cn, kook, violet, qq, $regex_cn$"
        const gerOnly = "german, ger mic, .de, de/, [ger, ger/, /ger, ger), deut, ger+, ♦ GER, aut, ★ GER, [ GER"
        const spaOnly = "spa o, esp, hisp, .es, south a"
        const rusOnly = "[rus, only ru, russia, /ru, ru/, pkka"
        const ausOnly = ".au, /aus, /aus, bigd, aust, auss, kiwi, koala"
        const nlOnly = "[nl, dutch, dll, nl/, /nl"
        const otherOnly = "brasil, ita, danish, norway, scandin, [pl"
        const langFilters = {
            "all": {
                checkIgnore: true,
                ignore: "",
                checkOnly: true,
                only: ""
            },
            "en": {
                checkIgnore: true,
                ignore: `${commonIgnoreOfficial}, ${frOnly}, ${cnOnly}, ${gerOnly}, ${spaOnly}, ${rusOnly}, ${ausOnly}, ${otherOnly}`,
                checkOnly: true,
                only: ""
            },
            "en-us": {
                checkIgnore: true,
                ignore: `${commonIgnoreOfficial}, ${euOnly}, ${frOnly}, ${cnOnly}, ${gerOnly}, ${spaOnly}, ${rusOnly}, ${ausOnly}, ${nlOnly}, ${otherOnly}`,
                checkOnly: true,
                only: ""
            },
            "en-eu": {
                checkIgnore: true,
                ignore: commonIgnoreOfficial,
                checkOnly: true,
                only: euOnly
            },
            "fr": {
                checkIgnore: true,
                ignore: commonIgnoreOfficial,
                checkOnly: true,
                only: frOnly
            },
            "cn": {
                checkIgnore: true,
                ignore: `${commonIgnoreOfficial}, ${frOnly}, ${gerOnly}`,
                checkOnly: true,
                only: cnOnly
            },
            "ger": {
                checkIgnore: true,
                ignore: commonIgnoreOfficial,
                checkOnly: true,
                only: gerOnly
            },
            "spa": {
                checkIgnore: true,
                ignore: commonIgnore,
                checkOnly: true,
                only: spaOnly
            },
            "rus": {
                checkIgnore: true,
                ignore: commonIgnore,
                checkOnly: true,
                only: rusOnly
            },
            "aus": {
                checkIgnore: true,
                ignore: `${commonIgnore}, ${gerOnly}`,
                checkOnly: true,
                only: ausOnly
            },
            "nl": {
                checkIgnore: true,
                ignore: `${commonIgnoreOfficial}, ${gerOnly}`,
                checkOnly: true,
                only: nlOnly
            },
            "official": {
                checkIgnore: true,
                ignore: commonIgnore,
                checkOnly: true,
                only: "$hll_official$"
            },
            "other": {
                checkIgnore: true,
                ignore: commonIgnoreOfficial,
                checkOnly: true,
                only: otherOnly
            },
            "custom": {},
        }

        $(document).on('click', '.fav', function (e) {
            console.log(favorites)
            const toggle = $(e.target);
            const server = toggle.data("for");
            if (!Array.isArray(favorites)) {
                favorites = [favorites]
            }
            if (toggle.hasClass("selected")) {
                toggle.removeClass("selected");
                favorites = favorites.filter(x => x !== server);
            } else {
                toggle.addClass("selected");
                favorites.push(server)
            }

            if (localStorage) {
                localStorage.setItem("favorites", JSON.stringify(favorites))
            }

            console.log(favorites)

            serverTable.draw()
        })

        $(document).on('click', '.vip', function (e) {
            console.log(server_vip)
            const toggle = $(e.target);
            const server = toggle.data("for");
            if (!Array.isArray(server_vip)) {
                server_vip = [server_vip]
            }
            if (toggle.hasClass("selected")) {
                toggle.removeClass("selected");
                server_vip = server_vip.filter(x => x !== server);
            } else {
                toggle.addClass("selected");
                server_vip.push(server)
            }

            if (localStorage) {
                localStorage.setItem("server_vip", JSON.stringify(server_vip))
            }

            console.log(favorites)

            serverTable.draw()
        });

        const infoModal = $("#infoModal");
        const divAdditionalInfo = $("#additional-info");
        const playersTable = new DataTable("#player-table", {
            layout: {
                topStart: 'info'
            },
            paging: false,
            columns: [
                {
                    title: "Name",
                    className: "dt-nowrap",
                    type: "html"
                },
                {
                    title: "Duration",
                    type: "num",
                    className: "dt-nowrap",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
            ],
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
            }],
            order: [[1, 'desc'], [0, 'asc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1
        })
        $(document).on('click', '.open-info', function (e) {
            const server = $(e.target).data("for");
            console.log('open info for ', server)

            infoModal.attr("data-for", server);
            infoModal.modal('show');
            tryUpdateInfoModal()
        });

        function tryUpdateInfoModal() {
            const server = infoModal.attr('data-for')
            if (!server) {
                return
            }
            const info = ip2server[server];
            if (!info) {
                return
            }
            console.log('info modal', info)

            infoModal.find(".modal-title").text(info.name);
            infoModal.find(".join-link").attr("href", info.connect_url);

            const details = []
            const serverIp = info.query.split(":")[0];
            const searchLink1 = `<a target="_blank" href="https://api.steampowered.com/ISteamApps/GetServersAtAddress/v1/?addr=${serverIp}">Search for other servers on the same box (SteamAPI)</a>`
            const searchLink2 = `<a target="_blank" href="https://www.battlemetrics.com/servers/search?q=%22${serverIp}%22&sort=score&status=online">Search for other servers on the same box (BattleMetrics)</a>`
            details.push(`<li><div class="property">Server IP: </div><div class="value">${serverIp}</div><ul><li>${searchLink1}</li><li>${searchLink2}</li></ul></li>`)
            details.push(`<li><div class="property">Query Port: </div><div class="value">${info.query}</div></li>`)
            const statuses = info.status.split("");
            const statusLines = []
            for (let i = 0; i < statuses.length; i++) {
                statusLines.push(statusDesc[statuses[i]])
            }
            details.push(`<li><div class="property">Status(es): </div><div class="value">${statusLines.join(", ")}</div></li>`)
            if (info.status !== 'O') {
                const decoded = info?.gamestate?.decoded;
                let queues = ""
                if (decoded) {
                    queues = `<li>(${decoded?.currentVip}/${decoded?.maxVip}) VIP slots, (${decoded?.currentQueue} / ${decoded?.maxQueue}) in QUEUE</li>`
                }
                details.push(`<li><div class="property">Player Count: </div><div class="value">${info.players} / ${info.maxPlayers}</div><ul>${queues}</ul></li>`)
                if (info.player_list) {
                    let serverSteam = 0;
                    let serverNonSteam = 0;
                    for (let i = 0; i < info.player_list.length; i++) {
                        if (!info.player_list[i].name && info.player_list[i].duration > 180) {
                            serverNonSteam += 1;
                        } else {
                            serverSteam += 1;
                        }
                    }
                    details.push(`<li><div class="property">Platform Count: </div><div class="value"><i class="bi bi-steam mr-4"></i> ${serverSteam} : <i class="bi bi-controller mr-4"></i> ${serverNonSteam}</div></li>`)
                }
                let mapDisplay = info.mapDisplay ? info.mapDisplay + " — " + info.map : info.map
                if (unknownMapNames.includes(info.map)) {
                    mapDisplay = `<span class='unknown_map'>${mapDisplay}</span>`
                }
                details.push(`<li><div class="property">Current Map: </div><div class="value">${mapDisplay}</div></li>`)
            }
            if (info.rules) {
                const rules = []
                for (let i = 0; i < (info.rules || []).length; i++) {
                    const rule = info.rules[i].name;
                    const value = info.rules[i].value;
                    rules.push(`<li><small>${rule}: ${value}</small></li>`)
                }

                details.push(`<li><div class="property">Game Rules: </div><ul>${rules.join("")}</ul></li>`)
            }

            divAdditionalInfo.html(`
            <small>
                <ul>
                    ${details.join("")}
                </ul>
            </small>
            `)

            if (info.player_list) {
                const rows = []
                info.player_list.forEach(player => {
                    let nameDisplay;
                    if (!player.name) {
                        if (player.duration > 180) {
                            nameDisplay = `<small class="text-muted"><i class="bi bi-controller mr-4"></i>Unnamed Non-Steam Player</small>`
                        } else {
                            nameDisplay = `<small class="text-muted"><i class="bi bi-steam mr-4"></i>Unnamed Steam Player</small>`
                        }
                    } else {
                        nameDisplay = `<i class="bi bi-steam mr-4"></i><span style="margin-right:8px">${player.name.replaceAll("<", "&lt;")}</span><a class="steam-name-search" href="https://steamcommunity.com/search/users/#text=%22${encodeURI(player.name.replaceAll("=", "%3D"))}%22" target="_blank"><i class="bi bi-search"></i></a>`;
                    }

                    rows.push([nameDisplay, {
                        "display": formatDuration(moment.duration(player.duration, 'seconds')),
                        "num": player.duration
                    }])
                })

                playersTable.clear()
                playersTable.rows.add(rows).draw(false);
                playersTable.columns.adjust().draw(false);
            } else {
                playersTable.clear().draw(false)
            }
        }

        $('.name-filter').on('click', function (e) {
            $(".name-filter").removeClass("selected");
            $(e.target).addClass("selected");

            const key = $(e.target).data("val");
            const settings = langFilters[key];
            if (!settings) {
                return
            }

            let draw = false
            console.log(settings)
            if (settings.checkIgnore) {
                checkIgnoreKeywords.prop("checked", settings.checkIgnore)
                draw = true
            }
            if (settings.hasOwnProperty("ignore")) {
                ignoreWordsTextbox.val(settings.ignore)
                draw = true
            }
            if (settings.checkOnly) {
                checkOnlyKeywords.prop("checked", settings.checkOnly)
                draw = true
            }
            if (settings.hasOwnProperty("only")) {
                onlyWordsTextbox.val(settings.only)
                draw = true
            }
            if (settings.hasOwnProperty("maps")) {
                onlyWordsTextbox.val(settings.maps)
                draw = true
            }

            if (draw) {
                serverTable.draw()
            }
            updateShareLink()
        })

        function crossplayIs(server, enabled) {
            if (server.rules) {
                // Old crossplay status
                const stringify = JSON.stringify(server.rules);
                if (enabled === "true" && stringify.includes("crossplayenabled") ||
                    enabled === "false" && stringify.includes("crossplaydisabled")) {
                    return true
                }

                // New crossplay status
                for (let i = 0; i < server.rules.length; i++) {
                    const rule = server.rules[i];
                    if (rule.name.toLowerCase() === "crossplay_b" && rule.value === enabled) {
                        return true;
                    }
                }
            }
            return false
        }

        const termRegexes = {
            "$regex_cn$": /([\u4e00-\u9fff\u3400-\u4dbf\ufa0e\ufa0f\ufa11\ufa13\ufa14\ufa1f\ufa21\ufa23\ufa24\ufa27\ufa28\ufa29\u3006\u3007]|[\ud840-\ud868\ud86a-\ud879\ud880-\ud887][\udc00-\udfff]|\ud869[\udc00-\udedf\udf00-\udfff]|\ud87a[\udc00-\udfef]|\ud888[\udc00-\udfaf])([\ufe00-\ufe0f]|\udb40[\udd00-\uddef])?/g
        }

        const customChecks = {
            "$hll_official$": function (server) {
                return server?.gamestate?.decoded?.isOfficial || server?.name?.startsWith("HLL Official");
            }
        }

        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            if (settings.sInstance !== "server-table") {
                return true
            }

            const server = ip2server[data[0]];
            if (!server) {
                // console.log('null', server)
                return false
            }

            if (checkLatestOnly.is(":checked") && server?.gamestate && server?.gamestate?.decoded?.version !== LATEST_SERVER_VERSION) {
                return false
            }

            const players = server?.players || server?.gamestate?.decoded?.players || server?.player_list?.length || 0;
            if (checkHideEmpty.is(":checked") && players === 0 && !favorites.includes(server.query) && !server.hasOwnProperty("last_success")) {
                // console.log(`empty [${players}] ${server.name}`)
                return false
            }

            if (checkHidePassworded.is(":checked") && server.visibility === 1) {
                // console.log(`pw [${server.visibility}] ${server.name}`)
                return false
            }

            if (checkMax100.is(":checked") && server.maxPlayers !== 100) {
                // console.log(`100 [${server.maxPlayers}] ${server.name}`)
                return false
            }

            if (checkIgnoreKeywords.is(":checked")) {
                const terms = ignoreWordsTextbox.val().split(",")
                for (let i = 0; i < terms.length; i++) {
                    const term = terms[i].toLowerCase().trim();
                    if (term && server.name.toLowerCase().includes(term)) {
                        // console.log(`term [${term}] ${server.name}`)
                        return false
                    }
                    if (term && termRegexes.hasOwnProperty(term) && server.name.match(termRegexes[term])) {
                        return false
                    }
                    if (term && customChecks.hasOwnProperty(term) && customChecks[term](server)) {
                        return false
                    }
                }
            }

            if (checkOnlyKeywords.is(":checked")) {
                const terms = onlyWordsTextbox.val().split(",")
                let containsAny = false
                let checkedAny = false
                for (let i = 0; i < terms.length; i++) {
                    const term = terms[i].toLowerCase().trim();
                    if (term) {
                        checkedAny = true
                    }
                    if (term && server.name.toLowerCase().includes(term)) {
                        // console.log(`not term [${term}] ${server.name}`)
                        containsAny = true
                        break
                    }
                    if (term && termRegexes.hasOwnProperty(term) && server.name.match(termRegexes[term])) {
                        containsAny = true
                        break
                    }
                    if (term && customChecks.hasOwnProperty(term) && customChecks[term](server)) {
                        containsAny = true
                        break
                    }
                }
                if (checkedAny && !containsAny) {
                    return false
                }
            }

            if (checkMapKeywords.is(":checked")) {
                const terms = mapWordsTextbox.val().split(",")
                const map = server.mapDisplay;
                let containsAny = false
                let checkedAny = false
                for (let i = 0; i < terms.length; i++) {
                    const term = terms[i].toLowerCase().trim();
                    if (term) {
                        checkedAny = true
                    }
                    if (term && map.toLowerCase().includes(term)) {
                        // console.log(`not term [${term}] ${server.name}`)
                        containsAny = true
                        break
                    }
                    if (term && termRegexes.hasOwnProperty(term) && map.match(termRegexes[term])) {
                        containsAny = true
                        break
                    }
                    if (term && customChecks.hasOwnProperty(term) && customChecks[term](server)) {
                        containsAny = true
                        break
                    }
                }
                if (checkedAny && !containsAny) {
                    return false
                }
            }

            if (!crossplayAny.is(":checked")) {
                if (crossplayEnabled.is(":checked") && !crossplayIs(server, "true")) {
                    return false
                }
                if (crossplayDisabled.is(":checked") && !crossplayIs(server, "false")) {
                    return false
                }
            }

            return true;
        });

        serverTable.on("draw.dt", function () {
            any = []
            seeding = []
            live = []
            serverTable.rows({"search": "applied"}).every(function () {
                const data = this.data();
                const server = ip2server[data[0]];
                const players = server?.players || server?.gamestate?.decoded?.players || server?.player_list?.length || 0;

                if (server.status.includes("S")) {
                    seeding.push(server)
                }
                if (server.status.includes("L") || server_vip.includes(server.query) && players <= 99 && players >= 40) {
                    live.push(server)
                }
                if (players >= 1 && players <= 99) {
                    any.push(server)
                }
            });
            btnConnectSeeding.prop("disabled", seeding.length === 0)
            $("#seeding-count").text(seeding.length + " servers")
            btnConnectPopulated.prop("disabled", live.length === 0)
            $("#populated-count").text(live.length + " servers")
            btnConnectAny.prop("disabled", any.length === 0)
            $("#any-count").text(any.length + " servers")

            updateShareLink()

            $('.tooltip').remove(); // remove hanging tooltips on table update
        })

        btnConnectSeeding.click(function () {
            let randomServer = seeding.sort(() => 0.5 - Math.random())[0];
            console.log(randomServer)
            document.getElementById("connect-" + randomServer.query).click()
        })
        btnConnectPopulated.click(function () {
            let randomServer = live.sort(() => 0.5 - Math.random())[0];
            console.log(randomServer)
            document.getElementById("connect-" + randomServer.query).click()
        });
        btnConnectAny.click(function () {
            let randomServer = any.sort(() => 0.5 - Math.random())[0];
            console.log(randomServer)
            document.getElementById("connect-" + randomServer.query).click()
        });

        let lastUpdatedTime;
        let ip2server = {}
        let any = []
        let seeding = []
        let live = []

        function formatDuration(duration, hideSec = false, includeMs, ignoreTime) {
            const years = duration.years();
            const months = duration.months();
            const days = duration.days();
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();
            const millis = duration.milliseconds();
            const format = [
                (years > 0 ? years + "y" : ""),
                (months > 0 ? months + "m" : ""),
                (days > 0 ? days + "d" : ""),
                (!ignoreTime && hours > 0 ? hours + "h" : ""),
                (!ignoreTime && (minutes > 0 || hours || hideSec) > 0 ? minutes + "m" : ""),
                (!ignoreTime && !hideSec && (seconds > 0 || minutes) > 0 ? seconds + "s" : ""),
                includeMs ? (millis > 0 ? millis + "ms" : "") : ""
            ].join(" ");

            if (format.trim() === "") {
                return "0s";
            }

            return format;
        }

        setInterval(function () {
            if (lastUpdatedTime) {
                const diff = moment().diff(moment(lastUpdatedTime));
                const duration = moment.duration(diff);
                const time = formatDuration(duration)
                $(".last-updated").text(time + " ago")
            }
        }, 100);

        function getMapImage(name, status) {
            name = name || "";

            if (status.includes("O")) {
                return "offline.jpg"
            }

            if (name.includes("Carentan")) {
                return "carentan.webp"
            } else if (name.includes("Foy")) {
                return "foy.webp"
            } else if (name.includes("Alamein")) {
                return "elalamein.webp"
            } else if (name.includes("Driel")) {
                return "driel.webp"
            } else if (name.includes("Hill 400")) {
                return "hill400.webp"
            } else if (name.includes("Hurtgen")) {
                return "hurtgenforest.webp"
            } else if (name.includes("Kharkov")) {
                return "kharkov.webp"
            } else if (name.includes("Kursk")) {
                return "kursk.webp"
            } else if (name.includes("Omaha")) {
                return "omahabeach.webp"
            } else if (name.includes("Purple")) {
                return "purpleheartlane.webp"
            } else if (name.includes("Remagen")) {
                return "remagen.webp"
            } else if (name.includes("Stalin")) {
                return "stalingrad.webp"
            } else if (name.includes("du Mont")) {
                return "stmariedumont.webp"
            } else if (name.includes("Eglise")) {
                return "stmereeglise.webp"
            } else if (name.includes("Utah")) {
                return "utahbeach.webp"
            } else if (name.includes("Mortain")) {
                return "mortain.webp"
            } else if (name.includes("Elsenborn")) {
                return "elsenborn.webp"
            } else {
                return "unknown.jpg"
            }
        }

        function updateShareLink() {
            const baseUrl = location.origin + location.pathname;
            const params = []

            if (!checkLatestOnly.is(":checked")) {
                params.push("latest_only=false")
            }
            if (checkHideEmpty.is(":checked")) {
                params.push("hide_e=true")
            }
            if (!checkHidePassworded.is(":checked")) {
                params.push("hide_pw=false")
            }
            if (!checkMax100.is(":checked")) {
                params.push("max_100=false")
            }
            if (!crossplayAny.is(":checked")) {
                params.push("crossplay=" + crossplayEnabled.is(":checked"))
            }

            const filter = $(".name-filter.selected").data("val");
            params.push("filter=" + filter)
            if (filter === "custom") {
                params.push("ignore=" + checkIgnoreKeywords.is(":checked"))
                params.push("ignore_words=" + ignoreWordsTextbox.val().trim().split(/\s*,\s*/).join())
                params.push("only=" + checkOnlyKeywords.is(":checked"))
                params.push("only_words=" + onlyWordsTextbox.val().trim().split(/\s*,\s*/).join())
            }
            if (checkMapKeywords.is(":checked") && mapWordsTextbox.val().trim()) {
                params.push("maps=" + checkMapKeywords.is(":checked"))
                params.push("maps_words=" + mapWordsTextbox.val().trim().split(/\s*,\s*/).join())
            }

            shareLink.val(baseUrl + "?" + params.join("&"))
        }

        const queryString = window.location.search;
        const query = {};
        const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }

        if (query.hasOwnProperty("latest_only")) {
            checkLatestOnly.prop("checked", query.latest_only.toLowerCase() === "true")
            checkLatestOnly.trigger("change")
        }
        if (query.hasOwnProperty("hide_pw")) {
            checkHidePassworded.prop("checked", !(query.hide_pw.toLowerCase() === "false"))
            checkHidePassworded.trigger("change")
        }
        if (query.hasOwnProperty("hide_e")) {
            checkHideEmpty.prop("checked", query.hide_e.toLowerCase() === "true")
            checkHideEmpty.trigger("change")
        }
        if (query.hasOwnProperty("max_100")) {
            checkMax100.prop("checked", !(query.max_100.toLowerCase() === "false"))
            checkMax100.trigger("change")
        }
        if (query.hasOwnProperty("crossplay")) {
            if (query.crossplay.toLowerCase() === "true") {
                crossplayEnabled.prop("checked", true)
            } else if (query.crossplay.toLowerCase() === "false") {
                crossplayDisabled.prop("checked", true)
            } else {
                crossplayAny.prop("checked", true)
            }
        }

        if (query.hasOwnProperty("filter")) {
            $(`.name-filter[data-val='${query.filter}']`).click()
        } else {
            $(".name-filter[data-val='en']").click()
        }

        const filter = $(".name-filter.selected").data("val");
        if (filter === "custom") {
            if (query.hasOwnProperty("ignore")) {
                checkIgnoreKeywords.prop("checked", !(query.ignore.toLowerCase() === "false"))
                checkIgnoreKeywords.trigger("change")
            }
            if (query.hasOwnProperty("ignore_words")) {
                ignoreWordsTextbox.val(query.ignore_words.trim().split(/\s*,\s*/).join(", "))
                ignoreWordsTextbox.trigger("keyup")
            }
            if (query.hasOwnProperty("only")) {
                checkOnlyKeywords.prop("checked", !(query.only.toLowerCase() === "false"))
                checkOnlyKeywords.trigger("change")
            }
            if (query.hasOwnProperty("only_words")) {
                onlyWordsTextbox.val(query.only_words.trim().split(/\s*,\s*/).join(", "))
                onlyWordsTextbox.trigger("keyup")
            }
        }

        if (query.hasOwnProperty("maps")) {
            checkMapKeywords.prop("checked", !(query.maps.toLowerCase() === "false"))
            checkMapKeywords.trigger("change")
        }
        if (query.hasOwnProperty("maps_words")) {
            mapWordsTextbox.val(query.maps_words.trim().split(/\s*,\s*/).join(", "))
            mapWordsTextbox.trigger("keyup")
        }

        const statusDesc = {
            O: "Offline",
            E: "Empty (0 pop)",
            P: "People (empty)",
            S: "Seeding (3-50)",
            L: "Live (40-91, no queue)",
            F: "Full (92-100, likely queue)",
        }
        const union = (arr) => {
            return [...new Set(arr.flat())]
        }

        function base64ToHex(base64) {
            try {
                const raw = atob(base64);
                let result = '';
                for (let i = 0; i < raw.length; i++) {
                    const hex = raw.charCodeAt(i).toString(16);
                    result += (hex.length === 2 ? hex : '0' + hex);
                }
                return result.toUpperCase();
            } catch (e) {
                return "Err: " + base64
            }
        }

        const hex2bin = (hex) => hex.split('').map(i =>
            parseInt(i, 16).toString(2).padStart(4, '0')).join('');

        function sortArrayOfObjects(items, getter) {
            const copy = JSON.parse(JSON.stringify(items));

            const sortFn = fn => {
                copy.sort((a, b) => {
                    a = fn(a)
                    b = fn(b)
                    return a === b ? 0 : a < b ? -1 : 1;
                });
            };

            getter.forEach(x => {
                const fn = typeof x === 'function' ? x : item => item[x];
                sortFn(fn);
            });

            return copy;
        }

        let socket = io('https://hllsb-socket.apps.mattw.io/');
        // let socket = io('localhost:3000');

        let scrolledToFindPlayerTable = false;
        if (query.hasOwnProperty("playerSearch")) {
            findPlayerTable.search(query.playerSearch)
        }
        socket.on("list-update", function (message) {
            let serversCopy = JSON.parse(JSON.stringify(message.servers));
            try {
                message.servers = sortArrayOfObjects(message.servers, [(item) => item.name])
            } catch (e) {
                message.servers = serversCopy;
            }
            console.log(message)

            lastUpdatedTime = message.time;

            try {
                ip2server = {}
                seeding = []
                live = []

                message.failures.forEach(server => message.servers.push(server));
                unknownMapNames = Object.keys(message.unknown_maps) || []

                const stats = {
                    players: {
                        total: 0,
                        official: 0,
                        community: 0,
                        dev: 0,
                        steam: 0,
                        nonSteam: 0,
                        unknownPlatform: 0,
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
                }

                function statsCount(server) {
                    if (server.status.includes("O")) {
                        stats.servers.offline += 1
                        return
                    }

                    const players = server?.players || server?.gamestate?.decoded?.players || server?.player_list?.length || 0;
                    const isOfficial = server?.gamestate?.decoded?.isOfficial || server?.name?.startsWith("HLL Official") || false;
                    const isDev = server?.name?.includes("DevQA") || server?.name?.includes("HLL Dev Team") || server?.name?.includes("QA Testing") ||
                        server?.name?.includes("HLL Playtest") || false;

                    const serverStats = stats.servers.online;
                    serverStats.total += 1
                    if (isDev) {
                        serverStats.dev += 1
                    } else if (isOfficial) {
                        serverStats.official += 1
                    } else {
                        serverStats.community += 1
                    }

                    if (server.hasOwnProperty("rules")) {
                        if (crossplayIs(server, "true")) {
                            serverStats.crossplay.on += 1
                        } else if (crossplayIs(server, "false")) {
                            serverStats.crossplay.off += 1
                        } else {
                            serverStats.crossplay.unknown += 1
                        }
                    } else {
                        serverStats.crossplay.unknown += 1
                    }

                    const gsMap = server?.gamestate?.decoded?.map;
                    const mapDecoded = gs.mapDecode[gsMap] || "Unknown (dev/old)";
                    if (!stats.mapCounts.hasOwnProperty(mapDecoded)) {
                        stats.mapCounts[mapDecoded] = {
                            servers: 1,
                            players: players,
                            list: [server]
                        }
                    } else {
                        stats.mapCounts[mapDecoded].servers += 1
                        stats.mapCounts[mapDecoded].players += players
                        stats.mapCounts[mapDecoded].list.push(server)
                    }

                    const gsMode = server?.gamestate?.decoded?.gamemode;
                    const modeDecoded = gs.modeDecode[gsMode] || "Unknown (dev/new)";
                    if (!stats.modeCounts.hasOwnProperty(modeDecoded)) {
                        stats.modeCounts[modeDecoded] = {
                            servers: 1,
                            players: players,
                            list: [server]
                        }
                    } else {
                        stats.modeCounts[modeDecoded].servers += 1
                        stats.modeCounts[modeDecoded].players += players
                        stats.modeCounts[modeDecoded].list.push(server)
                    }

                    const gsVersion = server?.gamestate?.decoded?.version;
                    const versionDecoded = gs.serverVersion[gsVersion] || "Unknown (dev/old)";
                    if (!stats.versionCounts.hasOwnProperty(versionDecoded)) {
                        stats.versionCounts[versionDecoded] = {
                            servers: 1,
                            players: players,
                            list: [server]
                        }
                    } else {
                        stats.versionCounts[versionDecoded].servers += 1
                        stats.versionCounts[versionDecoded].players += players
                        stats.versionCounts[versionDecoded].list.push(server)
                    }

                    if (!players) {
                        return
                    }

                    const playerStats = stats.players;
                    playerStats.total += players;
                    if (!server.player_list) {
                        playerStats.unknownPlatform += players;
                    } else {
                        if (isDev) {
                            playerStats.dev += players
                        } else if (isOfficial) {
                            playerStats.official += players
                        } else {
                            playerStats.community += players
                        }

                        server.player_list.forEach(player => {
                            if (!player.name && player.duration > 180) {
                                playerStats.nonSteam += 1
                            } else {
                                playerStats.steam += 1
                            }
                        })
                    }
                }

                const findPlayersRows = []
                const rows = [];
                const winServers = [];
                message.servers.forEach(server => {
                    ip2server[server.query] = server;

                    const players = server?.players || server?.gamestate?.decoded?.players || server?.player_list?.length || 0;

                    server.status = ""
                    if (players === 0) {
                        server.status += "E" // Empty
                    }
                    if (players >= 1 && players < 3) {
                        server.status += "P" // People (Empty)
                    }
                    if (players >= 3 && players <= 50) {
                        server.status += "S" // Seeding
                    }
                    if (players >= 40 && players <= 91) {
                        server.status += "L" // Populated
                    }
                    if (players > 91) {
                        server.status += "F" // Full
                    }
                    if (server.hasOwnProperty("last_success")) {
                        server.status = "O"
                    }

                    if (server.status.includes("S")) {
                        server.status_num = 10
                    } else if (server.status.includes("L")) {
                        server.status_num = 9
                    } else if (server.status.includes("F")) {
                        server.status_num = 8
                    } else if (server.status.includes("P")) {
                        server.status_num = 7
                    } else if (server.status.includes("E")) {
                        server.status_num = 6
                    }
                    if (server.status.includes("O")) {
                        server.status_num = 0
                    }

                    statsCount(server)

                    const query = server.query;
                    const connectUrl = `steam://connect/${query}?appid=686810`;

                    server.connect_url = connectUrl

                    server.mapDisplay = gs.determineDisplayMapName(server) || "undefined";
                    server.mapDisplayHtml = server.mapDisplay
                    if (unknownMapNames.includes(server.map)) {
                        server.mapDisplay = server.mapDisplay || server.map;
                        server.mapDisplayHtml = `<span class='unknown_map'>${server.mapDisplay}</span>`
                    }
                    if (server.status.includes("O")) {
                        server.mapDisplay = "Offline";
                        server.mapDisplayHtml = server.mapDisplay
                    }

                    const statuses = server.status.split("");
                    const tooltipLines = []
                    for (let i = 0; i < statuses.length; i++) {
                        tooltipLines.push(statusDesc[statuses[i]])
                    }

                    let runtime = ""
                    if (server.hasOwnProperty("map_change")) {
                        const changeTime = moment(server.map_change);
                        const duration = moment.duration(moment().diff(changeTime))
                        const warfareEndTime = moment(server.map_change).add(1.5, 'hour')
                        const warfareDurationUntilEnd = moment.duration(warfareEndTime.diff(moment()))
                        const skirmishEndTime = moment(server.map_change).add(30, 'minute')
                        const skirmishDurationUntilEnd = moment.duration(skirmishEndTime.diff(moment()))

                        let tooltipText;
                        let text;
                        if (server.mapDisplay.includes("Warfare") && duration.asMinutes() <= 92) {
                            tooltipText = "Map time remaining<br>(Warfare)"
                            text = `${formatDuration(warfareDurationUntilEnd, true)} left`
                        } else if (server.mapDisplay.includes("Skirmish") && duration.asMinutes() <= 32) {
                            tooltipText = "Map time remaining<br>(Skirmish)"
                            text = `${formatDuration(skirmishDurationUntilEnd, true)} left`
                        } else if (server.mapDisplay.includes("Offensive") && duration.asMinutes() <= 152) {
                            tooltipText = "Map time elapsed<br>(Offensive)"
                            text = `${formatDuration(duration, true)} elapsed`
                        } else {
                            tooltipText = "Map time elapsed<br>Same map more than once?"
                            text = `<span style="color:darkgoldenrod">${formatDuration(duration, true)} elapsed</span>`
                        }

                        runtime = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}"><i class="bi bi-clock-history"></i> ${text}</span>`

                        // Server died and the map likely won't change anytime soon
                        if (duration.asHours() >= 4 && players === 0) {
                            runtime = ""
                        }
                    }

                    let crossplay = ""
                    if (server.hasOwnProperty("rules")) {
                        let tooltipText;
                        let text;
                        if (crossplayIs(server, "true")) {
                            tooltipText = "Crossplay enabled: Steam+Windows+Epic"
                            text = "<span class='crossplay enabled'><i class=\"bi bi-controller\"></i><i class=\"bi bi-check2\"></i></span>"
                        } else if (crossplayIs(server, "false")) {
                            tooltipText = "Crossplay disabled"
                            text = "<span class='crossplay disabled'><i class=\"bi bi-controller\"></i><i class=\"bi bi-x-lg\"></i></span>"
                        } else {
                            tooltipText = "Crossplay unknown"
                            text = "<span class='crossplay unknown'><i class=\"bi bi-controller\"></i><i class=\"bi bi-question-lg\"></i></span>"
                        }

                        crossplay = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
                    }

                    const version = server?.gamestate?.decoded?.version;
                    let wrongVersion = ""
                    if (version && LATEST_SERVER_VERSION !== version) {
                        let text = `<span class="wrong-version"><i class="bi bi-exclamation-diamond"></i> ${gs.serverVersion[version] || version}</span>`
                        let tooltipText = `Server version does not match latest. This server is not joinable.`
                        wrongVersion = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
                    }

                    let wrongGameId = ""
                    if (server?.gameId !== 686810) {
                        let text = `<span class="wrong-gameid"><i class="bi bi-exclamation-diamond"></i> ${server?.gameId || "???"}</span>`
                        let tooltipText = `Server is not for the base game (686810).`
                        wrongGameId = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
                    }

                    let queues = ""
                    if (server?.gamestate?.decoded) {
                        const decoded = server?.gamestate?.decoded;
                        queues = `(${decoded?.currentVip}/${decoded?.maxVip}) VIP slots, (${decoded?.currentQueue} / ${decoded?.maxQueue}) in QUEUE`
                    }

                    let offline_time = ""
                    if (server.hasOwnProperty("last_success")) {
                        const changeTime = moment(server.last_success);
                        const duration = moment.duration(moment().diff(changeTime))

                        let tooltipText = "Time since last successful query";
                        let text = formatDuration(duration, true)

                        offline_time = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
                    }

                    let tooltipPlayers = ""
                    if (players === 0) {
                        tooltipPlayers = "Empty"
                    } else if (players > 0 && (server.player_list || []).length === 0) {
                        tooltipPlayers = "Failed players query"
                    } else if (players > 0 && (server.player_list || []).length > 0) {
                        tooltipPlayers = server.player_list.slice(0, 7).map(x => x?.name || "").join(", ");

                        if (server.player_list.length > 7) {
                            tooltipPlayers += `... and ${server.player_list.length - 7} more`
                        }
                    }

                    tooltipPlayers = tooltipPlayers.replaceAll('"', '&quot;')
                        .replaceAll('[', '')
                        .replaceAll(']', '')

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

                    const serverInfoHtml = `<div style="white-space: nowrap; text-overflow: ellipsis; min-width: 100px" class="server-info ${statuses.join(" ")}">
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

                    if (server.player_list) {
                        let thisServerNonSteamPlayers = 0;
                        server.player_list.forEach(player => {
                            // Steam players can have a blank name briefly when joining but quickly resolve.
                            // Non-Steam players always have a blank name and incorrect large duration time
                            if (!player.name && player.duration > 180) {
                                thisServerNonSteamPlayers += 1;
                            }

                            if (!player.name) {
                                return
                            }
                            let name = `<i class="bi bi-steam mr-4"></i><span style="margin-right:8px">${player.name.replaceAll("<", "&lt;")}</span><a class="steam-name-search" href="https://steamcommunity.com/search/users/#text=%22${encodeURI(player.name.replaceAll("=", "%3D"))}%22" target="_blank"><i class="bi bi-search"></i></a>`
                            findPlayersRows.push([
                                name,
                                {
                                    "display": formatDuration(moment.duration(player.duration, 'seconds')),
                                    "num": player.duration
                                },
                                server.name,
                                `<a data-for="${server.query}" class="btn btn-outline-secondary open-info" href="javascript:">Info</a> 
                                 <a id="connect-${server.query}" class="btn btn-outline-primary" href="${connectUrl}">Join</a>`,
                            ])
                        })

                        if (thisServerNonSteamPlayers > 0) {
                            winServers.push([
                                {
                                    "display": `<span data-bs-toggle="tooltip" data-bs-title="${tooltipPlayers || " "}" data-bs-html="true" class="player-count ${statuses.join(" ")}">${players}/${server.maxPlayers}</span>`,
                                    "num": Number(players)
                                },
                                {
                                    "display": `<i class="bi bi-controller mr-4"></i> ${thisServerNonSteamPlayers}`,
                                    "num": thisServerNonSteamPlayers
                                },
                                serverInfoHtml,
                            ])
                        }
                    }

                    rows.push([
                        // ip:query (hidden)
                        server.query,
                        // join button
                        `<a data-for="${server.query}" class="btn btn-outline-secondary open-info ${statuses.join(" ")}" href="javascript:">Info</a> 
                         <a id="connect-${server.query}" class="btn btn-outline-primary ${statuses.join(" ")}" href="${connectUrl}">Join</a>`,
                        // passworded (default hidden)
                        {
                            "display": server.visibility === 1 ? `<i class="bi bi-key-fill ${statuses.join(" ")}" style="color:rgb(255, 193, 7)"></i>` : "",
                            "num": server.visibility
                        },
                        // status s/p/e/f
                        {
                            "display": `<span class="badge ${statuses.join(" ")}" data-bs-toggle="tooltip" data-bs-title="${tooltipLines.join('<br>') || " "}" data-bs-html="true">
                                             ${server.status}</span>`,
                            "num": server.status_num
                        },
                        // players
                        {
                            "display": `<span data-bs-toggle="tooltip" data-bs-title="${tooltipPlayers || " "}" data-bs-html="true" class="player-count ${statuses.join(" ")}">${players}/${server.maxPlayers}</span>`,
                            "num": Number(players)
                        },
                        // server title and map
                        serverInfoHtml,
                        // vip button
                        {
                            display: `<i id="fav-${server.query}" class='bi bi-award vip ${server_vip.includes(server.query) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${server.query}' title='I have VIP here'></i>`,
                            num: function () {
                                return server_vip.includes(server.query) ? 1 : 0
                            }
                        },
                        // favorite button
                        {
                            display: `<i id="fav-${server.query}" class='bi bi-star fav ${favorites.includes(server.query) ? 'selected' : ''} ${statuses.join(" ")}' data-for='${server.query}' title='Favorite'></i>`,
                            num: function () {
                                return favorites.includes(server.query) ? 1 : 0
                            }
                        }
                    ])
                })

                serverTable.clear()
                serverTable.rows.add(rows).draw(false);
                serverTable.columns.adjust().draw(false);

                findPlayerTable.clear()
                findPlayerTable.rows.add(findPlayersRows).draw(false);
                findPlayerTable.columns.adjust().draw(false);

                if (query.hasOwnProperty("playerSearch") && !scrolledToFindPlayerTable) {
                    document.getElementById("find-a-player").scrollIntoView(true)
                    scrolledToFindPlayerTable = true
                }

                if (query.hasOwnProperty("debug")) {
                    $(".hex-debug").show()
                }

                winPlayerServerTable.clear()
                winPlayerServerTable.rows.add(winServers).draw(false);
                winPlayerServerTable.columns.adjust().draw(false);

                function percent(x, total) {
                    return Number(Number(x / total).toFixed(4) * 100).toFixed(2)
                }

                function sortObjectDesc(obj) {
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
                stats.mapCounts = sortObjectDesc(stats.mapCounts)
                stats.modeCounts = sortObjectDesc(stats.modeCounts)
                stats.versionCounts = sortObjectDesc(stats.versionCounts)

                // console.log(mapCounts, modeCounts, versionCounts)

                function makeList(groupTitle, list) {
                    const listItems = []
                    list.forEach((item) => {
                        listItems.push(`<li>${item.key} &mdash; ${item.value.players.toLocaleString()} players ${item.value.servers.toLocaleString()} servers</li>`)
                    })

                    return `<li>${groupTitle}<ul>${listItems.join("")}</ul></li>`
                }

                const serverStats = stats.servers.online;
                const playerStats = stats.players;

                const approxWindows = Math.trunc(Math.max(playerStats.steam * 0.06, 0))
                const approxEpic = Math.trunc(Math.max(playerStats.nonSteam - approxWindows, 0));

                $("#non-steam-approx").html(`
                    <li><i class="bi bi-windows"></i> ~${approxWindows.toLocaleString()} Windows players</li>
                    <li><i class="bi bi-controller"></i> ~${approxEpic.toLocaleString()} Epic Games players</li>`)

                $("#player-stats").html(`
                    <li>${playerStats.total.toLocaleString()} total players
                        <ul>
                            <li>${playerStats.steam.toLocaleString()} steam players (${percent(playerStats.steam, playerStats.total)}%)
                            </li>
                            <li>${playerStats.nonSteam.toLocaleString()} non-steam players (${percent(playerStats.nonSteam, playerStats.total)}%) 
                                <i class="bi bi-info-circle" data-bs-toggle="modal" data-bs-target="#winPlayersModal" style="cursor:pointer;color:cornflowerblue" title="Server breakdown"></i>
                            </li>
                            <li>${playerStats.unknownPlatform.toLocaleString()} 
                                unknown platform
                                (${percent(playerStats.unknownPlatform, playerStats.total)}%)
                                <i class="bi bi-info-circle" data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="Total from servers that the steam A2S_PLAYER query failed. Platform (steam or not) is determined if a player's name comes back blank from the players query."></i>
                            </li>
                            <li>${playerStats.official.toLocaleString()} on official servers (${percent(playerStats.official, playerStats.total)}%)</li>
                            <li>${playerStats.community.toLocaleString()} on community servers (${percent(playerStats.community, playerStats.total)}%)</li>
                            <li>${playerStats.dev.toLocaleString()} on pte/dev/qa servers (${percent(playerStats.dev, playerStats.total)}%)</li>
                        </ul>
                    </li>
                    <li>${serverStats.total.toLocaleString()} servers online
                        <ul>
                            <li>${serverStats.official.toLocaleString()} official servers (${percent(serverStats.official, serverStats.total)}%)</li>
                            <li>${serverStats.community.toLocaleString()} community servers (${percent(serverStats.community, serverStats.total)}%)</li>
                            <li>${serverStats.dev.toLocaleString()} pte/dev/qa servers (${percent(serverStats.dev, serverStats.total)}%)</li>
                            <li>${serverStats.crossplay.on.toLocaleString()} servers have crossplay on (${percent(serverStats.crossplay.on, serverStats.total)}%)</li>
                            <li>${serverStats.crossplay.off.toLocaleString()} servers have crossplay off (${percent(serverStats.crossplay.off, serverStats.total)}%)</li>
                            <li>${serverStats.crossplay.unknown.toLocaleString()} servers do not have crossplay status (${percent(serverStats.crossplay.unknown, serverStats.total)}%)</li>
                        </ul>
                    </li>
                    <li>${stats.servers.offline.toLocaleString()} servers offline (or address changed)</li>
                    <br>
                    
                    ${makeList("Mode Breakdown", stats.modeCounts)}
                    ${makeList("Map Breakdown", stats.mapCounts)}
                    ${makeList("Server Version Breakdown", stats.versionCounts)}
                `)
                tryUpdateInfoModal()
            } catch (e) {
                console.error(e)
            }
        })
    }

    $(document).ready(init)
}());
