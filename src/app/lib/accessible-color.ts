function hexToRgb(hex: string) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function srgbToLinear(c: number) {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getReadableTextColor(bgHex: string): "#000000" | "#ffffff" {
    const Lbg = relativeLuminance(bgHex);

    // contrast with white
    const contrastWhite = (1.0 + 0.05) / (Lbg + 0.05);

    // contrast with black
    const contrastBlack = (Lbg + 0.05) / 0.05;

    return contrastWhite >= contrastBlack ? "#ffffff" : "#000000";
}
