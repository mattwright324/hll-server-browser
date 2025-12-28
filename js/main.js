import {controls, dom_ready, elements} from "dom";
import * as events from "events";
import * as util from "util";
import {Server} from "server";

(async function () {
    'use strict';

    const socket = io('https://hllsb-socket.apps.mattw.io/');
    // const socket = io('localhost:3000');

    window.data = {
        message: {},
        servers: {},
        serverMap: [],
    }

    try {
        await dom_ready();
        events.enableDynamicTooltips();
    } catch (e) {
        console.error("Failed to initialize:", e)
    }

    socket.on('list-update', message => {
        console.log("Socket [list-update]", message)

        const serversCopy = JSON.parse(JSON.stringify(message.servers));
        try {
            message.servers = util.sortArrayOfObjects(message.servers, [(item) => item.name])
        } catch (e) {
            message.servers = serversCopy;
        }
        const newData = {message: message, servers: [], serverMap: {}};

        const rows = []
        for (const data of [...message.servers, ...message.failures]) {
            const server = new Server(data);
            newData.servers.push(server);
            newData.serverMap[server.data.query] = server;
            rows.push(server.row_data)
        }
        window.data = newData;

        controls.serverTable.clear()
        controls.serverTable.rows.add(rows).draw(false);
        controls.serverTable.columns.adjust().draw(false);

        console.log("Data", newData)
    })
}());