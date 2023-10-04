(function () {
    'use strict';

    function init() {
        const serverTable = $("#server-table").DataTable({
            columns: [
                {
                    title: "",
                    className: "dt-nowrap"
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
                    title: "PW",
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
                    className: "dt-nowrap",
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
                "targets": 4
            }],
            order: [[1, 'desc'], [3, 'desc'], [4, 'desc']],
            lengthMenu: [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "All"]],
            deferRender: true,
            bDeferRender: true,
            pageLength: -1
        });

        const checkHidePassworded = $("#hide-passworded")
        const checkMax100 = $("#max-100-only")
        const checkIgnoreKeywords = $("#ignore-keywords")
        const ignoreWordsTextbox = $("#ignoreWords")

        let lastUpdatedTime;
        let seeding = []
        let populated = []

        setInterval(function () {
            if (lastUpdatedTime) {
                const time = moment(lastUpdatedTime).fromNow()
                console.log(time)
                $("#last-updated").text(time)
            }
        }, 100)

        // let socket = io('https://hell-let-loose-servers.herokuapp.com/');
        let socket = io('localhost:3000');

        socket.on("list-update", function (message) {
            console.log(message)

            lastUpdatedTime = message.time;

            try {
                const rows = []
                seeding = []
                populated = []
                for (let i = 0; i < message.servers.length; i++) {
                    const server = message.servers[i];
                    if (server.players >= 6 && server.players <= 50) {
                        seeding.push(server)
                    }
                    if (server.players >= 40 && server.players <= 85) {
                        populated.push(server)
                    }

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
                        `<a class="btn btn-outline-primary" href="steam://connect/${server.query}?appid=686810">Quick Join</a>`,
                        {"display": `<span class="badge ${server.status}">${server.status}</span>`, "num": server.status_num},
                        {"display": server.visibility === 1 ? `<i class="bi bi-key-fill" style="color:rgb(255, 193, 7)"></i>` : "", "num": server.visibility},
                        {"display": `${server.players} / ${server.maxPlayers}`, "num": Number(server.players)},
                        `${server.name}`
                    ])
                }

                serverTable.clear()
                serverTable.rows.add(rows).draw(false);
                serverTable.columns.adjust().draw(false);

                $("#join-seeding").prop("disabled", seeding.length === 0)
                $("#seeding-count").text(seeding.length + " servers")
                $("#join-populated").prop("disabled", seeding.length === 0)
                $("#populated-count").text(populated.length + " servers")
            } catch (e) {
                console.error(e)
            }
        })
    }

    $(document).ready(init)
}());
