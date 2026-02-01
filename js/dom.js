/**
 * Wait for the DOM to be ready.
 * Alternate to $(document).ready()
 */
export const doc_ready =  async () => {
    return new Promise(resolve => {
        if (document.readyState !== "loading") {
            resolve();
        } else {
            document.addEventListener("DOMContentLoaded", resolve);
        }
    })
}

let enabledTooltips = false;

/**
 * Listener to dynamically create tooltips for elements at hover time.
 * Significantly more efficient than creating all tooltips at page load and constantly recreating them on dynamically changing pages.
 */
export function enable_bs_tooltips() {
    if (enabledTooltips) {
        return
    }
    enabledTooltips = true;

    console.log("Enabling dynamic tooltips");

    document.addEventListener('mouseover', function (e) {
        const target = e.target.closest('[data-bs-toggle="tooltip"]');
        if (target && !target.hasAttribute("bs-tt-added")) {
            target.setAttribute("bs-tt-added", true);
            const tooltip = new bootstrap.Tooltip(target);
            tooltip.show();
        }
    })
}

/**
 * Store all DOM elements and controls here.
 */
export const controls = {}
export const elements = {}

let readyState;
let readyPromise;

/**
 * Extension of doc_ready() to load required DOM elements and controls.
 */
export const dom_ready = async () => {
    if (readyState === 'ready') {
        return;
    }
    if (readyState === 'loading') {
        return readyPromise;
    }
    readyState = 'loading';

    return readyPromise = dom_load();
}

