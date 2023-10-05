(function () {
    'use strict';

    function init() {
        const serverTable = $("#server-table").DataTable({
            columns: [
                {
                    title: "IP",
                    className: "dt-nowrap",
                    visible: false
                },
                {
                    title: "",
                    className: "dt-nowrap"
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
                {title: "Server"}
            ],
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
            }, {
                "width": "100%",
                "targets": 5
            }],
            order: [[3, 'desc'], [4, 'desc'], [5, 'desc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1
        });

        const btnConnectSeeding = $("#join-seeding");
        const btnConnectPopulated = $("#join-populated");
        const checkHidePassworded = $("#hide-passworded");
        const checkMax100 = $("#max-100-only");
        const checkIgnoreKeywords = $("#ignore-keywords");
        const ignoreWordsTextbox = $("#ignoreWords");

        [checkHidePassworded, checkMax100, checkIgnoreKeywords].forEach(el => {
            el.change(() => {
                serverTable.draw()

                serverTable.column(2).visible(!checkHidePassworded.is(":checked"))
            })
        })
        ignoreWordsTextbox.on('keyup', () => serverTable.draw())

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

            return true;
        });

        serverTable.on("draw.dt", function () {
            seeding = []
            populated = []
            serverTable.rows({"search": "applied"}).every( function () {
                const data = this.data();
                const server = ip2server[data[0]];

                if (server.status.includes("S")) {
                    seeding.push(server)
                }
                if (server.status.includes("P")) {
                    populated.push(server)
                }
            });
            btnConnectSeeding.prop("disabled", seeding.length === 0)
            $("#seeding-count").text(seeding.length + " servers")
            btnConnectPopulated.prop("disabled", populated.length === 0)
            $("#populated-count").text(populated.length + " servers")
        })

        btnConnectSeeding.click(function () {
            let randomServer = seeding.sort(() => 0.5 - Math.random())[0];
            console.log(randomServer)

            document.getElementById("connect-" + randomServer.query).click()
        })
        btnConnectPopulated.click(function () {
            let randomServer = populated.sort(() => 0.5 - Math.random())[0];
            console.log(randomServer)

            document.getElementById("connect-" + randomServer.query).click()
        })

        let lastUpdatedTime;
        let ip2server = {}
        let seeding = []
        let populated = []

        function formatDuration(duration, includeMs, ignoreTime) {
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
                (!ignoreTime && minutes > 0 ? minutes + "m" : ""),
                (!ignoreTime && seconds > 0 ? seconds + "s" : ""),
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
                console.log(time)
                $("#last-updated").text(time + " ago")
            }
        }, 100);

        function getMapImage(map) {
            if (map.includes("CT")) {
                return "carentan.webp"
            } else if (map.includes("Foy")) {
                return "foy.webp"
            } else if (map.includes("NewMap_1")) {
                return "elalamein.webp"
            } else if (map.includes("NewMap_0")) {
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

        let socket = io('https://hell-let-loose-servers-cc54717d86be.herokuapp.com/');
        // let socket = io('localhost:3000');

        socket.on("list-update", function (message) {
            console.log(message)

            lastUpdatedTime = message.time;

            try {
                ip2server = {}
                seeding = []
                populated = []

                const rows = []
                for (let i = 0; i < message.servers.length; i++) {
                    const server = message.servers[i];
                    ip2server[server.query] = server;

                    server.status = ""
                    if (server.players < 5) {
                        server.status += "E" // Empty
                    }
                    if (server.players >= 5 && server.players <= 50) {
                        server.status += "S" // Seeding
                    }
                    if (server.players >= 40 && server.players <= 90) {
                        server.status += "P" // Populated
                    }
                    if (server.players > 90) {
                        server.status += "F" // Full
                    }

                    if (server.status.includes("S")) {
                        server.status_num = 3
                    } else if (server.status.includes("P")) {
                        server.status_num = 2
                    } else if (server.status.includes("F")) {
                        server.status_num = 1
                    } else if (server.status.includes("E")) {
                        server.status_num = 1
                    }

                    rows.push([
                        server.query,
                        `<a id="connect-${server.query}" class="btn btn-outline-primary" href="steam://connect/${server.query}?appid=686810">Quick Join</a>`,
                        {"display": server.visibility === 1 ? `<i class="bi bi-key-fill" style="color:rgb(255, 193, 7)"></i>` : "", "num": server.visibility},
                        {"display": `<span class="badge ${server.status}">${server.status}</span>`, "num": server.status_num},
                        {"display": `${server.players}/${server.maxPlayers}`, "num": Number(server.players)},
                        `<div style="white-space: nowrap"><div style="display:inline-block; height: 0px"><img class="map-icon" src="./maps/${getMapImage(server.map)}"></div>
                         <div style="display:inline-block">${server.name}<br><small class="text-muted">${server.map}</small></div></div>`
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
