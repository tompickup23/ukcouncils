import {loadNotices} from '../../scripts/lib/section-114-data.mjs';
export {noticeDate, noticeLine, noticeLocator, noticeSource, NOTICE_COVERAGE} from '../../scripts/lib/section-114-data.mjs';
export interface NoticeRecord {
  id: string; council: string; gss: string; notice_date: string; provision: string;
  act: string; url: string; retrieved: string;
  locator: {pages: number[]; paragraphs: string[]};
}
export const notices = loadNotices();
export const noticesFor = (gss: string): NoticeRecord[] => notices.profiles.get(gss) ?? [];
