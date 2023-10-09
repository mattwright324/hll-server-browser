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
            order: [[6, 'desc'], [3, 'desc'], [4, 'desc'], [5, 'desc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1
        });

        let favorites = []
        if (localStorage && localStorage.getItem("favorites")) {
            favorites = JSON.parse(localStorage.favorites);
        }

        const shareLink = $("#shareLink")
        const btnConnectSeeding = $("#join-seeding");
        const btnConnectPopulated = $("#join-populated");
        const btnConnectAny = $("#join-any");
        const checkHidePassworded = $("#hide-passworded");
        const checkMax100 = $("#max-100-only");
        const checkIgnoreKeywords = $("#ignore-keywords");
        const ignoreWordsTextbox = $("#ignoreWords");
        const checkOnlyKeywords = $("#only-keywords");
        const onlyWordsTextbox = $("#onlyWords");

        [checkHidePassworded, checkMax100, checkIgnoreKeywords, checkOnlyKeywords].forEach(el => {
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

        function initTooltip() {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
        }

        const commonIgnore = "event, training, test, team17, dev team"
        const commonIgnoreOfficial = `${commonIgnore}, hll official`
        const euOnly = "(eu, [eu, eu], euro, eu/, /eu, /en, eng/, en/, english, exd, ww, [taw, wth"
        const frOnly = "fr o, french, [fr, fr/, /fr"
        const cnOnly = "cn, kook, violet, qq"
        const gerOnly = "german, ger mic, .de, de/, [ger, ger/, /ger, lwj, deu, ♦ GER, aut"
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
                ignore: `${commonIgnoreOfficial}, ${frOnly}`,
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

            if (draw) {
                serverTable.draw()
            }
            updateShareLink()
        })

        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            const server = ip2server[data[0]];
            if (!server) {
                // console.log('null', server)
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
                }
            }

            if (checkOnlyKeywords.is(":checked")) {
                const terms = onlyWordsTextbox.val().split(",")
                let containsAny = false
                let checkedAny = false
                for (let i = 0; i < terms.length; i++) {
                    const term = terms[i].toLowerCase().trim();
                    if (term) { checkedAny = true }
                    if (term && server.name.toLowerCase().includes(term)) {
                        // console.log(`not term [${term}] ${server.name}`)
                        containsAny = true
                        break
                    }
                }
                if (checkedAny && !containsAny) {
                    return false
                }
            }

            return true;
        });

        serverTable.on("draw.dt", function () {
            any = []
            seeding = []
            live = []
            serverTable.rows({"search": "applied"}).every( function () {
                const data = this.data();
                const server = ip2server[data[0]];

                if (server.status.includes("S")) {
                    seeding.push(server)
                }
                if (server.status.includes("L")) {
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

        function formatDuration(duration, hideSec=false, includeMs, ignoreTime) {
            const years = duration.years();
            const months = duration.months();
            const days = duration.days();
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();
            const millis = duration.milliseconds();
            const format = [
                (years > 0 ? years + " years" : ""),
                (months > 0 ? months + " months" : ""),
                (days > 0 ? days + " days" : ""),
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
            Foy: `Foy`,
            Foy_N: `Foy ${night}`,
            NewMap_1: `Driel`,
            NewMap_1_N: `Driel ${night}`,
            NewMap_0: `El Alamein`,
            NewMap_0_N: `El Alamein ${night}`,
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
        }

        function getMapImage(map) {
            if (map.includes("CT")) {
                return "carentan.webp"
            } else if (map.includes("Foy")) {
                return "foy.webp"
            } else if (map.includes("NewMap_0")) {
                return "elalamein.webp"
            } else if (map.includes("NewMap_1")) {
                return "driel.webp"
            } else if (map.includes("Hill400")) {
                return "hill400.webp"
            } else if (map.includes("Hurtgen")) {
                return "hurtgenforest.webp"
            } else if (map.includes("Kharkov")) {
                return "kharkov.webp"
            } else if (map.includes("Kursk")) {
                return "kursk.webp"
            } else if (map.includes("Omaha")) {
                return "omahabeach.webp"
            } else if (map.includes("PHL")) {
                return "purpleheartlane.webp"
            } else if (map.includes("Remagen")) {
                return "remagen.webp"
            } else if (map.includes("Stalin")) {
                return "stalingrad.webp"
            } else if (map.includes("StMarie")) {
                return "stmariedumont.webp"
            } else if (map.includes("SME")) {
                return "stmereeglise.webp"
            } else if (map.includes("Utah")) {
                return "utahbeach.webp"
            } else {
                return "unknown.jpg"
            }
        }

        function updateShareLink() {
            const baseUrl = location.origin + location.pathname;
            const params = []

            if (!checkHidePassworded.is(":checked")) {
                params.push("hide_pw=false")
            }
            if (!checkMax100.is(":checked")) {
                params.push("max_100=false")
            }

            const filter = $(".name-filter.selected").data("val");
            params.push("filter=" + filter)
            if (filter === "custom") {
                params.push("ignore=" + checkIgnoreKeywords.is(":checked"))
                params.push("ignore_words=" + ignoreWordsTextbox.val().trim().split(/\s*,\s*/).join())
                params.push("only=" + checkOnlyKeywords.is(":checked"))
                params.push("only_words=" + onlyWordsTextbox.val().trim().split(/\s*,\s*/).join())
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
        if (query.hasOwnProperty("max_100")) {
            checkMax100.prop("checked", !(query.max_100.toLowerCase() === "false"))
            checkMax100.trigger("change")
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

        const statusDesc = {
            E: "Empty (0 pop)",
            P: "People (empty)",
            S: "Seeding (3-50)",
            L: "Live (40-91, no queue)",
            F: "Full (92-100, likely queue)",
        }

        let socket = io('https://hell-let-loose-servers-cc54717d86be.herokuapp.com/');
        // let socket = io('localhost:3000');

        socket.on("list-update", function (message) {
            console.log(message)

            lastUpdatedTime = message.time;

            try {
                ip2server = {}
                seeding = []
                live = []

                const rows = []
                for (let i = 0; i < message.servers.length; i++) {
                    const server = message.servers[i];
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

                    if (server.status.includes("S")) {
                        server.status_num = 3
                    } else if (server.status.includes("L")) {
                        server.status_num = 2
                    } else if (server.status.includes("F")) {
                        server.status_num = 1
                    } else if (server.status.includes("P")) {
                        server.status_num = 1
                    }

                    const query = server.query;
                    const game = `${server.query.split(":")[0]}:${server.port}`
                    const connectUrl = `steam://connect/${query}?appid=686810`;
                    // const connectUrl = `steam://launch/686810//connect/${query}`;

                    const map = mapName.hasOwnProperty(server.map) ? mapName[server.map] :
                        `<span class='unknown_map'>${server.map}</span>`

                    const statuses = server.status.split("");
                    const tooltipLines = []
                    for (let i = 0; i < statuses.length; i++) {
                        tooltipLines.push(statusDesc[statuses[i]])
                    }

                    let runtime = ""
                    if (server.hasOwnProperty("map_change")) {
                        const changeTime = moment(server.map_change);
                        const duration = moment.duration(moment().diff(changeTime))
                        const warfareEndTime = changeTime.add(1.5, 'hour')
                        const durationUntilEnd = moment.duration(warfareEndTime.diff(moment()))

                        let tooltipText;
                        let text;
                        if (duration.asMinutes() <= 92) {
                            tooltipText = "Map time remaining<br>(if warfare)"
                            text = `${formatDuration(durationUntilEnd, true)} left`
                        } else if (duration.asMinutes() <= 152) {
                            tooltipText = "Time passed 1h 30m"
                            text = "Offensive"
                        } else {
                            tooltipText = "Passed maximum possible runtime of 2h 30m (offensive)"
                            text = "Unknown"
                        }

                        runtime = `<span data-bs-html="true" data-bs-toggle="tooltip" data-bs-title="${tooltipText}">${text}</span>`
                    }

                    rows.push([
                        // ip:query (hidden)
                        server.query,
                        // join button
                        `<a id="connect-${server.query}" class="btn btn-outline-primary" href="${connectUrl}">Quick Join</a>`,
                        // passworded (default hidden)
                        {"display": server.visibility === 1 ? `<i class="bi bi-key-fill" style="color:rgb(255, 193, 7)"></i>` : "", "num": server.visibility},
                        // status s/p/e/f
                        {
                            "display": `<span class="badge ${statuses.join(" ")}" data-bs-toggle="tooltip" data-bs-title="${tooltipLines.join('<br>')}" data-bs-html="true">
                                             ${server.status}</span>`,
                            "num": server.status_num
                        },
                        // players
                        {"display": `${server.players}/${server.maxPlayers}`, "num": Number(server.players)},
                        // server title and map
                        `<div style="white-space: nowrap; text-overflow: ellipsis; min-width: 100px">
                            <div style="display:inline-block; height: 0px">
                                <img class="map-icon" src="./maps/${getMapImage(server.map)}">
                            </div>
                            <div style="display:inline-block">
                                ${server.name}<br>
                                <small class="text-muted"><span>${map}</span>${runtime ? "<span class='separator'></span>" + runtime : ""}</small>
                            </div>
                         </div>`,
                        // favorite button
                        {
                            display: `<i id="fav-${server.query}" class='bi bi-star fav ${favorites.includes(server.query) ? 'selected':''}' data-for='${server.query}' title='Favorite'></i>`,
                            num: function () {
                                return favorites.includes(server.query) ? 1 : 0
                            }
                        }
                    ])
                }

                serverTable.clear()
                serverTable.rows.add(rows).draw(false);
                serverTable.columns.adjust().draw(false);
            } catch (e) {
                console.error(e)
            }
        })
    }

    $(document).ready(init)
}());