const dom_load = async () => {
    await doc_ready();

    enable_bs_tooltips();

    new ClipboardJS(".clipboard");
    controls.shareLink = document.getElementById("shareLink");

    controls.btnConnectSeeding = document.getElementById("join-seeding");
    controls.btnConnectLive = document.getElementById("join-populated");
    controls.checkLatestOnly = document.getElementById("latest-only");
    controls.checkHidePassword = document.getElementById("hide-passworded");
    controls.checkMax100 = document.getElementById("max-100-only");
    controls.checkIgnoreKeywords = document.getElementById("ignore-keywords");
    controls.ignoreWordsTextbox = document.getElementById("ignoreWords");
    controls.checkOnlyKeywords = document.getElementById("only-keywords");
    controls.onlyWordsTextbox = document.getElementById("onlyWords");
    controls.crossplayEnabled = document.getElementById("crossplayEnabled");
    controls.crossplayAny = document.getElementById("crossplayAny");
    controls.crossplayDisabled = document.getElementById("crossplayDisabled");
    controls.checkMapKeywords = document.getElementById("map-keywords");
    controls.mapWordsTextbox = document.getElementById("mapWords");

    controls.serverTable = new DataTable("#server-table", {
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
        // drawCallback: function (settings) {
        //     var api = this.api();
        //     var rows = api.rows({page: 'current'}).nodes()
        //     var last = null;
        //
        //     api.column(0, {page: 'current'})
        //         .data()
        //         .each(function (ip, i) {
        //             if (last !== ip) {
        //                 const server = ip2server[ip];
        //
        //                 let hex = "", bin = "";
        //                 if (server?.gamestate?.raw && query.hasOwnProperty("debug")) {
        //                     hex = base64ToHex(server?.gamestate?.raw);
        //                     bin = hex2bin(hex);
        //
        //                     let bits = []
        //                     let sections = []
        //                     let descs = []
        //                     let bin2 = bin;
        //
        //                     function readBin(len, desc, color, func) {
        //                         color = color || "cornflowerblue";
        //                         const bitStr = bin2.slice(0, len);
        //                         bits.push(`<td style="color:${color};border:2px dashed ${color};text-wrap: nowrap">${bitStr.split("").reverse().join("").replaceAll(/(\d{4})/g, '$1 ').trim().split("").reverse().join("")}</td>`)
        //                         descs.push(`<td style="color:${color};border:2px dashed ${color}">${desc}</td>`)
        //                         const value = parseInt(bitStr, 2);
        //                         bin2 = bin2.slice(len)
        //                         sections.push(`<td style="color:${color};border:2px dashed ${color}">${func ? func(value) : value}</td>`)
        //                         return value;
        //                     }
        //
        //                     readBin(2, "???", "yellowgreen");
        //                     readBin(2, "_", "gray");
        //                     const gamemode = readBin(4, "Game mode");
        //
        //                     // readBin(1, "_", "gray");
        //                     const foo1 = readBin(8, "???", "yellowgreen");
        //
        //                     readBin(16, "???", "yellowgreen");
        //                     const version = readBin(32, "Build/Version");
        //                     const players = readBin(7, "Players");
        //                     const official = readBin(1, "Official", "cornflowerblue", val => val === 1);
        //
        //                     readBin(1, "_", "gray") === 1;
        //                     const currentVips = readBin(7, "Curr VIP");
        //
        //                     readBin(1, "???", "yellowgreen") === 1;
        //                     const maxVips = readBin(7, "Max VIP");
        //
        //                     readBin(2, "???", "yellowgreen");
        //                     const currentQueue = readBin(3, "Cur Que");
        //                     const maxQueue = readBin(3, "Max Que");
        //
        //                     readBin(4, "???", "yellowgreen");
        //                     const crossplay = readBin(1, "Crss Play", "cornflowerblue", val => val === 1);
        //                     const attackers = readBin(3, "Off. Attk");
        //                     const map = readBin(8, "Map");
        //                     readBin(4, "???", "yellowgreen");
        //                     const timeOfDay = readBin(4, "Time o Day");
        //                     const weather = readBin(8, "Weather");
        //                     readBin(8, "Match Time (Min)");
        //                     readBin(11, "???", "yellowgreen");
        //                     readBin(1, "Dyn Wthr Disabled", "cornflowerblue", val => val === 1);
        //                     readBin(4, "Warmup Time (Min)");
        //                     readBin(8,"???", "yellowgreen");
        //
        //                     readBin(8,"Time?", "yellowgreen");
        //                     readBin(8,"Time?", "yellowgreen");
        //                     readBin(21,"_", "gray");
        //                     readBin(3,"Allies Score");
        //                     readBin(29,"_", "gray");
        //                     readBin(3,"Axis Score");
        //                     readBin(24,"_", "gray");
        //
        //                     if (bin2) {
        //                         readBin(bin2.length, "Remaining", "red")
        //                     }
        //
        //                     // ${bin.replaceAll(/(\d{4})/g, '$1 ')}<br>
        //                     // ${hex.replaceAll(/(\w{2})/g, '$1 ')}<br>
        //
        //                     $(rows).eq(i).after(`<tr>
        //                                 <td colspan="7">
        //                                     <small class="text-muted" style="font-family: Consolas, monospace">
        //                                         <table class="bit-table">
        //                                         <tbody>
        //                                         <tr>${bits.join('')}</tr>
        //                                         <tr>${sections.join('')}</tr>
        //                                         <tr>${descs.join('')}</tr>
        //                                         </tbody>
        //                                         </table>
        //                                         Map & Mode:
        //                                             ${gs.mapDecode[map]}
        //                                             ${gs.modeDecode[gamemode]}
        //                                             ${gamemode === 3 ? gs.offAttackSide[attackers] : ""}
        //                                             ${weather !== 1 ? gs.weatherDecode[weather] : ""}
        //                                             ${timeOfDay !== 1 ? gs.timeOfDayDecode[timeOfDay] : ""}
        //                                         <br>VIP:
        //                                             [${currentVips} / ${maxVips}]
        //                                         <br>Queue:
        //                                             [${currentQueue} / ${maxQueue}]
        //                                     </small>
        //                                 </td>
        //                             </tr>`)
        //
        //                     last = ip;
        //                 }
        //             }
        //         })
        // }
    });

    controls.btnConnectSeeding = document.getElementById("join-seeding");
    elements.seedingCount = document.getElementById("seeding-count");
    controls.btnConnectLive = document.getElementById("join-live");
    elements.liveCount = document.getElementById("live-count");

    let seeding = []
    let live = []

    controls.serverTable.on("draw.dt", function () {
        $('.tooltip').remove(); // remove hanging tooltips on table update

        seeding = []
        live = []

        controls.serverTable.rows({"search": "applied"}).every(function () {
            const rowData = this.data();
            const server = data.serverMap[rowData[0]];
            if (server.status.includes("S")) {
                seeding.push(server)
            }
            if (server.status.includes("L") || server.is_vip && server.players <= 99 && server.players >= 40) {
                live.push(server)
            }
        });

        if (seeding.length === 0) {
            controls.btnConnectSeeding.setAttribute("disabled", "disabled")
        } else {
            controls.btnConnectSeeding.removeAttribute("disabled")
        }
        elements.seedingCount.innerText = seeding.length + " servers";

        if (live.length === 0) {
            controls.btnConnectLive.setAttribute("disabled", "disabled")
        } else {
            controls.btnConnectLive.removeAttribute("disabled")
        }
        elements.liveCount.innerText = live.length + " servers";

        // updateShareLink()
    })

    function addTo(key, server) {
        let value = []
        if (localStorage && localStorage.getItem(key)) {
            value = JSON.parse(localStorage[key]);
            value.push(server);
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    function removeFrom(key, server) {
        let value = []
        if (localStorage && localStorage.getItem(key)) {
            value = JSON.parse(localStorage[key]);
            value = value.filter(s => s !== server);
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    document.addEventListener("click", function (e) {
        const target = e.target.closest('i');
        if (!target) return;

        const fav = target.classList.contains("fav");
        const vip = target.classList.contains("vip");
        if (fav || vip) {
            const key = fav ? "favorites" : "server_vip";
            const server = target.getAttribute("data-for");
            if (target.classList.contains("selected")) {
                removeFrom(key, server)
            } else {
                addTo(key, server);
            }

            target.classList.toggle("selected");
            controls.serverTable.draw();
        }
    })

    console.log("Loaded [controls:", controls, "] [elements:", elements, "]")
}