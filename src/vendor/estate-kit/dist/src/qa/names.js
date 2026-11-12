/** A lower case "council" as the last word is the mark of a composed name. */
const COMPOSED = /\scouncil$/;
/** Problems with the names of the bodies behind these figure keys; empty when every name is held. */
export function nameErrors(set, keys) {
    const errors = [];
    for (const key of keys) {
        const name = set.get(key).name?.trim();
        if (!name)
            errors.push(`${key}: no name in the data; record the body's published name rather than composing one`);
        else if (COMPOSED.test(name))
            errors.push(`${key}: "${name}" ends in a lower case "council", which reads as composed; use the published name`);
    }
    return errors;
}
/** Throws when any body behind these keys has no published name. */
export function checkNames(set, keys, where = "chart") {
    const errors = nameErrors(set, keys);
    if (errors.length)
        throw new Error(`${where}: name check failed:\n  ${errors.join("\n  ")}`);
}
