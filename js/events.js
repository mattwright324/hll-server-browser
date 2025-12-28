import {controls, elements} from "dom";
import * as util from "util";

let enabledTooltips = false;

export function enableDynamicTooltips() {
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