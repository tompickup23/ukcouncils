// Generated from tokens/tokens.json by scripts/build-tokens.mjs. Do not hand edit: run npm run tokens.
export const VERSION = "0.6.0";
export const tokens = {
    "color": {
        "light": {
            "bg": "#ffffff",
            "bg-subtle": "#f5f6f7",
            "bg-card": "#ffffff",
            "border": "#dbdfe3",
            "border-strong": "#c2c8ce",
            "text": "#171b1f",
            "text-muted": "#545c63",
            "text-faint": "#616970",
            "ground": "#0f1317",
            "ground-ink": "#f4f6f7",
            "ground-muted": "#98a3ac",
            "accent-ink": "#ffffff",
            "positive": "#1f6f4f",
            "warning": "#8a5a10",
            "critical": "#b42318",
            "series-1": "#166ea5",
            "series-2": "#b6550f",
            "series-3": "#6e24da",
            "series-4": "#9d1c5c",
            "series-neutral": "#6b7280",
            "series-neutral-soft": "#8b939c",
            "tooltip-bg": "#111827",
            "tooltip-fg": "#ffffff"
        },
        "dark": {
            "bg": "#0f1317",
            "bg-subtle": "#171c21",
            "bg-card": "#141a1f",
            "border": "#2a3138",
            "border-strong": "#3d464e",
            "text": "#f4f6f7",
            "text-muted": "#b6c0c8",
            "text-faint": "#98a3ac",
            "ground": "#05080a",
            "ground-ink": "#f4f6f7",
            "ground-muted": "#98a3ac",
            "accent-ink": "#0f1317",
            "positive": "#6fcf9a",
            "warning": "#f0b03e",
            "critical": "#f2857a",
            "series-1": "#5599cc",
            "series-2": "#cf7a48",
            "series-3": "#966bfe",
            "series-4": "#f83b9b",
            "series-neutral": "#9aa2ab",
            "series-neutral-soft": "#7b838c",
            "tooltip-bg": "#e6edf3",
            "tooltip-fg": "#0d1117"
        }
    },
    "sites": {
        "ukdemographics": {
            "deep": "#4338ca",
            "bright": "#7b74f2",
            "wash": "#eeeefc",
            "darkWash": "#1c1b3a",
            "name": "UK Demographics",
            "domain": "ukdemographics.co.uk"
        },
        "ukelections": {
            "deep": "#6b5334",
            "bright": "#e3d9c3",
            "wash": "#f6f2ea",
            "darkWash": "#221d14",
            "name": "UK Elections",
            "domain": "ukelections.co.uk"
        },
        "ukfoodhygiene": {
            "deep": "#1f5c4a",
            "bright": "#3fb492",
            "wash": "#edf6f3",
            "darkWash": "#0e2620",
            "name": "UK Food Hygiene Ratings",
            "domain": "ukfoodhygiene.co.uk"
        },
        "ukschoolholidaydates": {
            "deep": "#8a5a10",
            "bright": "#f0b03e",
            "wash": "#fdf3e3",
            "darkWash": "#2b1f0c",
            "name": "UK School Holiday Dates",
            "domain": "ukschoolholidaydates.co.uk"
        },
        "asylumstats": {
            "deep": "#2f5773",
            "bright": "#82abcb",
            "wash": "#eef3f7",
            "darkWash": "#122430",
            "name": "Asylum Stats",
            "domain": "asylumstats.co.uk"
        },
        "aidoge": {
            "deep": "#1c6e8a",
            "bright": "#63c3dc",
            "wash": "#e4eff4",
            "darkWash": "#123441",
            "name": "AI DOGE",
            "domain": "aidoge.co.uk"
        },
        "ukcounciltax": {
            "deep": "#23664f",
            "bright": "#94d7b5",
            "wash": "#edf6f0",
            "darkWash": "#112d25",
            "name": "UK Council Tax",
            "domain": "ukcounciltax.co.uk"
        },
        "councilintel": {
            "deep": "#0a5f70",
            "bright": "#3fc8dd",
            "wash": "#e8f7fa",
            "darkWash": "#2a3f45",
            "name": "Council Intel",
            "domain": "councilintel.co.uk"
        }
    },
    "skins": {
        "about": "A skin per site, beside its accent triple: a paper triple (paper, warm paper, line) for each theme, a display scale that reaches hero size, a display face with an italic slot and the body face, a section rhythm, a radius pair and a motion set (one easing, two durations under 300 ms, both set to 0ms by a reduced motion guard), and, where a kit colour fails on the skin's paper, an override of that colour. A site entry names its register and inherits that register's skin; an editorial entry gives its own values, each quoted in $meta.sources.skins. A record entry may carry its own paper, radius and overrides where the site's own stylesheet holds them (Council Intel), each quoted in $meta.sources.skins; a record entry without them reproduces the kit exactly. Keys listed in proposed were derived by scripts/derive-skin-dark.mjs, not read from the site, and wait on the owner.",
        "registers": {
            "record": {
                "about": "For the data sites: restrained, dense, colour kept for data. Every value is one the kit already ships, so a record site's output does not change.",
                "skin": {
                    "paper": {
                        "light": {
                            "paper": "#ffffff",
                            "warm": "#f5f6f7",
                            "line": "#dbdfe3"
                        },
                        "dark": {
                            "paper": "#0f1317",
                            "warm": "#171c21",
                            "line": "#2a3138"
                        }
                    },
                    "display": {
                        "1": "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)",
                        "2": "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)",
                        "hero": "clamp(2rem, 1.55rem + 2vw, 3rem)"
                    },
                    "face": {
                        "display": "\"Source Serif 4\", Georgia, \"Times New Roman\", serif",
                        "italic": "\"Source Serif 4\", Georgia, \"Times New Roman\", serif",
                        "italicStyle": "normal",
                        "sans": "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
                    },
                    "section": "4.5rem",
                    "radius": {
                        "radius": "10px",
                        "radius-sm": "6px"
                    },
                    "motion": {
                        "ease": "cubic-bezier(0.16, 1, 0.3, 1)",
                        "fast": "160ms",
                        "base": "200ms"
                    }
                }
            },
            "editorial": {
                "about": "For UK AI, Lancashire AI and Tour de France Lancashire: tinted paper, display type at hero scale with an italic, a wide section rhythm, more motion. The three already share this skeleton (RETHINK_2026-11.md section 3.1), so each entry gives its own values and the register adds none."
            }
        },
        "desk": {
            "about": "A desk is a dark ground band inside a light page, in both themes: its ground, ink, muted text, rule, the three state colours drawn on it and each state's ink on its badge ground. A skin that has one lists its values under desk; generated CSS sets them as --ground, --ground-ink, --ground-muted, --ground-rule, --ground-positive and so on, and a [data-ground=\"desk\"] rule points the kit's names at them, so text, rules and a chart in css mode inside the band take the desk's values. names maps each kit name to a desk key, to another kit name (kit:accent-bright), or to the kit's dark value of a name (dark:series-1): the series and neutrals on the desk are the kit's dark set, which is validated for a dark ground. There is no wash on the desk, so accent-wash is the ground.",
            "names": {
                "bg": "ground",
                "bg-subtle": "ground",
                "bg-card": "ground",
                "text": "ink",
                "text-muted": "muted",
                "text-faint": "muted",
                "border": "rule",
                "border-strong": "rule",
                "positive": "positive",
                "warning": "warning",
                "critical": "critical",
                "accent": "kit:accent-bright",
                "accent-ink": "ground",
                "accent-wash": "ground",
                "series-1": "dark:series-1",
                "series-2": "dark:series-2",
                "series-3": "dark:series-3",
                "series-4": "dark:series-4",
                "series-neutral": "dark:series-neutral",
                "series-neutral-soft": "dark:series-neutral-soft"
            }
        },
        "sites": {
            "ukdemographics": {
                "register": "record"
            },
            "ukelections": {
                "register": "record"
            },
            "ukfoodhygiene": {
                "register": "record"
            },
            "ukschoolholidaydates": {
                "register": "record"
            },
            "asylumstats": {
                "register": "record"
            },
            "aidoge": {
                "register": "record"
            },
            "ukcounciltax": {
                "register": "record"
            },
            "councilintel": {
                "register": "record",
                "paper": {
                    "light": {
                        "paper": "#fafaf8",
                        "warm": "#f1f2ef",
                        "line": "#d9dde0"
                    },
                    "dark": {
                        "paper": "#263035",
                        "warm": "#2e393f",
                        "line": "#404c53"
                    }
                },
                "radius": {
                    "radius": "4px",
                    "radius-sm": "3px"
                },
                "overrides": {
                    "light": {
                        "bg-card": "#fafaf8",
                        "text": "#15191c",
                        "text-muted": "#5c6670",
                        "border-strong": "#b9c0c6",
                        "series-neutral-soft": "#818891"
                    },
                    "dark": {
                        "bg-card": "#263035",
                        "text": "#eef1f2",
                        "text-muted": "#a9b2b9",
                        "text-faint": "#a2adb6",
                        "border-strong": "#525f68",
                        "accent": "#5fd0e2",
                        "critical": "#f79d94"
                    }
                },
                "proposed": [
                    "overrides.light.series-neutral-soft"
                ],
                "desk": {
                    "light": {
                        "ground": "#0d2b33",
                        "ink": "#eef4f5",
                        "muted": "#9fb6bc",
                        "rule": "#1f4650",
                        "positive": "#43b386",
                        "warning": "#e2a93b",
                        "critical": "#ef6a5f",
                        "positive-ink": "#b7ead3",
                        "positive-bg": "#1b4a3a",
                        "warning-ink": "#ffe4a8",
                        "warning-bg": "#4f3a0e",
                        "critical-ink": "#ffc9c3",
                        "critical-bg": "#5a1f19"
                    },
                    "dark": {
                        "ground": "#08191e",
                        "ink": "#eef4f5",
                        "muted": "#93a8ae",
                        "rule": "#1b3a42",
                        "positive": "#43b386",
                        "warning": "#e2a93b",
                        "critical": "#ef6a5f",
                        "positive-ink": "#b7ead3",
                        "positive-bg": "#1b4a3a",
                        "warning-ink": "#ffe4a8",
                        "warning-bg": "#4f3a0e",
                        "critical-ink": "#ffc9c3",
                        "critical-bg": "#5a1f19"
                    }
                }
            },
            "ukai": {
                "register": "editorial",
                "name": "UK Artificial Intelligence",
                "domain": "ukartificialintelligence.co.uk",
                "accent": {
                    "deep": "#255848",
                    "bright": "#87ae91",
                    "wash": "#e4e9dc",
                    "darkWash": "#1e2928"
                },
                "paper": {
                    "light": {
                        "paper": "#f8f6ef",
                        "warm": "#eeece2",
                        "line": "#d5d9cc"
                    },
                    "dark": {
                        "paper": "#10171a",
                        "warm": "#182124",
                        "line": "#29363a"
                    }
                },
                "display": {
                    "1": "27px",
                    "2": "clamp(36px, 4.4vw, 57px)",
                    "hero": "clamp(70px, 7.6vw, 106px)"
                },
                "face": {
                    "display": "\"Newsreader\", Georgia, \"Times New Roman\", serif",
                    "italic": "\"Newsreader\", Georgia, \"Times New Roman\", serif",
                    "italicStyle": "italic",
                    "sans": "\"Manrope\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif"
                },
                "section": "96px",
                "radius": {
                    "radius": "12px",
                    "radius-sm": "3px"
                },
                "motion": {
                    "ease": "cubic-bezier(0.2, 0.8, 0.2, 1)",
                    "fast": "180ms",
                    "base": "250ms"
                },
                "overrides": {
                    "light": {
                        "series-neutral-soft": "#818891"
                    }
                },
                "proposed": [
                    "paper.dark",
                    "accent.darkWash",
                    "overrides.light.series-neutral-soft"
                ]
            },
            "lancashireai": {
                "register": "editorial",
                "name": "Lancashire AI",
                "domain": "lancashireai.co.uk",
                "accent": {
                    "deep": "#9d2235",
                    "bright": "#c17480",
                    "wash": "#f3e5e1",
                    "darkWash": "#2c2025"
                },
                "paper": {
                    "light": {
                        "paper": "#faf6f0",
                        "warm": "#f2ebe0",
                        "line": "#e5dcd0"
                    },
                    "dark": {
                        "paper": "#181419",
                        "warm": "#221c23",
                        "line": "#382f38"
                    }
                },
                "display": {
                    "1": "22px",
                    "2": "clamp(30px, 4.4vw, 46px)",
                    "hero": "clamp(44px, 5.6vw, 80px)"
                },
                "face": {
                    "display": "\"Fraunces\", Georgia, \"Times New Roman\", serif",
                    "italic": "\"Fraunces\", Georgia, \"Times New Roman\", serif",
                    "italicStyle": "italic",
                    "sans": "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif"
                },
                "section": "108px",
                "radius": {
                    "radius": "16px",
                    "radius-sm": "10px"
                },
                "motion": {
                    "ease": "cubic-bezier(0.2, 0.8, 0.2, 1)",
                    "fast": "180ms",
                    "base": "250ms"
                },
                "overrides": {
                    "light": {
                        "series-neutral-soft": "#818891"
                    }
                },
                "proposed": [
                    "paper.dark",
                    "accent.bright",
                    "accent.darkWash",
                    "overrides.light.series-neutral-soft"
                ]
            },
            "tourdefrancelancashire": {
                "register": "editorial",
                "name": "Tour de France Lancashire",
                "domain": "tourdefrancelancashire.co.uk",
                "accent": {
                    "deep": "#c8102e",
                    "bright": "#db6175",
                    "wash": "#f7e4dd",
                    "darkWash": "#311c23"
                },
                "paper": {
                    "light": {
                        "paper": "#fbf6ec",
                        "warm": "#f4eedf",
                        "line": "#e2d8c3"
                    },
                    "dark": {
                        "paper": "#1a1318",
                        "warm": "#251b22",
                        "line": "#3d2d37"
                    }
                },
                "display": {
                    "1": "clamp(1.25rem, 2vw, 1.6rem)",
                    "2": "clamp(1.8rem, 3.6vw, 2.9rem)",
                    "hero": "clamp(2.7rem, 6.6vw, 5.4rem)"
                },
                "face": {
                    "display": "\"Fraunces\", Georgia, \"Times New Roman\", serif",
                    "italic": "\"Fraunces\", Georgia, \"Times New Roman\", serif",
                    "italicStyle": "italic",
                    "sans": "\"Hanken Grotesk\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
                },
                "section": "clamp(3.2rem, 7vw, 6rem)",
                "radius": {
                    "radius": "18px",
                    "radius-sm": "12px"
                },
                "motion": {
                    "ease": "cubic-bezier(0.2, 0.7, 0.2, 1)",
                    "fast": "180ms",
                    "base": "250ms"
                },
                "overrides": {
                    "light": {
                        "series-neutral-soft": "#828992"
                    }
                },
                "proposed": [
                    "paper.dark",
                    "accent.bright",
                    "accent.wash",
                    "accent.darkWash",
                    "overrides.light.series-neutral-soft"
                ]
            }
        }
    },
    "aliases": {
        "about": "Each site's legacy custom property names, mapped to kit names, written by the token build as generated/aliases/<site>.css: a block a site splices below the kit's estate-tokens block (and below its skin block), so the next splice of the kit leaves it alone. One list per name set; a site names the set it uses. Nothing new may use these names; they go as each template is rewritten. Decision D in RETHINK_2026-11.md.",
        "sets": {
            "pre-system-2026-08": {
                "about": "The 28 names the pre system stylesheet used, mapped when UK Demographics moved to the estate block on 29 August 2026 and copied by UK Council Tax. --tooltip-bg and --tooltip-fg are not here: the kit block sets both themes of each, and a copy below it would undo the dark values.",
                "names": {
                    "bg-soft": "var(--bg-subtle)",
                    "bg-deep": "var(--bg-subtle)",
                    "surface": "var(--bg-card)",
                    "surface-muted": "var(--bg-subtle)",
                    "ink": "var(--text)",
                    "ink-soft": "var(--text-muted)",
                    "muted": "var(--text-muted)",
                    "panel": "var(--bg-card)",
                    "panel-strong": "var(--bg-subtle)",
                    "panel-soft": "var(--bg-subtle)",
                    "accent-2": "var(--positive)",
                    "accent-3": "var(--accent)",
                    "accent-teal": "var(--accent-bright)",
                    "accent-teal-deep": "var(--accent)",
                    "accent-glow": "color-mix(in srgb, var(--accent) 18%, transparent)",
                    "coral": "var(--critical)",
                    "focus-ring": "var(--accent)",
                    "status-warn-bg": "color-mix(in srgb, var(--warning) 8%, transparent)",
                    "status-warn-border": "color-mix(in srgb, var(--warning) 45%, transparent)",
                    "status-warn-text": "var(--warning)",
                    "status-warn-tint": "color-mix(in srgb, var(--warning) 14%, transparent)",
                    "status-warn-dark": "var(--warning)",
                    "status-good-text": "var(--positive)",
                    "status-bad-text": "var(--critical)",
                    "body-bg-image": "var(--bg)",
                    "grid-line": "transparent",
                    "grid-vignette": "transparent",
                    "header-backdrop": "var(--bg)"
                }
            }
        },
        "sites": {
            "ukdemographics": {
                "set": "pre-system-2026-08",
                "source": "ukdemographics src/styles/global.css at origin/main 9f7192f, read 11 November 2026: lines 75 to 98 (the Compatibility aliases, --bg-soft to --status-bad-text) and lines 105 to 108 (the retired gradient names), inside its estate-tokens block; lines 99 and 100 (--tooltip-bg, --tooltip-fg) are dropped. Its three @fontsource imports, lines 17 to 19, move above the kit block."
            },
            "ukcounciltax": {
                "set": "pre-system-2026-08",
                "source": "ukcounciltax src/styles/global.css at origin/main ede1678, read 11 November 2026: lines 143 to 166 and 171 to 174, in the site's own :root rule below estate-tokens:end, which it already took from the kit (HANDOVER_2026-11.md section How a site adopts the kit)."
            }
        }
    },
    "font": {
        "display": {
            "family": "Source Serif 4",
            "stack": "\"Source Serif 4\", Georgia, \"Times New Roman\", serif",
            "weights": [
                600
            ],
            "files": {
                "600": "fonts/SourceSerif4-SemiBold.ttf"
            }
        },
        "sans": {
            "family": "Source Sans 3",
            "stack": "\"Source Sans 3\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
            "weights": [
                400,
                600
            ],
            "files": {
                "400": "fonts/SourceSans3-Regular.ttf",
                "600": "fonts/SourceSans3-SemiBold.ttf"
            }
        }
    },
    "text": {
        "xs": "0.78rem",
        "sm": "0.875rem",
        "base": "1.0625rem",
        "md": "1.1875rem",
        "lg": "clamp(1.3rem, 1.16rem + 0.62vw, 1.6rem)",
        "xl": "clamp(1.65rem, 1.36rem + 1.28vw, 2.3rem)",
        "2xl": "clamp(2rem, 1.55rem + 2vw, 3rem)"
    },
    "space": {
        "2xs": "0.25rem",
        "xs": "0.5rem",
        "sm": "0.75rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "3xl": "4.5rem"
    },
    "radius": {
        "radius": "10px",
        "radius-sm": "6px"
    },
    "shadow": {
        "light": {
            "shadow-soft": "0 1px 2px rgba(23, 27, 31, 0.05)",
            "shadow": "0 1px 2px rgba(23, 27, 31, 0.06), 0 8px 24px rgba(23, 27, 31, 0.06)"
        },
        "dark": {
            "shadow-soft": "0 1px 2px rgba(0, 0, 0, 0.4)",
            "shadow": "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.32)"
        }
    },
    "ramp": {
        "about": "Map ramps, drawn on the estate ground in every theme, as the UK Demographics maps are. Ported unchanged from ukdemographics src/lib/map/indicators.ts (SEQUENTIAL, DIVERGING) and src/lib/map/render.ts (na, naStripe, context), origin/main, 4 November 2026. Fixed classes: a colour always means the same value.",
        "ground": "#0f1317",
        "sequential": [
            "#25233e",
            "#2e2b5c",
            "#39357b",
            "#46419c",
            "#5751be",
            "#6d66de",
            "#8c86f5"
        ],
        "diverging": [
            "#b0703a",
            "#7a5636",
            "#6e747a",
            "#3b3878",
            "#524dad",
            "#7b74f2",
            "#b9b5f9"
        ],
        "na": "#2a3038",
        "naStripe": "#4b535c",
        "context": "#1b2229",
        "ink": "#f4f6f7",
        "muted": "#98a3ac"
    },
    "party": {
        "default": "#475467",
        "colours": {
            "Labour": "#c1121f",
            "Conservative": "#1d4e89",
            "Reform UK": "#12b5cb",
            "Liberal Democrats": "#f59e0b",
            "Green Party": "#138a52",
            "SNP": "#fdf24e",
            "Plaid Cymru": "#3f9c35",
            "Independent": "#888888",
            "Workers Party of Britain": "#a78bfa",
            "SDP": "#8c1f3a",
            "Restore Britain": "#0f2545",
            "DUP": "#d46a4c",
            "Sinn Féin": "#326760",
            "SDLP": "#2aa82c",
            "Alliance": "#f6cb2f",
            "UUP": "#48a5ee",
            "Traditional Unionist Voice \u002d TUV": "#0c3a6a",
            "Speaker seeking re-election": "#708090",
            "Our West Lancashire": "#5DADE2",
            "UKIP": "#70147A",
            "BNP": "#2D2D86",
            "No Overall Control": "#888888"
        },
        "aliases": {
            "Workers Party": "Workers Party of Britain",
            "Green": "Green Party",
            "Liberal Democrat": "Liberal Democrats",
            "Lib Dem": "Liberal Democrats",
            "Labour & Co-operative Party": "Labour",
            "Labour & Co-operative": "Labour",
            "Labour and Co-operative": "Labour",
            "Labour (Co-op)": "Labour",
            "Lab & Co-op": "Labour",
            "Our West Lancs": "Our West Lancashire",
            "Speaker": "Speaker seeking re-election",
            "TUV": "Traditional Unionist Voice \u002d TUV"
        },
        "display": {
            "Traditional Unionist Voice \u002d TUV": "Traditional Unionist Voice (TUV)"
        },
        "notes": [
            "Every value is the one ukelections uses in src/lib/predictions.ts partyColour(), read from origin/main on 4 November 2026, except four that ukelections does not carry: Our West Lancashire, UKIP, BNP and No Overall Control, which keep the clawd src/utils/constants.js value.",
            "The Traditional Unionist Voice key is the party name exactly as ukelections stores it, so a lookup matches the data; its hyphen is written as a JSON escape so the verbatim name passes the dash check. It is for lookup only: display gives the name a label prints, Traditional Unionist Voice (TUV), and TUV is an alias.",
            "Other (#999999 in clawd) is dropped: a residual bucket takes series-neutral, never a party colour."
        ],
        "changes": [
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Conservative",
                "from": "#0087dc",
                "to": "#1d4e89"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Labour",
                "from": "#dc241f",
                "to": "#c1121f"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Liberal Democrats",
                "from": "#faa61a",
                "to": "#f59e0b"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Reform UK",
                "from": "#12b6cf",
                "to": "#12b5cb"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Green (key renamed Green Party, Green kept as an alias)",
                "from": "#6ab023",
                "to": "#138a52"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "SNP",
                "from": "#ffff00",
                "to": "#fdf24e"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Plaid Cymru",
                "from": "#008142",
                "to": "#3f9c35"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "Independent",
                "from": "#800080",
                "to": "#888888"
            },
            {
                "copy": "ukdemographics src/components/MpCard.astro",
                "party": "(unknown party default)",
                "from": "#8e8e93",
                "to": "#475467"
            },
            {
                "copy": "asylumstats src/components/MpCard.astro",
                "party": "the same nine changes as ukdemographics MpCard.astro, whose map it copies exactly",
                "from": "as above",
                "to": "as above"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Labour and its five Co-operative aliases",
                "from": "#DC241F",
                "to": "#c1121f"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Conservative",
                "from": "#0087DC",
                "to": "#1d4e89"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Liberal Democrats and Lib Dem",
                "from": "#FAA61A",
                "to": "#f59e0b"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Reform UK",
                "from": "#12B6CF",
                "to": "#12b5cb"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Green and Green Party",
                "from": "#6AB023",
                "to": "#138a52"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Workers Party",
                "from": "#b71c1c",
                "to": "#a78bfa"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Speaker",
                "from": "#333333",
                "to": "#708090"
            },
            {
                "copy": "clawd src/utils/constants.js PARTY_COLORS",
                "party": "Other",
                "from": "#999999",
                "to": "dropped; use series-neutral"
            },
            {
                "copy": "clawd src/utils/constants.js getPartyColor() fallback",
                "party": "(unknown party default)",
                "from": "#888",
                "to": "#475467"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Labour",
                "from": "#E4003B",
                "to": "#c1121f"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Conservative",
                "from": "#0087DC",
                "to": "#1d4e89"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Reform UK",
                "from": "#12B6CF",
                "to": "#12b5cb"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Liberal Democrat and Liberal Democrats",
                "from": "#FAA61A",
                "to": "#f59e0b"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Green",
                "from": "#6AB023",
                "to": "#138a52"
            },
            {
                "copy": "clawd src/pages/TVDashboard.jsx",
                "party": "Independent",
                "from": "#888",
                "to": "#888888"
            }
        ]
    },
    "print": {
        "about": "Print sheets: the page box, faces, type sizes in points, leading and colours of a printed surface. A sheet is not a site and has no dark theme. It is generated as generated/print/<sheet>.css (an @page rule and a block of --print-* custom properties between estate-print markers) and read in Python with print_tokens(). The values are the surface's own, quoted in $meta.sources.print, so taking the sheet changes nothing on the page.",
        "sheets": {
            "brief": {
                "about": "The house brief that Reports tools/md2pdf.py prints: A4, a serif body under sans headings, navy headings and table heads, one red accent.",
                "page": {
                    "size": "A4",
                    "margin": "16mm 15mm 18mm 15mm"
                },
                "face": {
                    "body": "Georgia, 'Times New Roman', serif",
                    "heading": "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    "footer": "Helvetica, Arial, sans-serif",
                    "mono": "Menlo, monospace"
                },
                "size": {
                    "root": "10.4pt",
                    "h1": "21pt",
                    "h2": "13.5pt",
                    "h3": "11.2pt",
                    "lede": "9.6pt",
                    "table": "9.1pt",
                    "small": "8.8pt",
                    "footer": "8pt",
                    "front-heading": "12.5pt",
                    "pocket": "11pt",
                    "pocket-heading": "15pt"
                },
                "leading": "1.4",
                "color": {
                    "paper": "#fff",
                    "text": "#1a1a1a",
                    "strong": "#111",
                    "lede": "#333",
                    "muted": "#6b7280",
                    "heading": "#16233b",
                    "on-heading": "#fff",
                    "accent": "#b8312f",
                    "rule": "#c9ced6",
                    "panel": "#f3f5f9",
                    "stripe": "#f7f8fa",
                    "quote-bg": "#eef6ee",
                    "quote-rule": "#2f7d4f",
                    "flag-bg": "#fff1cc",
                    "flag-border": "#e0b64a",
                    "flag-ink": "#5a3d00",
                    "ask-bg": "#f9ecec",
                    "ask-stripe": "#f5e3e3",
                    "ask-ink": "#4a1f1f",
                    "answer-bg": "#eef6ee",
                    "answer-stripe": "#e4f0e4"
                },
                "text-on": [
                    [
                        "text",
                        "paper"
                    ],
                    [
                        "strong",
                        "paper"
                    ],
                    [
                        "lede",
                        "paper"
                    ],
                    [
                        "muted",
                        "paper"
                    ],
                    [
                        "heading",
                        "paper"
                    ],
                    [
                        "accent",
                        "paper"
                    ],
                    [
                        "on-heading",
                        "heading"
                    ],
                    [
                        "accent",
                        "panel"
                    ],
                    [
                        "text",
                        "panel"
                    ],
                    [
                        "text",
                        "stripe"
                    ],
                    [
                        "text",
                        "quote-bg"
                    ],
                    [
                        "flag-ink",
                        "flag-bg"
                    ],
                    [
                        "ask-ink",
                        "ask-bg"
                    ],
                    [
                        "ask-ink",
                        "ask-stripe"
                    ],
                    [
                        "text",
                        "answer-bg"
                    ],
                    [
                        "text",
                        "answer-stripe"
                    ]
                ]
            }
        }
    }
};
export const SITE_KEYS = Object.keys(tokens.sites);
/** The canonical party key for a name as the data holds it: an alias resolves, anything else is kept. */
export function partyKey(name) {
    return tokens.party.aliases[name] ?? name;
}
/** The one party colour lookup. Aliases resolve to their canonical name first. */
export function partyColour(name) {
    return tokens.party.colours[partyKey(name)] ?? tokens.party.default;
}
/** The name a label prints. A verbatim key that carries a spaced hyphen has a display form; others print as given. */
export function partyName(name) {
    return tokens.party.display[partyKey(name)] ?? name;
}
/** Every colour for one theme and site, as plain hex, for renderers that cannot read CSS. */
export function palette(theme, site = "ukdemographics") {
    const s = tokens.sites[site];
    const accent = theme === "light"
        ? { accent: s.deep, "accent-bright": s.bright, "accent-wash": s.wash }
        : { accent: s.bright, "accent-bright": s.bright, "accent-wash": s.darkWash };
    return { ...tokens.color[theme], ...accent };
}
export const SKIN_KEYS = Object.keys(tokens.skins.sites);
export const PRINT_KEYS = Object.keys(tokens.print.sheets);
/** One print sheet: its page box, faces, type sizes, leading and colours. */
export function printSheet(key = "brief") {
    return tokens.print.sheets[key];
}
/** One site's skin: its register's skin under its own values. */
export function skin(key) {
    const entry = tokens.skins.sites[key];
    const base = tokens.skins.registers[entry.register].skin ?? {};
    return { ...base, ...entry };
}
/** Every colour for one theme and skin, as plain hex: the kit's colours with the skin's paper as bg, bg-subtle and border, and the skin's accent where it has one. */
export function skinPalette(theme, key) {
    const s = skin(key);
    const base = key in tokens.sites ? palette(theme, key) : { ...tokens.color[theme] };
    const p = s.paper[theme];
    const out = { ...base, bg: p.paper, "bg-subtle": p.warm, border: p.line, paper: p.paper, "paper-warm": p.warm, "paper-line": p.line };
    if (s.accent) {
        Object.assign(out, theme === "light"
            ? { accent: s.accent.deep, "accent-bright": s.accent.bright, "accent-wash": s.accent.wash }
            : { accent: s.accent.bright, "accent-bright": s.accent.bright, "accent-wash": s.accent.darkWash });
    }
    Object.assign(out, s.overrides?.[theme] ?? {});
    if (s.desk)
        for (const [k, v] of Object.entries(s.desk[theme]))
            out[k === "ground" ? "ground" : `ground-${k}`] = v;
    return out;
}
/** The skins that have a desk. */
export const DESK_KEYS = SKIN_KEYS.filter((k) => !!skin(k).desk);
/** Every colour on a skin's desk, as plain hex: the skin palette with the kit's names pointed at the desk, as the [data-ground="desk"] rule does. */
export function deskPalette(theme, key) {
    const s = skin(key);
    if (!s.desk)
        throw new Error(`the ${key} skin has no desk`);
    const base = skinPalette(theme, key), d = s.desk[theme];
    const out = { ...base };
    for (const [name, ref] of Object.entries(tokens.skins.desk.names)) {
        out[name] = ref.startsWith("dark:") ? tokens.color.dark[ref.slice(5)]
            : ref.startsWith("kit:") ? base[ref.slice(4)]
                : d[ref];
    }
    return out;
}
