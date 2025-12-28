export function percent(x, total) {
    return Number(Number(x / total).toFixed(4) * 100).toFixed(2)
}

export function sortArrayOfObjects(items, getter) {
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

/**
 *
 * @param duration
 * @param hideSec
 * @param includeMs
 * @param ignoreTime
 * @returns {string}
 */
export function formatDuration(duration, hideSec = false, includeMs, ignoreTime) {
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