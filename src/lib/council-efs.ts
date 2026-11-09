import { authorities, figuresByAuthority } from "./efs";

const byAuthority = figuresByAuthority();
const bySlug = new Map(Object.entries(authorities).flatMap(([key, authority]) => {
  const entries = byAuthority.get(key);
  return authority.slug && entries?.length ? [[authority.slug, { key, entries }] as const] : [];
}));

/** No successor inference or county apportionment: only a recorded council slug. */
export const councilEfs = (slug: string) => bySlug.get(slug) ?? null;
