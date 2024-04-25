(function () {
    'use strict';

    function init() {
        new ClipboardJS(".clipboard");

        const serverTable = $("#server-table").DataTable({
            dom: "i",
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
                    className: "dt-nowrap  dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {title: "Server"},
                {
                    title: "<i class='bi bi-award' title='VIP'></i>",
                    type: "num",
                    className: "dt-nowrap  dt-center",
                    render: {
                        _: 'display',
                        sort: 'num'
                    },
                },
                {
                    title: "<i class='bi bi-star-half' title='Favorite'></i>",
                    type: "num",
                    className: "dt-nowrap  dt-center",
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
            pageLength: -1
        });

        const findPlayerTable = $("#find-players-table").DataTable({
            columns: [
                {
                    title: "Player",
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

        const winPlayerServerTable = $("#winplayer-server-table").DataTable({
            dom: "i",
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
                    title: "Win Players",
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

        [checkHidePassworded, checkHideEmpty, checkMax100, checkIgnoreKeywords, checkOnlyKeywords, crossplayEnabled, crossplayAny, crossplayDisabled, checkMapKeywords].forEach(el => {
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
            try {
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
                const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
            } catch (e) {
                console.warn("Failed to init tooltips")
            }
        }

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
                only: "hll official"
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
        const playersTable = $("#player-table").DataTable({
            dom: "i",
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
            details.push(`<li><div class="property">Server IP: </div><div class="value">${info.query.split(":")[0]}</div></li>`)
            details.push(`<li><div class="property">Query Port: </div><div class="value">${info.query}</div></li>`)
            const statuses = info.status.split("");
            const statusLines = []
            for (let i = 0; i < statuses.length; i++) {
                statusLines.push(statusDesc[statuses[i]])
            }
            details.push(`<li><div class="property">Status(es): </div><div class="value">${statusLines.join(", ")}</div></li>`)
            if (info.status !== 'O') {
                details.push(`<li><div class="property">Player Count: </div><div class="value">${info.players} / ${info.maxPlayers}</div></li>`)
                if (info.player_list) {
                    let serverSteam = 0;
                    let serverWin = 0;
                    for (let i = 0; i < info.player_list.length; i++) {
                        if (!info.player_list[i].name && info.player_list[i].duration > 180) {
                            serverWin += 1;
                        } else {
                            serverSteam += 1;
                        }
                    }
                    details.push(`<li><div class="property">Platform Count: </div><div class="value"><i class="bi bi-steam mr-4"></i> ${serverSteam} : <i class="bi bi-windows mr-4"></i> ${serverWin}</div></li>`)
                }
                let map = mapName.hasOwnProperty(info.map) ? mapName[info.map] + ` — ${info.map}` :
                    `<span class='unknown_map'>${info.map}</span>`
                details.push(`<li><div class="property">Current Map: </div><div class="value">${map}</div></li>`)
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
                            nameDisplay = `<small class="text-muted"><i class="bi bi-windows mr-4"></i>Unnamed Windows Player</small>`
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

        const termRegexes = {
            "$regex_cn$": /([\u4e00-\u9fff\u3400-\u4dbf\ufa0e\ufa0f\ufa11\ufa13\ufa14\ufa1f\ufa21\ufa23\ufa24\ufa27\ufa28\ufa29\u3006\u3007]|[\ud840-\ud868\ud86a-\ud879\ud880-\ud887][\udc00-\udfff]|\ud869[\udc00-\udedf\udf00-\udfff]|\ud87a[\udc00-\udfef]|\ud888[\udc00-\udfaf])([\ufe00-\ufe0f]|\udb40[\udd00-\uddef])?/g
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

            if (checkHideEmpty.is(":checked") && server.players === 0 && !favorites.includes(server.query) && !server.hasOwnProperty("last_success")) {
                // console.log(`empty [${server.players}] ${server.name}`)
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
                }
                if (checkedAny && !containsAny) {
                    return false
                }
            }

            if (checkMapKeywords.is(":checked")) {
                const terms = mapWordsTextbox.val().split(",")
                const map = mapName[server.map] || server.map;
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
                }
                if (checkedAny && !containsAny) {
                    return false
                }
            }

            if (!crossplayAny.is(":checked")) {
                if (crossplayEnabled.is(":checked") && !JSON.stringify(server.rules || {}).includes("crossplayenabled")) {
                    return false
                }
                if (crossplayDisabled.is(":checked") && !JSON.stringify(server.rules || {}).includes("crossplaydisabled")) {
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

                if (server.status.includes("S")) {
                    seeding.push(server)
                }
                if (server.status.includes("L") || server_vip.includes(server.query) && server.players <= 99 && server.players >= 40) {
                    live.push(server)
                }
                if (server.players >= 1 && server.players <= 99) {
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
            initTooltip()
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
                $("#last-updated").text(time + " ago")
            }
        }, 100);

        const night = `<span class='night'>Night</span>`
        const mapName = {
            CT: `Carentan`,
            CT_N: `Carentan ${night}`,
            Driel: `Driel`,
            Driel_N: `Driel ${night}`,
            Driel_Day: `Driel Offensive`,
            DEV_C_Day_SKM: `Driel Skirmish Day`,
            DEV_C_Night_SKM: `Driel Skirmish ${night}`,
            DEV_C_SKM: `Driel Skirmish Dusk`,
            elalamein: `El Alamein`,
            elalamein_N: `El Alamein ${night}`,
            DEV_D_Day_SKM: `El Alamein Skirmish Day`,
            DEV_D_Night_SKM: `El Alamein Skirmish ${night}`,
            DEV_D_SKM: `El Alamein Skirmish Dusk`,
            Foy: `Foy`,
            Foy_N: `Foy ${night}`,
            Hill400: `Hill 400`,
            Hill400_N: `Hill 400 ${night}`,
            Hurtgen: `Hurtgen Forest`,
            Hurtgen_N: `Hurtgen Forest ${night}`,
            Kharkov: `Kharkov`,
            Kharkov_N: `Kharkov ${night}`,
            Kursk: `Kursk`,
            Kursk_N: `Kursk ${night}`,
            Omaha: `Omaha Beach`,
            Omaha_N: `Omaha Beach ${night}`,
            PHL: `Purple Heart Lane`,
            PHL_N: `Purple Heart Lane ${night}`,
            Remagen: `Remagen`,
            Remagen_N: `Remagen ${night}`,
            Stalin: `Stalingrad`,
            Stalin_N: `Stalingrad ${night}`,
            StMarie: `St Marie du Mont (SMDM)`,
            StMarie_N: `St Marie du Mont (SMDM) ${night}`,
            SME: `St Mere Eglise (SME)`,
            SME_N: `St Mere Eglise (SME) ${night}`,
            Utah: `Utah Beach`,
            Utah_N: `Utah Beach ${night}`,

            DEV_M_Night_SKM: `St Maria du Mont (SMDM) Skirmish ${night}`,
            DEV_M_Rain_SKM: `St Maria du Mont (SMDM) Skirmish Rain`,
            DEV_M_SKM: `St Maria du Mont (SMDM) Skirmish`,
            Mortain: `Mortain`,
            Mortain_O: `Mortain Overcast`,
            Mortain_SKM_Day: `Mortain Skirmish Day`,
            Mortain_SKM_Overcast: `Mortain Skirmish Overcast`,
        }

        function getMapImage(map) {
            const name = mapName[map] || "";
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
            } else {
                return "unknown.jpg"
            }
        }

        function updateShareLink() {
            const baseUrl = location.origin + location.pathname;
            const params = []

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

        let socket = io('https://hell-let-loose-servers-cc54717d86be.herokuapp.com/');
        // let socket = io('localhost:3000');

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

                let totalPlayers = 0;
                let officialPlayers = 0;
                let communityPlayers = 0;
                let steamPlayers = 0;
                let steamOfficialPlayers = 0;
                let steamCommunityPlayers = 0;
                let windowsPlayers = 0;
                let winOfficialPlayers = 0;
                let winCommunityPlayers = 0;
                let platformUnknownPlayers = 0;
                let totalServers = 0;
                let officialServers = 0;
                let communityServers = 0;
                let crossplayOn = 0;
                let crossplayOff = 0;
                let crossplayUnknown = 0;

                const findPlayersRows = []
                const rows = [];
                const winServers = [];
                message.servers.forEach(server => {
                    ip2server[server.query] = server;

                    server.status = ""
                    if (server.players === 0) {
                        server.status += "E" // Empty
                    }
                    if (server.players >= 1 && server.players < 3) {
                        server.status += "P" // People (Empty)
                    }
                    if (server.players >= 3 && server.players <= 50) {
                        server.status += "S" // Seeding
                    }
                    if (server.players >= 40 && server.players <= 91) {
                        server.status += "L" // Populated
                    }
                    if (server.players > 91) {
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

                    const query = server.query;
                    const game = `${server.query.split(":")[0]}:${server.port}`
                    const connectUrl = `steam://connect/${query}?appid=686810`;

                    server.connect_url = connectUrl

                    let map = mapName.hasOwnProperty(server.map) ? mapName[server.map] :
                        `<span class='unknown_map'>${server.map}</span>`
                    if (server.status.includes("O")) {
                        map = "Offline"
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
                        if (server.map.includes("SKM")) {
                            tooltipText = "Map time remaining<br>(Skirmish)"
                            text = `${formatDuration(skirmishDurationUntilEnd, true)} left`
                        } else if (duration.asMinutes() <= 92) {
                            tooltipText = "Map time remaining<br>(if warfare)"
                            text = `${formatDuration(warfareDurationUntilEnd, true)} left`
                        } else if (duration.asMinutes() <= 152) {
                            tooltipText = "Time passed 1h 30m"
                            text = "Offensive"
                        } else {
                            tooltipText = "Passed maximum possible runtime of 2h 30m (offensive)"
                            text = "Unknown"
                        }

                        runtime = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
                    }

                    totalServers += 1;
                    if (server.name.startsWith("HLL Official")) {
                        officialServers += 1
                    } else {
                        communityServers += 1;
                    }

                    let crossplay = ""
                    if (server.hasOwnProperty("rules")) {
                        const rulesString = JSON.stringify(server.rules);

                        let tooltipText;
                        let text;
                        if (rulesString.includes("crossplayenabled")) {
                            crossplayOn += 1;
                            tooltipText = "Crossplay enabled: Steam + Windows Store"
                            text = "<span class='crossplay enabled'><i class=\"bi bi-controller\"></i> Enabled</span>"
                        } else if (rulesString.includes("crossplaydisabled")) {
                            crossplayOff += 1;
                            tooltipText = "Crossplay disabled: Steam only or Windows Store only"
                            text = "<span class='crossplay disabled'><i class=\"bi bi-controller\"></i> Disabled</span>"
                        } else {
                            crossplayUnknown += 1;
                            tooltipText = "Crossplay unknown"
                            text = "<span class='crossplay unknown'><i class=\"bi bi-controller\"></i> Unknown</span>"
                        }

                        crossplay = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText || " "}">${text}</span>`
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
                    if (server.players === 0) {
                        tooltipPlayers = "Empty"
                    } else if (server.players > 0 && (server.player_list || []).length === 0) {
                        tooltipPlayers = "Failed players query"
                    } else if (server.players > 0 && (server.player_list || []).length > 0) {
                        tooltipPlayers = server.player_list.slice(0, 7).map(x => x?.name || "").join(", ");

                        if (server.player_list.length > 7) {
                            tooltipPlayers += `... and ${server.player_list.length - 7} more`
                        }
                    }

                    tooltipPlayers = tooltipPlayers.replaceAll('"', '&quot;')

                    totalPlayers += server.players;
                    if (server.name.startsWith("HLL Official")) {
                        officialPlayers += server.players;
                    } else {
                        communityPlayers += server.players;
                    }

                    if (!server.player_list && server.players) {
                        platformUnknownPlayers += server.players;
                    }

                    if (server.player_list) {
                        let thisServerWinPlayers = 0;
                        server.player_list.forEach(player => {

                            // Steam players can have a blank name briefly when joining but quickly resolve.
                            // Windows players always have a blank name and incorrect large duration time
                            if (!player.name && player.duration > 180) {
                                thisServerWinPlayers += 1;
                                windowsPlayers += 1
                                if (server.name.startsWith("HLL Official")) {
                                    winOfficialPlayers += 1;
                                } else {
                                    winCommunityPlayers += 1;
                                }
                            } else {
                                steamPlayers += 1
                                if (server.name.startsWith("HLL Official")) {
                                    steamOfficialPlayers += 1
                                } else {
                                    steamCommunityPlayers += 1;
                                }
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

                        if (thisServerWinPlayers > 0) {
                            winServers.push([
                                {
                                    "display": `<span data-bs-toggle="tooltip" data-bs-title="${tooltipPlayers || " "}" data-bs-html="true" class="player-count ${statuses.join(" ")}">${server.players}/${server.maxPlayers}</span>`,
                                    "num": Number(server.players)
                                },
                                {
                                    "display": `<i class="bi bi-windows mr-4"></i> ${thisServerWinPlayers}`,
                                    "num": thisServerWinPlayers
                                },
                                `<div style="white-space: nowrap; text-overflow: ellipsis; min-width: 100px" class="server-info ${statuses.join(" ")}">
                                    <div style="display:inline-block; height: 0px">
                                        <img class="map-icon ${map.includes("Night") ? "night" : ""}" src="./maps/${getMapImage(server.map)}">
                                    </div>
                                    <div style="display:inline-block">
                                        ${server.name}<br>
                                        <small class="text-muted">
                                            <span class="map-name">${map}</span>
                                            ${offline_time || runtime ? "<span class='separator'></span>" + (offline_time || runtime) : ""}
                                            ${crossplay ? "<span class='separator'></span><span class='separator'></span>" + crossplay : ""}
                                        </small>
                                        ${server.whois ? `<br>` + (server.whois.match("netname:.+\n") || [""])[0].replace('\n', '') : ""}
                                        ${server.whois ? `<br>` + (server.whois.match("country:.+\n") || [""])[0].replace('\n', '') : ""}
                                    </div>
                                 </div>`,
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
                            "display": `<span data-bs-toggle="tooltip" data-bs-title="${tooltipPlayers || " "}" data-bs-html="true" class="player-count ${statuses.join(" ")}">${server.players}/${server.maxPlayers}</span>`,
                            "num": Number(server.players)
                        },
                        // server title and map
                        `<div style="white-space: nowrap; text-overflow: ellipsis; min-width: 100px" class="server-info ${statuses.join(" ")}">
                            <div style="display:inline-block; height: 0px">
                                <img class="map-icon ${map.includes("Night") ? "night" : ""}" src="./maps/${getMapImage(server.map)}">
                            </div>
                            <div style="display:inline-block">
                                ${server.name}<br>
                                <small class="text-muted">
                                    <span class="map-name">${map}</span>
                                    ${offline_time || runtime ? "<span class='separator'></span>" + (offline_time || runtime) : ""}
                                    ${crossplay ? "<span class='separator'></span><span class='separator'></span>" + crossplay : ""}
                                </small>
                                ${server.whois ? `<br>` + (server.whois.match("netname:.+\n") || [""])[0].replace('\n', '') : ""}
                                ${server.whois ? `<br>` + (server.whois.match("country:.+\n") || [""])[0].replace('\n', '') : ""}
                            </div>
                         </div>`,
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

                winPlayerServerTable.clear()
                winPlayerServerTable.rows.add(winServers).draw(false);
                winPlayerServerTable.columns.adjust().draw(false);

                function percent(x, total) {
                    return Number(Number(x / total).toFixed(4) * 100).toFixed(2)
                }

                $("#player-stats").html(`
                    <li>${totalPlayers} total players
                        <ul>
                            <li>${steamPlayers} steam players (${percent(steamPlayers, totalPlayers)}%)
                                <ul hidden>
                                    <li>${steamOfficialPlayers} on official servers (${percent(steamOfficialPlayers, steamPlayers)}%)</li>
                                    <li>${steamCommunityPlayers} on community servers (${percent(steamCommunityPlayers, steamPlayers)}%)</li>
                                </ul>
                            </li>
                            <li>${windowsPlayers} windows players (${percent(windowsPlayers, totalPlayers)}%) 
                                <i class="bi bi-info-circle" data-bs-toggle="modal" data-bs-target="#winPlayersModal" style="cursor:pointer;color:cornflowerblue" title="Server breakdown"></i>
                                <ul hidden>
                                    <li>${winOfficialPlayers} on official servers (${percent(winOfficialPlayers, windowsPlayers)}%)</li>
                                    <li>${winCommunityPlayers} on community servers (${percent(winCommunityPlayers, windowsPlayers)}%)</li>
                                </ul>
                            </li>
                            <li>${platformUnknownPlayers} 
                                <span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="Steam player_list query failed">unknown platform</span>
                                (${percent(platformUnknownPlayers, totalPlayers)}%)
                            </li>
                            <li>${officialPlayers} on official servers (${percent(officialPlayers, totalPlayers)}%)</li>
                            <li>${communityPlayers} on community servers (${percent(communityPlayers, totalPlayers)}%)</li>
                        </ul>
                    </li>
                    
                    <li>${totalServers} total servers
                        <ul>
                            <li>${crossplayOn} servers have crossplay on (${percent(crossplayOn, totalServers)}%)</li>
                            <li>${crossplayOff} servers have crossplay off (${percent(crossplayOff, totalServers)}%)</li>
                            <li>${crossplayUnknown} servers do not have crossplay status (${percent(crossplayUnknown, totalServers)}%)</li>
                            <li>${officialServers} official servers (${percent(officialServers, totalServers)}%)</li>
                            <li>${communityServers} community servers (${percent(communityServers, totalServers)}%)</li>
                        </ul>
                    </li>
                `)
                initTooltip()
                tryUpdateInfoModal()
            } catch (e) {
                console.error(e)
            }
        })
    }

    $(document).ready(init)
}());
