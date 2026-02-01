import {controls, dom_ready, elements} from "dom";
import * as dom from "dom";
import {StatsCounter} from "stats";
import * as util from "util";
import {Server} from "server";

(async function () {
    'use strict';

    const socket = io('https://hllsb-socket.apps.mattw.io/');
    // const socket = io('localhost:3000');

    window.data = {
        message: {},
        servers: [],
        serverMap: {},
    }

    try {
        await dom_ready();
        dom.enable_bs_tooltips();
    } catch (e) {
        console.error("Failed to initialize:", e)
    }

    const stats = new StatsCounter();
    let lastUpdatedTime = 0;

    socket.on('list-update', message => {
        console.log("Socket [list-update]", message)

        const serversCopy = JSON.parse(JSON.stringify(message.servers));
        try {
            message.servers = util.sortArrayOfObjects(message.servers, [(item) => item.name])
        } catch (e) {
            message.servers = serversCopy;
        }
        const newData = {message: message, servers: [], serverMap: {}};

        stats.reset();
        const rows = []
        for (const data of [...message.servers, ...message.failures]) {
            const server = new Server(data);
            newData.servers.push(server);
            newData.serverMap[server.data.query] = server;
            rows.push(server.row_data);

            stats.count(server);
        }
        window.data = newData;

        document.getElementById("player-stats").innerHTML = stats.to_html();

        controls.serverTable.clear()
        controls.serverTable.rows.add(rows).draw(false);
        controls.serverTable.columns.adjust().draw(false);

        console.log("Data", newData)
        lastUpdatedTime = message.time;
    })

    setInterval(function () {
        if (lastUpdatedTime) {
            const diff = moment().diff(moment(lastUpdatedTime));
            const duration = moment.duration(diff);
            const time = util.formatDuration(duration)
            $(".last-updated").text(time + " ago")
        }
    }, 100);
}());