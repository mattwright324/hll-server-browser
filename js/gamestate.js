const versions = [
    // 2023.06.22-2024.03.21 Exact version unknown
    {display: "v14.?", gs_version: 24371034,},
    // 2024.08.28 https://store.steampowered.com/news/app/686810/view/4589818379024009615
    {display: "v15.2", gs_version: 572092818},
    // 2024.09.11 https://discord.com/channels/316459644476456962/322320603350827010/1283412694397091993
    {display: "v15.2.1", gs_version: 1945600328,},
    // 2024.10.17 https://store.steampowered.com/news/app/686810/view/4544786821145411328
    {display: "v15.3", gs_version: 2386721110,},
    // 2024.11.27 https://store.steampowered.com/news/app/686810/view/4471607136529416231
    {display: "v16", gs_version: 3988232635,},
    // 2025.01.02 https://discord.com/channels/316459644476456962/322320603350827010/1324332287185129535
    {display: "v16.0.1", gs_version: 757054685,},
    // 2025.01.29 https://discord.com/channels/316459644476456962/322320603350827010/1334161814446936106
    {display: "v16.0.2", gs_version: 2194511626,},
    // 2025.04.02 https://store.steampowered.com/news/app/686810/view/528716440049550888
    {display: "v17", gs_version: 1421582404,},
    // 2025.04.08 https://store.steampowered.com/news/app/686810/view/528717074312201249
    {display: "v17.0.1", gs_version: 3648679879,},
    // 2025.06.25 https://www.hellletloose.com/blog/dev-brief-205-patch-17-1-changelog
    {display: "v17.1", gs_version: 2378492222,},
    // 2025.07.03 https://discord.com/channels/316459644476456962/322320603350827010/1390263490475724894
    {display: "v17.1.1", gs_version: 1167549499,},
    // 2025.10.07 https://www.hellletloose.com/blog/update-18-changelog
    {display: "v18", gs_version: 1597335087, changelist: 1028608},
    // 2025.10.12 https://www.hellletloose.com/blog/update-18-hotfix-1
    {display: "v18.0.1", gs_version: 4070365318, changelist: 1036381},
    // 2025.10.28 https://www.hellletloose.com/blog/server-and-stability-statement-update-18
    {display: "v18.0.2", gs_version: 3608556217, changelist: 1039888},
    // 2025.11.11 https://discord.com/channels/316459644476456962/322320603350827010/1437807802138624105
    {display: "v18.0.3", gs_version: 4256193000, changelist: 1046112},
    // 2025.12.03 https://www.hellletloose.com/blog/update-19-changelog
    {display: "v19", gs_version: 2320779165, changelist: 1062385},
    // 2025.12.15 https://store.steampowered.com/news/app/686810/view/650337184176406580
    {display: "v19.0.1", gs_version: 3657783074, changelist: 1065184},
    // 2025.12.18 https://discord.com/channels/316459644476456962/322320603350827010/1451169629656453282
    {display: "v19.0.2", gs_version: 1710849786, changelist: 1067107},
    // 2026.02.11 https://discord.com/channels/316459644476456962/322320603350827010/1471100130424782948
    {display: "v19.0.3", gs_version: 1234858027, changelist: 1069878},
]

export const LATEST_VERSION = versions[versions.length - 1];
export const LATEST_GS_VERSION = LATEST_VERSION.gs_version;

export function getVersionDisplay(server) {
    const gsVersion = server.gs_decoded?.version;
    const changelist = server.rules?.["Changelist_s"];

    for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        if (version.changelist === changelist || version.gs_version === gsVersion) {
            return version.display;
        }
    }

    return null;
}

export function getChangelistDiff(server) {
    const changelist = server.rules?.["Changelist_s"];
    if (changelist && LATEST_VERSION.changelist) {
        return changelist - LATEST_VERSION.changelist;
    }
    return null;
}

export const determine = {
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
        18: "Tobruk",
        19: "Smolensk",
    },
    modeDecode: {
        2: "Warfare",
        3: "Offensive",
        7: "Skirmish",
        8: "Conquest"
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
        DEV_R: "Stalingrad",
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
        DEV_O: "Tobruk",
        DEV_P: "Juno Beach",
        DEV_Q: "Smolensk",
    },

    mapDisplayName: function (server) {
        const decodedGs = server?.gs_decoded?.decoded;
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
            return steamMap;
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

export function decode(gsBase64) {
    const hex = base64ToHex(gsBase64);
    const bin = hex2bin(hex);

    const bits = []
    const sections = []
    const descs = []
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
    readBin(4, "Game mode");
    readBin(8, "???", "yellowgreen");

    readBin(16, "???", "yellowgreen");
    readBin(32, "Build/Version");
    readBin(7, "Players");
    readBin(1, "Official", "cornflowerblue", val => val === 1);

    readBin(1, "_", "gray") === 1;
    readBin(7, "Curr VIP");

    readBin(1, "???", "yellowgreen") === 1;
    readBin(7, "Max VIP");

    readBin(2, "???", "yellowgreen");
    readBin(3, "Cur Que");
    readBin(3, "Max Que");

    readBin(4, "???", "yellowgreen");
    readBin(1, "Crss Play", "cornflowerblue", val => val === 1);
    readBin(3, "Off. Attk");
    readBin(8, "Map");
    readBin(4, "???", "yellowgreen");
    readBin(4, "Time o Day");
    readBin(8, "Weather");
    readBin(8, "Match Time (Min)");
    readBin(11, "???", "yellowgreen");
    readBin(1, "Dyn Wthr Disabled", "cornflowerblue", val => val === 1);
    readBin(4, "Warmup Time (Min)");
    readBin(8, "???", "yellowgreen");

    readBin(4, "Time?", "yellowgreen");
    readBin(4, "Time?", "yellowgreen");
    readBin(4, "Time?", "yellowgreen");
    readBin(4, "Time?", "yellowgreen");
    readBin(21, "_", "yellowgreen");
    readBin(3, "Allies Score");
    readBin(29, "_", "yellowgreen");
    readBin(3, "Axis Score");
    readBin(24, "_", "yellowgreen");

    if (bin2) {
        readBin(bin2.length, "Remaining", "red")
    }

    return {
        bits: bits,
        sections: sections,
        descs: descs,
    }
}