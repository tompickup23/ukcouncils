/** The templates every chart draws. The thumb is only for charts with a marks only form. */
export const TEMPLATE_KEYS = ["inline", "og", "portrait"];
/** The card templates, in the order a card set renders them. */
export const CARD_KEYS = ["og", "portrait"];
export const TEMPLATES = {
    inline: {
        key: "inline", W: 600, H: 0, pad: 4, card: false, keyBeside: false, minText: 19, plotH: 300,
        font: { brand: 0, title: 30, label: 20, value: 26, axis: 19, source: 19, stat: 76, statLabel: 24, perspective: 22 }
    },
    og: {
        key: "og", W: 1200, H: 630, pad: 56, card: true, keyBeside: true, minText: 19, plotH: 0,
        font: { brand: 24, title: 40, label: 22, value: 26, axis: 20, source: 19, stat: 132, statLabel: 30, perspective: 28 }
    },
    thumb: {
        key: "thumb", W: 160, H: 64, pad: 2, card: false, thumb: true, keyBeside: false, minText: 0, plotH: 60,
        // Sizes only for layout arithmetic; a thumb draws no text.
        font: { brand: 0, title: 0, label: 8, value: 8, axis: 8, source: 8, stat: 0, statLabel: 0, perspective: 0 }
    },
    portrait: {
        key: "portrait", W: 1080, H: 1350, pad: 73, card: true, keyBeside: false, minText: 30, plotH: 0,
        font: { brand: 36, title: 60, label: 32, value: 40, axis: 30, source: 30, stat: 220, statLabel: 44, perspective: 40 }
    }
};
