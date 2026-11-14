export declare const VERSION = "0.6.0";
export declare const tokens: {
    readonly color: {
        readonly light: {
            readonly bg: "#ffffff";
            readonly "bg-subtle": "#f5f6f7";
            readonly "bg-card": "#ffffff";
            readonly border: "#dbdfe3";
            readonly "border-strong": "#c2c8ce";
            readonly text: "#171b1f";
            readonly "text-muted": "#545c63";
            readonly "text-faint": "#616970";
            readonly ground: "#0f1317";
            readonly "ground-ink": "#f4f6f7";
            readonly "ground-muted": "#98a3ac";
            readonly "accent-ink": "#ffffff";
            readonly positive: "#1f6f4f";
            readonly warning: "#8a5a10";
            readonly critical: "#b42318";
            readonly "series-1": "#166ea5";
            readonly "series-2": "#b6550f";
            readonly "series-3": "#6e24da";
            readonly "series-4": "#9d1c5c";
            readonly "series-neutral": "#6b7280";
            readonly "series-neutral-soft": "#8b939c";
            readonly "tooltip-bg": "#111827";
            readonly "tooltip-fg": "#ffffff";
        };
        readonly dark: {
            readonly bg: "#0f1317";
            readonly "bg-subtle": "#171c21";
            readonly "bg-card": "#141a1f";
            readonly border: "#2a3138";
            readonly "border-strong": "#3d464e";
            readonly text: "#f4f6f7";
            readonly "text-muted": "#b6c0c8";
            readonly "text-faint": "#98a3ac";
            readonly ground: "#05080a";
            readonly "ground-ink": "#f4f6f7";
            readonly "ground-muted": "#98a3ac";
            readonly "accent-ink": "#0f1317";
            readonly positive: "#6fcf9a";
            readonly warning: "#f0b03e";
            readonly critical: "#f2857a";
            readonly "series-1": "#5599cc";
            readonly "series-2": "#cf7a48";
            readonly "series-3": "#966bfe";
            readonly "series-4": "#f83b9b";
            readonly "series-neutral": "#9aa2ab";
            readonly "series-neutral-soft": "#7b838c";
            readonly "tooltip-bg": "#e6edf3";
            readonly "tooltip-fg": "#0d1117";
        };
    };
    readonly sites: {
        readonly ukdemographics: {
            readonly deep: "#4338ca";
            readonly bright: "#7b74f2";
            readonly wash: "#eeeefc";
            readonly darkWash: "#1c1b3a";
            readonly name: "UK Demographics";
            readonly domain: "ukdemographics.co.uk";
        };
        readonly ukelections: {
            readonly deep: "#6b5334";
            readonly bright: "#e3d9c3";
            readonly wash: "#f6f2ea";
            readonly darkWash: "#221d14";
            readonly name: "UK Elections";
            readonly domain: "ukelections.co.uk";
        };
        readonly ukfoodhygiene: {
            readonly deep: "#1f5c4a";
            readonly bright: "#3fb492";
            readonly wash: "#edf6f3";
            readonly darkWash: "#0e2620";
            readonly name: "UK Food Hygiene Ratings";
            readonly domain: "ukfoodhygiene.co.uk";
        };
        readonly ukschoolholidaydates: {
            readonly deep: "#8a5a10";
            readonly bright: "#f0b03e";
            readonly wash: "#fdf3e3";
            readonly darkWash: "#2b1f0c";
            readonly name: "UK School Holiday Dates";
            readonly domain: "ukschoolholidaydates.co.uk";
        };
        readonly asylumstats: {
            readonly deep: "#2f5773";
            readonly bright: "#82abcb";
            readonly wash: "#eef3f7";
            readonly darkWash: "#122430";
            readonly name: "Asylum Stats";
            readonly domain: "asylumstats.co.uk";
        };
        readonly aidoge: {
            readonly deep: "#1c6e8a";
            readonly bright: "#63c3dc";
            readonly wash: "#e4eff4";
            readonly darkWash: "#123441";
            readonly name: "AI DOGE";
            readonly domain: "aidoge.co.uk";
        };
        readonly ukcounciltax: {
            readonly deep: "#23664f";
            readonly bright: "#94d7b5";
            readonly wash: "#edf6f0";
            readonly darkWash: "#112d25";
            readonly name: "UK Council Tax";
            readonly domain: "ukcounciltax.co.uk";
        };
        readonly councilintel: {
            readonly deep: "#0a5f70";
            readonly bright: "#3fc8dd";
            readonly wash: "#e8f7fa";
            readonly darkWash: "#2a3f45";
            readonly name: "Council Intel";
            readonly domain: "councilintel.co.uk";
        };
    };
    readonly skins: {
        readonly about: "A skin per site, beside its accent triple: a paper triple (paper, warm paper, line) for each theme, a display scale that reaches hero size, a display face with an italic slot and the body face, a section rhythm, a radius pair and a motion set (one easing, two durations under 300 ms, both set to 0ms by a reduced motion guard), and, where a kit colour fails on the skin's paper, an override of that colour. A site entry names its register and inherits that register's skin; an editorial entry gives its own values, each quoted in $meta.sources.skins. A record entry may carry its own paper, radius and overrides where the site's own stylesheet holds them (Council Intel), each quoted in $meta.sources.skins; a record entry without them reproduces the kit exactly. Keys listed in proposed were derived by scripts/derive-skin-dark.mjs, not read from the site, and wait on the owner.";
        readonly registers: {
            readonly record: {
                readonly about: "For the data sites: restrained, dense, colour kept for data. Every value is one the kit already ships, so a record site's output does not change.";
                readonly skin: {
                    readonly paper: {
                        readonly light: {
                            readonly paper: "#ffffff";
                            readonly warm: "#f5f6f7";
                            readonly line: "#dbdfe3";
                        };
                        readonly dark: {
                            readonly paper: "#0f1317";
                            readonly warm: "#171c21";
                            readonly line: "#2a3138";
                        };
                    };
                    readonly display: {
                        readonly "1": "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)";
                        readonly "2": "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)";
                        readonly hero: "clamp(2rem, 1.55rem + 2vw, 3rem)";
                    };
                    readonly face: {
                        readonly display: "\"Source Serif 4\", Georgia, \"Times New Roman\", serif";
                        readonly italic: "\"Source Serif 4\", Georgia, \"Times New Roman\", serif";
                        readonly italicStyle: "normal";
                        readonly sans: "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif";
                    };
                    readonly section: "4.5rem";
                    readonly radius: {
                        readonly radius: "10px";
                        readonly "radius-sm": "6px";
                    };
                    readonly motion: {
                        readonly ease: "cubic-bezier(0.16, 1, 0.3, 1)";
                        readonly fast: "160ms";
                        readonly base: "200ms";
                    };
                };
            };
            readonly editorial: {
                readonly about: "For UK AI, Lancashire AI and Tour de France Lancashire: tinted paper, display type at hero scale with an italic, a wide section rhythm, more motion. The three already share this skeleton (RETHINK_2026-11.md section 3.1), so each entry gives its own values and the register adds none.";
            };
        };
        readonly desk: {
            readonly about: "A desk is a dark ground band inside a light page, in both themes: its ground, ink, muted text, rule, the three state colours drawn on it and each state's ink on its badge ground. A skin that has one lists its values under desk; generated CSS sets them as --ground, --ground-ink, --ground-muted, --ground-rule, --ground-positive and so on, and a [data-ground=\"desk\"] rule points the kit's names at them, so text, rules and a chart in css mode inside the band take the desk's values. names maps each kit name to a desk key, to another kit name (kit:accent-bright), or to the kit's dark value of a name (dark:series-1): the series and neutrals on the desk are the kit's dark set, which is validated for a dark ground. There is no wash on the desk, so accent-wash is the ground.";
            readonly names: {
                readonly bg: "ground";
                readonly "bg-subtle": "ground";
                readonly "bg-card": "ground";
                readonly text: "ink";
                readonly "text-muted": "muted";
                readonly "text-faint": "muted";
                readonly border: "rule";
                readonly "border-strong": "rule";
                readonly positive: "positive";
                readonly warning: "warning";
                readonly critical: "critical";
                readonly accent: "kit:accent-bright";
                readonly "accent-ink": "ground";
                readonly "accent-wash": "ground";
                readonly "series-1": "dark:series-1";
                readonly "series-2": "dark:series-2";
                readonly "series-3": "dark:series-3";
                readonly "series-4": "dark:series-4";
                readonly "series-neutral": "dark:series-neutral";
                readonly "series-neutral-soft": "dark:series-neutral-soft";
            };
        };
        readonly sites: {
            readonly ukdemographics: {
                readonly register: "record";
            };
            readonly ukelections: {
                readonly register: "record";
            };
            readonly ukfoodhygiene: {
                readonly register: "record";
            };
            readonly ukschoolholidaydates: {
                readonly register: "record";
            };
            readonly asylumstats: {
                readonly register: "record";
            };
            readonly aidoge: {
                readonly register: "record";
            };
            readonly ukcounciltax: {
                readonly register: "record";
            };
            readonly councilintel: {
                readonly register: "record";
                readonly paper: {
                    readonly light: {
                        readonly paper: "#fafaf8";
                        readonly warm: "#f1f2ef";
                        readonly line: "#d9dde0";
                    };
                    readonly dark: {
                        readonly paper: "#263035";
                        readonly warm: "#2e393f";
                        readonly line: "#404c53";
                    };
                };
                readonly radius: {
                    readonly radius: "4px";
                    readonly "radius-sm": "3px";
                };
                readonly overrides: {
                    readonly light: {
                        readonly "bg-card": "#fafaf8";
                        readonly text: "#15191c";
                        readonly "text-muted": "#5c6670";
                        readonly "border-strong": "#b9c0c6";
                        readonly "series-neutral-soft": "#818891";
                    };
                    readonly dark: {
                        readonly "bg-card": "#263035";
                        readonly text: "#eef1f2";
                        readonly "text-muted": "#a9b2b9";
                        readonly "text-faint": "#a2adb6";
                        readonly "border-strong": "#525f68";
                        readonly accent: "#5fd0e2";
                        readonly critical: "#f79d94";
                    };
                };
                readonly proposed: readonly ["overrides.light.series-neutral-soft"];
                readonly desk: {
                    readonly light: {
                        readonly ground: "#0d2b33";
                        readonly ink: "#eef4f5";
                        readonly muted: "#9fb6bc";
                        readonly rule: "#1f4650";
                        readonly positive: "#43b386";
                        readonly warning: "#e2a93b";
                        readonly critical: "#ef6a5f";
                        readonly "positive-ink": "#b7ead3";
                        readonly "positive-bg": "#1b4a3a";
                        readonly "warning-ink": "#ffe4a8";
                        readonly "warning-bg": "#4f3a0e";
                        readonly "critical-ink": "#ffc9c3";
                        readonly "critical-bg": "#5a1f19";
                    };
                    readonly dark: {
                        readonly ground: "#08191e";
                        readonly ink: "#eef4f5";
                        readonly muted: "#93a8ae";
                        readonly rule: "#1b3a42";
                        readonly positive: "#43b386";
                        readonly warning: "#e2a93b";
                        readonly critical: "#ef6a5f";
                        readonly "positive-ink": "#b7ead3";
                        readonly "positive-bg": "#1b4a3a";
                        readonly "warning-ink": "#ffe4a8";
                        readonly "warning-bg": "#4f3a0e";
                        readonly "critical-ink": "#ffc9c3";
                        readonly "critical-bg": "#5a1f19";
                    };
                };
            };
            readonly ukai: {
                readonly register: "editorial";
                readonly name: "UK Artificial Intelligence";
                readonly domain: "ukartificialintelligence.co.uk";
                readonly accent: {
                    readonly deep: "#255848";
                    readonly bright: "#87ae91";
                    readonly wash: "#e4e9dc";
                    readonly darkWash: "#1e2928";
                };
                readonly paper: {
                    readonly light: {
                        readonly paper: "#f8f6ef";
                        readonly warm: "#eeece2";
                        readonly line: "#d5d9cc";
                    };
                    readonly dark: {
                        readonly paper: "#10171a";
                        readonly warm: "#182124";
                        readonly line: "#29363a";
                    };
                };
                readonly display: {
                    readonly "1": "27px";
                    readonly "2": "clamp(36px, 4.4vw, 57px)";
                    readonly hero: "clamp(70px, 7.6vw, 106px)";
                };
                readonly face: {
                    readonly display: "\"Newsreader\", Georgia, \"Times New Roman\", serif";
                    readonly italic: "\"Newsreader\", Georgia, \"Times New Roman\", serif";
                    readonly italicStyle: "italic";
                    readonly sans: "\"Manrope\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif";
                };
                readonly section: "96px";
                readonly radius: {
                    readonly radius: "12px";
                    readonly "radius-sm": "3px";
                };
                readonly motion: {
                    readonly ease: "cubic-bezier(0.2, 0.8, 0.2, 1)";
                    readonly fast: "180ms";
                    readonly base: "250ms";
                };
                readonly overrides: {
                    readonly light: {
                        readonly "series-neutral-soft": "#818891";
                    };
                };
                readonly proposed: readonly ["paper.dark", "accent.darkWash", "overrides.light.series-neutral-soft"];
            };
            readonly lancashireai: {
                readonly register: "editorial";
                readonly name: "Lancashire AI";
                readonly domain: "lancashireai.co.uk";
                readonly accent: {
                    readonly deep: "#9d2235";
                    readonly bright: "#c17480";
                    readonly wash: "#f3e5e1";
                    readonly darkWash: "#2c2025";
                };
                readonly paper: {
                    readonly light: {
                        readonly paper: "#faf6f0";
                        readonly warm: "#f2ebe0";
                        readonly line: "#e5dcd0";
                    };
                    readonly dark: {
                        readonly paper: "#181419";
                        readonly warm: "#221c23";
                        readonly line: "#382f38";
                    };
                };
                readonly display: {
                    readonly "1": "22px";
                    readonly "2": "clamp(30px, 4.4vw, 46px)";
                    readonly hero: "clamp(44px, 5.6vw, 80px)";
                };
                readonly face: {
                    readonly display: "\"Fraunces\", Georgia, \"Times New Roman\", serif";
                    readonly italic: "\"Fraunces\", Georgia, \"Times New Roman\", serif";
                    readonly italicStyle: "italic";
                    readonly sans: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif";
                };
                readonly section: "108px";
                readonly radius: {
                    readonly radius: "16px";
                    readonly "radius-sm": "10px";
                };
                readonly motion: {
                    readonly ease: "cubic-bezier(0.2, 0.8, 0.2, 1)";
                    readonly fast: "180ms";
                    readonly base: "250ms";
                };
                readonly overrides: {
                    readonly light: {
                        readonly "series-neutral-soft": "#818891";
                    };
                };
                readonly proposed: readonly ["paper.dark", "accent.bright", "accent.darkWash", "overrides.light.series-neutral-soft"];
            };
            readonly tourdefrancelancashire: {
                readonly register: "editorial";
                readonly name: "Tour de France Lancashire";
                readonly domain: "tourdefrancelancashire.co.uk";
                readonly accent: {
                    readonly deep: "#c8102e";
                    readonly bright: "#db6175";
                    readonly wash: "#f7e4dd";
                    readonly darkWash: "#311c23";
                };
                readonly paper: {
                    readonly light: {
                        readonly paper: "#fbf6ec";
                        readonly warm: "#f4eedf";
                        readonly line: "#e2d8c3";
                    };
                    readonly dark: {
                        readonly paper: "#1a1318";
                        readonly warm: "#251b22";
                        readonly line: "#3d2d37";
                    };
                };
                readonly display: {
                    readonly "1": "clamp(1.25rem, 2vw, 1.6rem)";
                    readonly "2": "clamp(1.8rem, 3.6vw, 2.9rem)";
                    readonly hero: "clamp(2.7rem, 6.6vw, 5.4rem)";
                };
                readonly face: {
                    readonly display: "\"Fraunces\", Georgia, \"Times New Roman\", serif";
                    readonly italic: "\"Fraunces\", Georgia, \"Times New Roman\", serif";
                    readonly italicStyle: "italic";
                    readonly sans: "\"Hanken Grotesk\", system-ui, -apple-system, \"Segoe UI\", sans-serif";
                };
                readonly section: "clamp(3.2rem, 7vw, 6rem)";
                readonly radius: {
                    readonly radius: "18px";
                    readonly "radius-sm": "12px";
                };
                readonly motion: {
                    readonly ease: "cubic-bezier(0.2, 0.7, 0.2, 1)";
                    readonly fast: "180ms";
                    readonly base: "250ms";
                };
                readonly overrides: {
                    readonly light: {
                        readonly "series-neutral-soft": "#828992";
                    };
                };
                readonly proposed: readonly ["paper.dark", "accent.bright", "accent.wash", "accent.darkWash", "overrides.light.series-neutral-soft"];
            };
        };
    };
    readonly aliases: {
        readonly about: "Each site's legacy custom property names, mapped to kit names, written by the token build as generated/aliases/<site>.css: a block a site splices below the kit's estate-tokens block (and below its skin block), so the next splice of the kit leaves it alone. One list per name set; a site names the set it uses. Nothing new may use these names; they go as each template is rewritten. Decision D in RETHINK_2026-11.md.";
        readonly sets: {
            readonly "pre-system-2026-08": {
                readonly about: "The 28 names the pre system stylesheet used, mapped when UK Demographics moved to the estate block on 29 August 2026 and copied by UK Council Tax. --tooltip-bg and --tooltip-fg are not here: the kit block sets both themes of each, and a copy below it would undo the dark values.";
                readonly names: {
                    readonly "bg-soft": "var(--bg-subtle)";
                    readonly "bg-deep": "var(--bg-subtle)";
                    readonly surface: "var(--bg-card)";
                    readonly "surface-muted": "var(--bg-subtle)";
                    readonly ink: "var(--text)";
                    readonly "ink-soft": "var(--text-muted)";
                    readonly muted: "var(--text-muted)";
                    readonly panel: "var(--bg-card)";
                    readonly "panel-strong": "var(--bg-subtle)";
                    readonly "panel-soft": "var(--bg-subtle)";
                    readonly "accent-2": "var(--positive)";
                    readonly "accent-3": "var(--accent)";
                    readonly "accent-teal": "var(--accent-bright)";
                    readonly "accent-teal-deep": "var(--accent)";
                    readonly "accent-glow": "color-mix(in srgb, var(--accent) 18%, transparent)";
                    readonly coral: "var(--critical)";
                    readonly "focus-ring": "var(--accent)";
                    readonly "status-warn-bg": "color-mix(in srgb, var(--warning) 8%, transparent)";
                    readonly "status-warn-border": "color-mix(in srgb, var(--warning) 45%, transparent)";
                    readonly "status-warn-text": "var(--warning)";
                    readonly "status-warn-tint": "color-mix(in srgb, var(--warning) 14%, transparent)";
                    readonly "status-warn-dark": "var(--warning)";
                    readonly "status-good-text": "var(--positive)";
                    readonly "status-bad-text": "var(--critical)";
                    readonly "body-bg-image": "var(--bg)";
                    readonly "grid-line": "transparent";
                    readonly "grid-vignette": "transparent";
                    readonly "header-backdrop": "var(--bg)";
                };
            };
        };
        readonly sites: {
            readonly ukdemographics: {
                readonly set: "pre-system-2026-08";
                readonly source: "ukdemographics src/styles/global.css at origin/main 9f7192f, read 11 November 2026: lines 75 to 98 (the Compatibility aliases, --bg-soft to --status-bad-text) and lines 105 to 108 (the retired gradient names), inside its estate-tokens block; lines 99 and 100 (--tooltip-bg, --tooltip-fg) are dropped. Its three @fontsource imports, lines 17 to 19, move above the kit block.";
            };
            readonly ukcounciltax: {
                readonly set: "pre-system-2026-08";
                readonly source: "ukcounciltax src/styles/global.css at origin/main ede1678, read 11 November 2026: lines 143 to 166 and 171 to 174, in the site's own :root rule below estate-tokens:end, which it already took from the kit (HANDOVER_2026-11.md section How a site adopts the kit).";
            };
        };
    };
    readonly font: {
        readonly display: {
            readonly family: "Source Serif 4";
            readonly stack: "\"Source Serif 4\", Georgia, \"Times New Roman\", serif";
            readonly weights: readonly [600];
            readonly files: {
                readonly "600": "fonts/SourceSerif4-SemiBold.ttf";
            };
        };
        readonly sans: {
            readonly family: "Source Sans 3";
            readonly stack: "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif";
            readonly weights: readonly [400, 600];
            readonly files: {
                readonly "400": "fonts/SourceSans3-Regular.ttf";
                readonly "600": "fonts/SourceSans3-SemiBold.ttf";
            };
        };
    };
    readonly text: {
        readonly xs: "0.78rem";
        readonly sm: "0.875rem";
        readonly base: "1.0625rem";
        readonly md: "1.1875rem";
        readonly lg: "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)";
        readonly xl: "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)";
        readonly "2xl": "clamp(2rem, 1.55rem + 2vw, 3rem)";
    };
    readonly space: {
        readonly "2xs": "0.25rem";
        readonly xs: "0.5rem";
        readonly sm: "0.75rem";
        readonly md: "1rem";
        readonly lg: "1.5rem";
        readonly xl: "2rem";
        readonly "2xl": "3rem";
        readonly "3xl": "4.5rem";
    };
    readonly radius: {
        readonly radius: "10px";
        readonly "radius-sm": "6px";
    };
    readonly shadow: {
        readonly light: {
            readonly "shadow-soft": "0 1px 2px rgba(23, 27, 31, 0.05)";
            readonly shadow: "0 1px 2px rgba(23, 27, 31, 0.06), 0 8px 24px rgba(23, 27, 31, 0.06)";
        };
        readonly dark: {
            readonly "shadow-soft": "0 1px 2px rgba(0, 0, 0, 0.4)";
            readonly shadow: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.32)";
        };
    };
    readonly ramp: {
        readonly about: "Map ramps, drawn on the estate ground in every theme, as the UK Demographics maps are. Ported unchanged from ukdemographics src/lib/map/indicators.ts (SEQUENTIAL, DIVERGING) and src/lib/map/render.ts (na, naStripe, context), origin/main, 4 November 2026. Fixed classes: a colour always means the same value.";
        readonly ground: "#0f1317";
        readonly sequential: readonly ["#25233e", "#2e2b5c", "#39357b", "#46419c", "#5751be", "#6d66de", "#8c86f5"];
        readonly diverging: readonly ["#b0703a", "#7a5636", "#6e747a", "#3b3878", "#524dad", "#7b74f2", "#b9b5f9"];
        readonly na: "#2a3038";
        readonly naStripe: "#4b535c";
        readonly context: "#1b2229";
        readonly ink: "#f4f6f7";
        readonly muted: "#98a3ac";
    };
    readonly party: {
        readonly default: "#475467";
        readonly colours: {
            readonly Labour: "#c1121f";
            readonly Conservative: "#1d4e89";
            readonly "Reform UK": "#12b5cb";
            readonly "Liberal Democrats": "#f59e0b";
            readonly "Green Party": "#138a52";
            readonly SNP: "#fdf24e";
            readonly "Plaid Cymru": "#3f9c35";
            readonly Independent: "#888888";
            readonly "Workers Party of Britain": "#a78bfa";
            readonly SDP: "#8c1f3a";
            readonly "Restore Britain": "#0f2545";
            readonly DUP: "#d46a4c";
            readonly "Sinn F\u00E9in": "#326760";
            readonly SDLP: "#2aa82c";
            readonly Alliance: "#f6cb2f";
            readonly UUP: "#48a5ee";
            readonly "Traditional Unionist Voice - TUV": "#0c3a6a";
            readonly "Speaker seeking re-election": "#708090";
            readonly "Our West Lancashire": "#5DADE2";
            readonly UKIP: "#70147A";
            readonly BNP: "#2D2D86";
            readonly "No Overall Control": "#888888";
        };
        readonly aliases: {
            readonly "Workers Party": "Workers Party of Britain";
            readonly Green: "Green Party";
            readonly "Liberal Democrat": "Liberal Democrats";
            readonly "Lib Dem": "Liberal Democrats";
            readonly "Labour & Co-operative Party": "Labour";
            readonly "Labour & Co-operative": "Labour";
            readonly "Labour and Co-operative": "Labour";
            readonly "Labour (Co-op)": "Labour";
            readonly "Lab & Co-op": "Labour";
            readonly "Our West Lancs": "Our West Lancashire";
            readonly Speaker: "Speaker seeking re-election";
            readonly TUV: "Traditional Unionist Voice - TUV";
        };
        readonly display: {
            readonly "Traditional Unionist Voice - TUV": "Traditional Unionist Voice (TUV)";
        };
        readonly notes: readonly ["Every value is the one ukelections uses in src/lib/predictions.ts partyColour(), read from origin/main on 4 November 2026, except four that ukelections does not carry: Our West Lancashire, UKIP, BNP and No Overall Control, which keep the clawd src/utils/constants.js value.", "The Traditional Unionist Voice key is the party name exactly as ukelections stores it, so a lookup matches the data; its hyphen is written as a JSON escape so the verbatim name passes the dash check. It is for lookup only: display gives the name a label prints, Traditional Unionist Voice (TUV), and TUV is an alias.", "Other (#999999 in clawd) is dropped: a residual bucket takes series-neutral, never a party colour."];
        readonly changes: readonly [{
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Conservative";
            readonly from: "#0087dc";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Labour";
            readonly from: "#dc241f";
            readonly to: "#c1121f";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Liberal Democrats";
            readonly from: "#faa61a";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Reform UK";
            readonly from: "#12b6cf";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Green (key renamed Green Party, Green kept as an alias)";
            readonly from: "#6ab023";
            readonly to: "#138a52";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "SNP";
            readonly from: "#ffff00";
            readonly to: "#fdf24e";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Plaid Cymru";
            readonly from: "#008142";
            readonly to: "#3f9c35";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "Independent";
            readonly from: "#800080";
            readonly to: "#888888";
        }, {
            readonly copy: "ukdemographics src/components/MpCard.astro";
            readonly party: "(unknown party default)";
            readonly from: "#8e8e93";
            readonly to: "#475467";
        }, {
            readonly copy: "asylumstats src/components/MpCard.astro";
            readonly party: "the same nine changes as ukdemographics MpCard.astro, whose map it copies exactly";
            readonly from: "as above";
            readonly to: "as above";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Labour and its five Co-operative aliases";
            readonly from: "#DC241F";
            readonly to: "#c1121f";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Conservative";
            readonly from: "#0087DC";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Liberal Democrats and Lib Dem";
            readonly from: "#FAA61A";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Reform UK";
            readonly from: "#12B6CF";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Green and Green Party";
            readonly from: "#6AB023";
            readonly to: "#138a52";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Workers Party";
            readonly from: "#b71c1c";
            readonly to: "#a78bfa";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Speaker";
            readonly from: "#333333";
            readonly to: "#708090";
        }, {
            readonly copy: "clawd src/utils/constants.js PARTY_COLORS";
            readonly party: "Other";
            readonly from: "#999999";
            readonly to: "dropped; use series-neutral";
        }, {
            readonly copy: "clawd src/utils/constants.js getPartyColor() fallback";
            readonly party: "(unknown party default)";
            readonly from: "#888";
            readonly to: "#475467";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Labour";
            readonly from: "#E4003B";
            readonly to: "#c1121f";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Conservative";
            readonly from: "#0087DC";
            readonly to: "#1d4e89";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Reform UK";
            readonly from: "#12B6CF";
            readonly to: "#12b5cb";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Liberal Democrat and Liberal Democrats";
            readonly from: "#FAA61A";
            readonly to: "#f59e0b";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Green";
            readonly from: "#6AB023";
            readonly to: "#138a52";
        }, {
            readonly copy: "clawd src/pages/TVDashboard.jsx";
            readonly party: "Independent";
            readonly from: "#888";
            readonly to: "#888888";
        }];
    };
    readonly print: {
        readonly about: "Print sheets: the page box, faces, type sizes in points, leading and colours of a printed surface. A sheet is not a site and has no dark theme. It is generated as generated/print/<sheet>.css (an @page rule and a block of --print-* custom properties between estate-print markers) and read in Python with print_tokens(). The values are the surface's own, quoted in $meta.sources.print, so taking the sheet changes nothing on the page.";
        readonly sheets: {
            readonly brief: {
                readonly about: "The house brief that Reports tools/md2pdf.py prints: A4, a serif body under sans headings, navy headings and table heads, one red accent.";
                readonly page: {
                    readonly size: "A4";
                    readonly margin: "16mm 15mm 18mm 15mm";
                };
                readonly face: {
                    readonly body: "Georgia, 'Times New Roman', serif";
                    readonly heading: "'Helvetica Neue', Helvetica, Arial, sans-serif";
                    readonly footer: "Helvetica, Arial, sans-serif";
                    readonly mono: "Menlo, monospace";
                };
                readonly size: {
                    readonly root: "10.4pt";
                    readonly h1: "21pt";
                    readonly h2: "13.5pt";
                    readonly h3: "11.2pt";
                    readonly lede: "9.6pt";
                    readonly table: "9.1pt";
                    readonly small: "8.8pt";
                    readonly footer: "8pt";
                    readonly "front-heading": "12.5pt";
                    readonly pocket: "11pt";
                    readonly "pocket-heading": "15pt";
                };
                readonly leading: "1.4";
                readonly color: {
                    readonly paper: "#fff";
                    readonly text: "#1a1a1a";
                    readonly strong: "#111";
                    readonly lede: "#333";
                    readonly muted: "#6b7280";
                    readonly heading: "#16233b";
                    readonly "on-heading": "#fff";
                    readonly accent: "#b8312f";
                    readonly rule: "#c9ced6";
                    readonly panel: "#f3f5f9";
                    readonly stripe: "#f7f8fa";
                    readonly "quote-bg": "#eef6ee";
                    readonly "quote-rule": "#2f7d4f";
                    readonly "flag-bg": "#fff1cc";
                    readonly "flag-border": "#e0b64a";
                    readonly "flag-ink": "#5a3d00";
                    readonly "ask-bg": "#f9ecec";
                    readonly "ask-stripe": "#f5e3e3";
                    readonly "ask-ink": "#4a1f1f";
                    readonly "answer-bg": "#eef6ee";
                    readonly "answer-stripe": "#e4f0e4";
                };
                readonly "text-on": readonly [readonly ["text", "paper"], readonly ["strong", "paper"], readonly ["lede", "paper"], readonly ["muted", "paper"], readonly ["heading", "paper"], readonly ["accent", "paper"], readonly ["on-heading", "heading"], readonly ["accent", "panel"], readonly ["text", "panel"], readonly ["text", "stripe"], readonly ["text", "quote-bg"], readonly ["flag-ink", "flag-bg"], readonly ["ask-ink", "ask-bg"], readonly ["ask-ink", "ask-stripe"], readonly ["text", "answer-bg"], readonly ["text", "answer-stripe"]];
            };
        };
    };
};
export type Theme = "light" | "dark";
export type SiteKey = keyof typeof tokens.sites;
export type ColourToken = keyof typeof tokens.color.light;
export declare const SITE_KEYS: SiteKey[];
/** The canonical party key for a name as the data holds it: an alias resolves, anything else is kept. */
export declare function partyKey(name: string): string;
/** The one party colour lookup. Aliases resolve to their canonical name first. */
export declare function partyColour(name: string): string;
/** The name a label prints. A verbatim key that carries a spaced hyphen has a display form; others print as given. */
export declare function partyName(name: string): string;
/** Every colour for one theme and site, as plain hex, for renderers that cannot read CSS. */
export declare function palette(theme: Theme, site?: SiteKey): Record<string, string>;
export type SkinKey = keyof typeof tokens.skins.sites;
export type Register = keyof typeof tokens.skins.registers;
export declare const SKIN_KEYS: SkinKey[];
export type PrintKey = keyof typeof tokens.print.sheets;
export declare const PRINT_KEYS: PrintKey[];
/** One print sheet: its page box, faces, type sizes, leading and colours. */
export declare function printSheet(key?: PrintKey): {
    readonly about: "The house brief that Reports tools/md2pdf.py prints: A4, a serif body under sans headings, navy headings and table heads, one red accent.";
    readonly page: {
        readonly size: "A4";
        readonly margin: "16mm 15mm 18mm 15mm";
    };
    readonly face: {
        readonly body: "Georgia, 'Times New Roman', serif";
        readonly heading: "'Helvetica Neue', Helvetica, Arial, sans-serif";
        readonly footer: "Helvetica, Arial, sans-serif";
        readonly mono: "Menlo, monospace";
    };
    readonly size: {
        readonly root: "10.4pt";
        readonly h1: "21pt";
        readonly h2: "13.5pt";
        readonly h3: "11.2pt";
        readonly lede: "9.6pt";
        readonly table: "9.1pt";
        readonly small: "8.8pt";
        readonly footer: "8pt";
        readonly "front-heading": "12.5pt";
        readonly pocket: "11pt";
        readonly "pocket-heading": "15pt";
    };
    readonly leading: "1.4";
    readonly color: {
        readonly paper: "#fff";
        readonly text: "#1a1a1a";
        readonly strong: "#111";
        readonly lede: "#333";
        readonly muted: "#6b7280";
        readonly heading: "#16233b";
        readonly "on-heading": "#fff";
        readonly accent: "#b8312f";
        readonly rule: "#c9ced6";
        readonly panel: "#f3f5f9";
        readonly stripe: "#f7f8fa";
        readonly "quote-bg": "#eef6ee";
        readonly "quote-rule": "#2f7d4f";
        readonly "flag-bg": "#fff1cc";
        readonly "flag-border": "#e0b64a";
        readonly "flag-ink": "#5a3d00";
        readonly "ask-bg": "#f9ecec";
        readonly "ask-stripe": "#f5e3e3";
        readonly "ask-ink": "#4a1f1f";
        readonly "answer-bg": "#eef6ee";
        readonly "answer-stripe": "#e4f0e4";
    };
    readonly "text-on": readonly [readonly ["text", "paper"], readonly ["strong", "paper"], readonly ["lede", "paper"], readonly ["muted", "paper"], readonly ["heading", "paper"], readonly ["accent", "paper"], readonly ["on-heading", "heading"], readonly ["accent", "panel"], readonly ["text", "panel"], readonly ["text", "stripe"], readonly ["text", "quote-bg"], readonly ["flag-ink", "flag-bg"], readonly ["ask-ink", "ask-bg"], readonly ["ask-ink", "ask-stripe"], readonly ["text", "answer-bg"], readonly ["text", "answer-stripe"]];
};
export interface Skin {
    register: Register;
    name?: string;
    domain?: string;
    accent?: {
        deep: string;
        bright: string;
        wash: string;
        darkWash: string;
    };
    paper: Record<Theme, {
        paper: string;
        warm: string;
        line: string;
    }>;
    display: {
        "1": string;
        "2": string;
        hero: string;
    };
    face: {
        display: string;
        italic: string;
        italicStyle: string;
        sans: string;
    };
    section: string;
    radius: {
        radius: string;
        "radius-sm": string;
    };
    motion: {
        ease: string;
        fast: string;
        base: string;
    };
    overrides?: Partial<Record<Theme, Record<string, string>>>;
    proposed?: readonly string[];
    /** A dark ground band inside the page, in both themes (tokens.json skins.desk). */
    desk?: Record<Theme, Record<string, string>>;
}
/** One site's skin: its register's skin under its own values. */
export declare function skin(key: SkinKey): Skin;
/** Every colour for one theme and skin, as plain hex: the kit's colours with the skin's paper as bg, bg-subtle and border, and the skin's accent where it has one. */
export declare function skinPalette(theme: Theme, key: SkinKey): Record<string, string>;
/** The skins that have a desk. */
export declare const DESK_KEYS: ("ukdemographics" | "ukelections" | "ukfoodhygiene" | "ukschoolholidaydates" | "asylumstats" | "aidoge" | "ukcounciltax" | "councilintel" | "ukai" | "lancashireai" | "tourdefrancelancashire")[];
/** Every colour on a skin's desk, as plain hex: the skin palette with the kit's names pointed at the desk, as the [data-ground="desk"] rule does. */
export declare function deskPalette(theme: Theme, key: SkinKey): Record<string, string>;
