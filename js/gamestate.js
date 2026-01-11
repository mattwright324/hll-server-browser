export const LATEST_SERVER_VERSION = 1710849786;
export const determine = {
    serverVersion: {
        24371034: "v14.?",
        572092818: "v15.2",
        1945600328: "v15.2.1",
        2386721110: "v15.3",
        3988232635: "v16",
        757054685: "v16.0.1",
        2194511626: "v16.0.2",
        1421582404: "v17",
        3648679879: "v17.0.1",
        2378492222: "v17.1",
        1167549499: "v17.1.1",
        1597335087: "v18",
        4070365318: "v18.0.1",
        3608556217: "v18.0.2",
        4256193000: "v18.0.3",
        2320779165: "v19",
        3657783074: "v19.0.1",
        1710849786: "v19.0.2",
    },
    changeListVersion: {
        1028608: "v18",
        1036285: "v18 (Test Branch)",
        1036381: "v18.0.1",
        1039888: "v18.0.2",
        1046112: "v18.0.3",
        1062385: "v19",
        1065184: "v19.0.1",
        1067107: "v19.0.2",
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
        18: "Tobruk",
        19: "Smolensk",
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
    readBin(8,"???", "yellowgreen");

    readBin(4,"Time?", "yellowgreen");
    readBin(4,"Time?", "yellowgreen");
    readBin(4,"Time?", "yellowgreen");
    readBin(4,"Time?", "yellowgreen");
    readBin(21,"_", "yellowgreen");
    readBin(3,"Allies Score");
    readBin(29,"_", "yellowgreen");
    readBin(3,"Axis Score");
    readBin(24,"_", "yellowgreen");

    if (bin2) {
        readBin(bin2.length, "Remaining", "red")
    }

    return {
        bits: bits,
        sections: sections,
        descs: descs,
    }
}