import { join } from "node:path";
import { readFeed, selectCalendar } from "../../scripts/calendar-contract.mjs";
const { feed } = readFeed(join(process.cwd(), "data/school-holidays"));
export function calendarFor(place: { gss: string; parentGss: string | null }) {
 return selectCalendar(feed, place);
}
