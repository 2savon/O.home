'use client';
/**
 * 아보카도 캐릭터 게시판 (O.home 이식판) — 데이터 모델 · 저장 계층
 *
 * ── 원본 파일과 충돌하지 않게 ──────────────────────────────────────
 * 새 테이블(컬렉션)을 만들려면 schema.sql · Firebase 규칙 등 원본 파일을 고쳐야 해서
 * [Sync fork] 때 충돌이 난다. 그래서 **이미 있는 `comments` 컬렉션**을 빌려 쓴다.
 *   · O.home의 화면들은 댓글을 `target`('post'|'road'|'thread'|'guest')으로 걸러 읽으므로
 *     target이 'avochar'인 행은 다른 메뉴에 섞이지 않는다.
 *   · 백업·복원·DB 이전·안 쓰는 이미지 정리도 컬렉션 단위라 자동으로 함께 처리된다.
 *
 * ── 공개범위 ──────────────────────────────────────────────────────
 * 화면에서 가리는 것으로는 부족하다(공개 키로 DB를 직접 조회할 수 있다).
 * 행마다 `visibility`를 직접 적어 서버 규칙(RLS)이 막게 한다.
 *   · 게시판 공개범위(설정) = 모든 행의 최소 기준
 *   · 비밀글 = 'private' (작성자 · 관리자만 서버에서 내려받을 수 있다)
 */
import { useCallback, useMemo, useRef } from 'react';
import { useLocalList } from '@/lib/postStore';
import { useMembers } from '@/lib/members';

export const AVO_KEY = 'ohome.comments.v1';
export const AVO_TARGET = 'avochar';
export const AVO_VER = '1.9.2-ohome.1';

/* ===================== 타입 ===================== */
export type Vis = 'public' | 'member' | 'private';
export type Kind = 'char' | 'post' | 'conf' | 'sd' | 'sheet' | 'pcmt';
export type TabKey = 'profile' | 'story' | 'sheet' | 'log' | 'record' | 'ref';

/** comments 컬렉션의 한 행 — CommentRow 모양을 따른다(다른 화면이 읽어도 깨지지 않게) */
export interface Row {
  id: string;
  target: typeof AVO_TARGET;
  targetId: Kind;
  author: string;
  authorId: string;
  text: string;
  date: string;
  visibility: Vis;
  avo: unknown;
}

export interface Rel { charId: string; name: string; img: string; label: string }
export interface Pos { x: number; y: number; z: number }
export interface Wd {
  id: string; kind: 'wd' | 'au'; name: string; img: string; bg: string; pos?: Pos;
  /* AU 전용 — 비우면 기본 프로필 값 */
  cname?: string; nameSub?: string; affiliation?: string; quote?: string; age?: string; size?: string;
  birthday?: string; extra?: string; intro?: string; story?: string;
}
export interface Rec { id: string; label: string; title: string; date: string; end: string; link: string; thumb: string }
export interface SheetEntry { id: string; sheetId: string; title: string; img: Record<string, string> }
export interface ComColor { hex: string; name: string }
export interface ComImg { img: string; cap: string }

export interface Char {
  id: string;
  name: string; order: number; label: string; accent: string;
  nameSub: string; affiliation: string; quote: string;
  age: string; size: string; birthday: string; extra: string; intro: string;
  thumb: string; full: string; sd: string; bgImg: string; bgColor: string; fullPos?: Pos;
  bgmTitle: string; bgm: string;
  story: string; useStory: boolean; useSheet: boolean; sheetSpoiler: boolean;
  tabsOff: TabKey[]; sheets: SheetEntry[];
  rels: Rel[]; wardrobe: Wd[]; records: Rec[];
  comFull: string; comHead: string; comColors: ComColor[];
  comEye: string; comImpression: string; comHair: string; comEtc: string; comExtra: string; comImages: ComImg[];
  date: string; authorId: string;
}

export interface Post {
  id: string; charId: string; title: string; body: string;
  secret: boolean; notice: boolean;
  author: string; authorId: string; date: string; edited?: string;
}

export interface PostCmt { id: string; postId: string; text: string; author: string; authorId: string; date: string }

export interface Conf {
  title: string; desc: string;
  labels: [string, string][];        // 캐릭터 구분 라벨 [이름, 색]
  recLabels: [string, string][];     // 기록 라벨
  vis: Vis;                          // 게시판 전체 공개범위(최소 기준)
  postPerm: 'admin' | 'member';      // 게시글 작성 권한
  cmtPerm: 'member' | 'none';        // 댓글
  viewMode: 'full' | 'fit';          // 캐릭터 페이지 : 화면 전체 / 레이아웃 안
  perPage: number;                   // 캐릭터 목록 한 페이지
  postRows: number;                  // 게시글 목록 한 페이지
  accent: string;                    // 홈페이지 기본 컬러 (비우면 O.home 강조색)
  recSort: 'desc' | 'asc';
}

/** 시트 입력값 (캐릭터마다 한 행) — 메인 목록을 가볍게 하려고 캐릭터와 따로 저장 (원본과 같음) */
export interface SheetData { charId: string; e: Record<string, Record<string, unknown>> }
/** 업로드한 커스텀 시트 (홈 전체 공유) */
export interface SheetLib { id: string; name: string; width: number; html: string }

/* ===================== 기본값 ===================== */
export const DEFAULT_LABELS: [string, string][] = [
  ['OC', '#6f9a4c'], ['TRPG', '#7b6cd9'], ['지인관계', '#e2a03c'], ['드림', '#e0739a'], ['기타', '#8a8fb2'],
];
export const DEFAULT_REC_LABELS: [string, string][] = [['TRPG', '#7b6cd9'], ['커뮤', '#3fa59a'], ['기타', '#8a8fb2']];
export const PALETTE = ['#6f9a4c', '#e2a03c', '#e0739a', '#5b8fd1', '#8a8fb2', '#c9694f', '#3fa59a', '#a974c9'];

export const DEFAULT_CONF: Conf = {
  title: 'CHARACTERS', desc: '',
  labels: DEFAULT_LABELS, recLabels: DEFAULT_REC_LABELS,
  vis: 'public', postPerm: 'admin', cmtPerm: 'member',
  viewMode: 'full', perPage: 8, postRows: 15, accent: '', recSort: 'desc',
};

export const TAB_LIST: { key: TabKey; label: string; icon: string }[] = [
  { key: 'profile', label: '프로필', icon: 'profile' },
  { key: 'story', label: '서사', icon: 'story' },
  { key: 'sheet', label: '시트', icon: 'dice' },
  { key: 'log', label: '로그', icon: 'log' },
  { key: 'record', label: '기록', icon: 'record' },
  { key: 'ref', label: '자료', icon: 'sheet' },
];

export function blankChar(): Char {
  return {
    id: '', name: '', order: 0, label: '', accent: '',
    nameSub: '', affiliation: '', quote: '', age: '', size: '', birthday: '', extra: '', intro: '',
    thumb: '', full: '', sd: '', bgImg: '', bgColor: '',
    bgmTitle: '', bgm: '',
    story: '', useStory: true, useSheet: false, sheetSpoiler: true, tabsOff: [], sheets: [],
    rels: [], wardrobe: [], records: [],
    comFull: '', comHead: '', comColors: [], comEye: '', comImpression: '', comHair: '', comEtc: '', comExtra: '', comImages: [],
    date: '', authorId: '',
  };
}

/* ---------- 기본 TRPG 시트 9종 (public/my/avochar/sheets/*.html) ---------- */
export const SHEET_BASE = '/my/avochar/sheets/';
export const BUILTIN_SHEETS: { id: string; file: string; name: string; width: number }[] = [
  { id: 'b:coc7', file: 'coc7', name: '크툴루의 부름 7판', width: 820 },
  { id: 'b:insane', file: 'insane', name: '멀티장르 호러 RPG inSANe', width: 820 },
  { id: 'b:magicalogia', file: 'magicalogia', name: '마도서대전 TRPG 마기카로기아', width: 820 },
  { id: 'b:dx3', file: 'dx3', name: '더블크로스 The 3rd Edition', width: 820 },
  { id: 'b:shinobigami', file: 'shinobigami', name: '인술배틀 RPG 시노비가미', width: 820 },
  { id: 'b:unsungduet', file: 'unsungduet', name: '언성 듀엣', width: 820 },
  { id: 'b:stratoshout', file: 'stratoshout', name: '청춘 밴드 TRPG 스트라토 샤우트', width: 820 },
  { id: 'b:ventangle', file: 'ventangle', name: 'Ventangle', width: 820 },
  { id: 'b:emoklore', file: 'emoklore', name: '에모크로아 TRPG', width: 820 },
];

/* ===================== 작은 도우미 ===================== */
export const newId = (n = 10) =>
  (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(-n);

export const str = (v: unknown, max = 100000): string => (typeof v === 'string' ? v.slice(0, max) : '');

/** #rgb / #rrggbb / rgb()/rgba() 만 통과 (CSS 주입 방지) */
export function cleanColor(v: unknown): string {
  const s = str(v, 40).trim();
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?([0-9a-f]{2})?$/i.test(s)) return s;
  if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i.test(s)) return s;
  return '';
}

/** 링크 : http(s) · 프로토콜 상대 · 사이트 내부 경로만 */
export function cleanUrl(v: unknown): string {
  const s = str(v, 2000).trim();
  if (/^(https?:)?\/\//i.test(s)) return s;
  if (/^\/[^/]/.test(s)) return s;
  return '';
}

/** 이미지 참조 : O.home 저장소 참조(파일 id) · http(s) · data:image */
export function cleanImg(v: unknown): string {
  const s = str(v, 3_000_000).trim();
  if (!s) return '';
  if (/^(https?:)?\/\//i.test(s) || /^\/[^/]/.test(s)) return s;
  if (/^data:image\//i.test(s) && s.length < 300_000) return s;   // 아주 작은 그림만 (DB 문서 한도)
  if (/^[A-Za-z0-9_.-]{4,80}$/.test(s)) return s;   // 로컬 모드 IndexedDB 파일 id
  return '';
}

export function initial(s: string): string { return Array.from((s || '').replace(/<[^>]*>/g, '').trim())[0] ?? '?'; }

/** 그 외 항목 : "항목: 내용" 줄 단위 (콜론 없는 줄은 한 줄 전체) */
export function extraRows(text: string): [string, string][] {
  const out: [string, string][] = [];
  for (const raw of (text || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^([^:：]{1,30})[:：]\s*(.*)$/.exec(line);
    out.push(m ? [m[1].trim(), m[2]] : ['', line]);
  }
  return out;
}

export function youtubeId(url: string): string {
  const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(url || '');
  return m ? m[1] : '';
}

export function fmtDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  const s = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  return withTime ? `${s} ${p(d.getHours())}:${p(d.getMinutes())}` : s;
}
export const fmtShort = (iso: string) => fmtDate(iso).slice(2);

/** 기록 날짜 표시 : 2026.05.24 ~ 2026.06.10 */
export function recordDates(r: Rec): string {
  const f = (s: string) => s.replace(/-/g, '.');
  if (r.date && r.end) return `${f(r.date)} ~ ${f(r.end)}`;
  if (r.date) return f(r.date);
  if (r.end) return `~ ${f(r.end)}`;
  return '';
}
export function sortRecords(list: Rec[], dir: 'desc' | 'asc'): Rec[] {
  const k = (r: Rec) => r.date || r.end || '';
  return [...list].sort((a, b) => {
    const x = k(a), y = k(b);
    if (x === y) return 0;
    if (!x) return 1;
    if (!y) return -1;
    return dir === 'desc' ? (x < y ? 1 : -1) : (x < y ? -1 : 1);
  });
}

/** 라벨 색 : 목록에 있으면 그 색, 없으면 이름에 따라 팔레트에서 */
export function labelColor(labels: [string, string][], name: string): string {
  const hit = labels.find(l => l[0] === name);
  if (hit) return hit[1];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** 캐릭터 페이지에 보이는 탭 */
export function visibleTabs(c: Char): TabKey[] {
  return TAB_LIST.map(t => t.key).filter(k => {
    if (c.tabsOff.includes(k)) return false;
    if (k === 'story' && !c.useStory) return false;
    if (k === 'sheet' && !c.useSheet) return false;
    return true;
  });
}

/* ===================== 정규화 (저장된 값 → 안전한 모양) ===================== */
const arr = <T>(v: unknown, f: (x: Record<string, unknown>) => T | null, max = 300): T[] =>
  (Array.isArray(v) ? v : []).slice(0, max)
    .map(x => (x && typeof x === 'object' ? f(x as Record<string, unknown>) : null))
    .filter((x): x is T => x !== null);

function normPos(v: unknown): Pos | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const n = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
  return { x: Math.max(0, Math.min(100, n(o.x, 50))), y: Math.max(0, Math.min(100, n(o.y, 0))), z: Math.max(1, Math.min(4, n(o.z, 1))) };
}

export function normChar(id: string, raw: unknown, authorId: string, date: string): Char {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const b = blankChar();
  const tabs = new Set(TAB_LIST.map(t => t.key));
  return {
    ...b, id, authorId, date,
    name: str(o.name, 100), order: typeof o.order === 'number' ? o.order : 0,
    label: str(o.label, 30), accent: cleanColor(o.accent),
    nameSub: str(o.nameSub, 200), affiliation: str(o.affiliation, 200), quote: str(o.quote, 500),
    age: str(o.age, 100), size: str(o.size, 100), birthday: str(o.birthday, 100), extra: str(o.extra, 5000),
    intro: str(o.intro, 20000),
    thumb: cleanImg(o.thumb), full: cleanImg(o.full), sd: cleanImg(o.sd), bgImg: cleanImg(o.bgImg), bgColor: cleanColor(o.bgColor),
    fullPos: normPos(o.fullPos),
    bgmTitle: str(o.bgmTitle, 200), bgm: cleanUrl(o.bgm) || cleanImg(o.bgm),
    story: str(o.story, 200000), useStory: o.useStory !== false, useSheet: o.useSheet === true, sheetSpoiler: o.sheetSpoiler !== false,
    tabsOff: (Array.isArray(o.tabsOff) ? o.tabsOff : []).filter((k): k is TabKey => tabs.has(k as TabKey)),
    sheets: arr(o.sheets, x => {
      const sid = str(x.sheetId, 40);
      if (!sid) return null;
      const img: Record<string, string> = {};
      if (x.img && typeof x.img === 'object') {
        for (const [k, v] of Object.entries(x.img as Record<string, unknown>)) {
          const u = cleanImg(v);
          if (/^[a-z0-9_]{1,30}$/i.test(k) && u) img[k] = u;
        }
      }
      return { id: str(x.id, 16) || newId(8), sheetId: sid, title: str(x.title, 60), img };
    }, 10),
    rels: arr(o.rels, x => ({ charId: str(x.charId, 40), name: str(x.name, 100), img: cleanImg(x.img), label: str(x.label, 200) }), 60),
    wardrobe: arr(o.wardrobe, x => {
      const img = cleanImg(x.img);
      if (!img) return null;
      return {
        id: str(x.id, 16) || newId(8), kind: x.kind === 'au' ? 'au' : 'wd', name: str(x.name, 100), img, bg: cleanImg(x.bg), pos: normPos(x.pos),
        cname: str(x.cname, 100), nameSub: str(x.nameSub, 200), affiliation: str(x.affiliation, 200), quote: str(x.quote, 500),
        age: str(x.age, 100), size: str(x.size, 100), birthday: str(x.birthday, 100), extra: str(x.extra, 5000),
        intro: str(x.intro, 20000), story: str(x.story, 60000),
      } as Wd;
    }, 100),
    records: arr(o.records, x => {
      const title = str(x.title, 200);
      if (!title) return null;
      const d = (v: unknown) => { const s = str(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; };
      return { id: str(x.id, 16) || newId(8), label: str(x.label, 30), title, date: d(x.date), end: d(x.end), link: cleanUrl(x.link), thumb: cleanImg(x.thumb) };
    }),
    comFull: cleanImg(o.comFull), comHead: cleanImg(o.comHead),
    comColors: arr(o.comColors, x => { const hex = cleanColor(x.hex); return hex ? { hex, name: str(x.name, 60) } : null; }, 24),
    comEye: str(o.comEye, 1000), comImpression: str(o.comImpression, 1000), comHair: str(o.comHair, 1000),
    comEtc: str(o.comEtc, 3000), comExtra: str(o.comExtra, 10000),
    comImages: arr(o.comImages, x => { const img = cleanImg(x.img); return img ? { img, cap: str(x.cap, 300) } : null; }, 40),
  };
}

/** 저장할 때는 id·authorId·date를 빼고 내용만 */
export function charPayload(c: Char): Record<string, unknown> {
  const { id: _id, authorId: _a, date: _d, ...rest } = c;
  void _id; void _a; void _d;
  return rest;
}

export function normConf(raw: unknown): Conf {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const labels = (v: unknown, def: [string, string][]) => {
    const out: [string, string][] = [];
    if (Array.isArray(v)) for (const p of v) {
      if (!Array.isArray(p)) continue;
      const n = str(p[0], 30).trim(), c = cleanColor(p[1]);
      if (n && c && !out.some(x => x[0] === n)) out.push([n, c]);
    }
    return out.length ? out : def;
  };
  const vis: Vis = o.vis === 'member' || o.vis === 'private' ? o.vis : 'public';
  const num = (v: unknown, d: number, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d);
  return {
    title: str(o.title, 60) || DEFAULT_CONF.title, desc: str(o.desc, 200),
    labels: labels(o.labels, DEFAULT_LABELS), recLabels: labels(o.recLabels, DEFAULT_REC_LABELS),
    vis, postPerm: o.postPerm === 'member' ? 'member' : 'admin', cmtPerm: o.cmtPerm === 'none' ? 'none' : 'member',
    viewMode: o.viewMode === 'fit' ? 'fit' : 'full',
    perPage: num(o.perPage, 8, 4, 40), postRows: num(o.postRows, 15, 5, 100),
    accent: cleanColor(o.accent), recSort: o.recSort === 'asc' ? 'asc' : 'desc',
  };
}

const VIS_RANK: Record<Vis, number> = { public: 0, member: 1, private: 2 };
export const widerOf = (a: Vis, b: Vis): Vis => (VIS_RANK[a] >= VIS_RANK[b] ? a : b);

/* ===================== 저장소 훅 ===================== */
export interface AvoStore {
  loaded: boolean;
  conf: Conf;
  chars: Char[];
  posts: Post[];
  cmts: PostCmt[];
  sheetLib: SheetLib[];
  sheetData: (charId: string) => SheetData;
  saveConf: (c: Conf) => void;
  saveChar: (c: Char) => string;
  deleteChar: (id: string) => void;
  saveSheetData: (charId: string, eid: string, data: Record<string, unknown>) => void;
  addSheetLib: (s: Omit<SheetLib, 'id'>) => string;
  deleteSheetLib: (id: string) => void;
  savePost: (p: Post) => string;
  deletePost: (id: string) => void;
  addCmt: (postId: string, text: string) => void;
  deleteCmt: (id: string) => void;
  /** 게시판 공개범위를 바꾼 뒤 이미 저장된 행에도 적용 */
  reapplyVis: (vis?: Vis) => number;
}

export function useAvoStore(user: { id: string; nickname: string } | null): AvoStore {
  const [rows, setRows, loaded] = useLocalList<Row>(AVO_KEY, []);
  const members = useMembers();
  const latest = useRef(rows);
  latest.current = rows;

  /** 다른 화면의 댓글 행은 그대로 두고 내 행만 바꾼다 (목록 통째 저장 방식이라 diff로 바뀐 행만 전송됨) */
  const mutate = useCallback((fn: (all: Row[]) => Row[]) => {
    const next = fn(latest.current);
    latest.current = next;
    setRows(next);
  }, [setRows]);

  const mine = useMemo(() => rows.filter((r): r is Row => (r as Partial<Row>).target === AVO_TARGET), [rows]);

  /* 캐릭터·설정·시트는 관리자가 쓴 행만 믿는다 — comments 컬렉션은 손님도 행을 만들 수 있으므로
     (작성자 없는 행 차단 + 회원 목록에 관리자 표시가 있으면 관리자 행만) */
  const adminIds = useMemo(() => new Set(members.filter(m => m.role === 'admin').map(m => m.id)), [members]);
  const trusted = useCallback((r: Row) => !!r.authorId && (adminIds.size === 0 || adminIds.has(r.authorId)), [adminIds]);

  const confRow = mine.find(r => r.targetId === 'conf' && trusted(r));
  const conf = useMemo(() => normConf(confRow?.avo), [confRow]);

  const chars = useMemo(() => mine.filter(r => r.targetId === 'char' && trusted(r))
    .map(r => normChar(r.id, r.avo, r.authorId, r.date))
    .sort((a, b) => (a.order - b.order) || a.date.localeCompare(b.date)), [mine, trusted]);

  const posts = useMemo(() => mine.filter(r => r.targetId === 'post' && !!r.authorId).map(r => {
    const o = (r.avo ?? {}) as Record<string, unknown>;
    return {
      id: r.id, charId: str(o.charId, 40), title: str(o.title, 200), body: str(o.body, 400000),
      secret: o.secret === true, notice: o.notice === true && trusted(r),
      author: r.author, authorId: r.authorId, date: r.date, edited: str(o.edited, 40) || undefined,
    } as Post;
  }).sort((a, b) => (Number(b.notice) - Number(a.notice)) || b.date.localeCompare(a.date)), [mine, trusted]);

  const cmts = useMemo(() => mine.filter(r => r.targetId === 'pcmt' && !!r.authorId).map(r => {
    const o = (r.avo ?? {}) as Record<string, unknown>;
    return { id: r.id, postId: str(o.postId, 40), text: str(o.text, 5000) || r.text, author: r.author, authorId: r.authorId, date: r.date };
  }).sort((a, b) => a.date.localeCompare(b.date)), [mine]);

  const sheetLib = useMemo(() => mine.filter(r => r.targetId === 'sheet' && trusted(r)).map(r => {
    const o = (r.avo ?? {}) as Record<string, unknown>;
    return { id: r.id, name: str(o.name, 60) || '이름 없는 시트', width: typeof o.width === 'number' ? Math.max(320, Math.min(1600, o.width)) : 820, html: str(o.html, 700_000) };
  }), [mine, trusted]);

  const sdRows = useMemo(() => mine.filter(r => r.targetId === 'sd' && trusted(r)), [mine, trusted]);
  const sheetData = useCallback((charId: string): SheetData => {
    const r = sdRows.find(x => x.id === sdId(charId));
    const o = (r?.avo ?? {}) as Record<string, unknown>;
    const e = o.e && typeof o.e === 'object' ? (o.e as SheetData['e']) : {};
    return { charId, e };
  }, [sdRows]);

  const floor = conf.vis;
  const make = useCallback((id: string, kind: Kind, avo: unknown, vis: Vis, prev?: Row): Row => ({
    id, target: AVO_TARGET, targetId: kind,
    author: prev?.author ?? user?.nickname ?? '',
    authorId: prev?.authorId ?? user?.id ?? '',
    text: '', date: prev?.date ?? new Date().toISOString(),
    visibility: widerOf(vis, floor), avo,
  }), [user, floor]);

  /** 같은 id 행이 있으면 그 자리에서 교체, 없으면 맨 뒤에 추가 (다른 행 순서를 흔들지 않게) */
  const upsert = useCallback((row: Row) => mutate(all => {
    const i = all.findIndex(r => r.id === row.id);
    if (i < 0) return [...all, row];
    const next = all.slice();
    next[i] = row;
    return next;
  }), [mutate]);
  const remove = useCallback((ids: string[]) => {
    const s = new Set(ids);
    mutate(all => all.filter(r => !s.has(r.id)));
  }, [mutate]);
  const find = (id: string) => latest.current.find(r => r.id === id) as Row | undefined;

  const saveConf = useCallback((c: Conf) => {
    // 설정 행은 늘 공개 (라벨 이름·색뿐) — 게시판을 회원 공개로 둬도 손님 화면이 깨지지 않게
    const prev = find(CONF_ID);
    upsert({ ...make(CONF_ID, 'conf', c, 'public', prev), visibility: 'public' });
  }, [make, upsert]);

  const saveChar = useCallback((c: Char) => {
    const id = c.id || `avc-${newId(10)}`;
    upsert(make(id, 'char', charPayload(c), 'public', find(id)));
    return id;
  }, [make, upsert]);

  const deleteChar = useCallback((id: string) => remove([id, sdId(id)]), [remove]);

  const saveSheetData = useCallback((charId: string, eid: string, data: Record<string, unknown>) => {
    const id = sdId(charId);
    const prev = find(id);
    const o = (prev?.avo ?? {}) as Record<string, unknown>;
    const e = { ...((o.e && typeof o.e === 'object' ? o.e : {}) as SheetData['e']), [eid]: cleanSheetData(data) };
    upsert(make(id, 'sd', { charId, e }, 'public', prev));
  }, [make, upsert]);

  const addSheetLib = useCallback((s: Omit<SheetLib, 'id'>) => {
    const id = `avs-${newId(10)}`;
    upsert(make(id, 'sheet', s, 'public'));
    return id;
  }, [make, upsert]);
  const deleteSheetLib = useCallback((id: string) => remove([id]), [remove]);

  const savePost = useCallback((p: Post) => {
    const id = p.id || `avp-${newId(10)}`;
    const prev = find(id);
    const avo = { charId: p.charId, title: p.title, body: p.body, secret: p.secret, notice: p.notice, ...(prev ? { edited: new Date().toISOString() } : {}) };
    upsert(make(id, 'post', avo, p.secret ? 'private' : 'public', prev));
    // 비밀글로 바꾸면 달린 댓글도 함께 좁힌다
    const vis: Vis = p.secret ? 'private' : 'public';
    mutate(all => all.map(r => ((r as Partial<Row>).target === AVO_TARGET && r.targetId === 'pcmt'
      && ((r.avo ?? {}) as Record<string, unknown>).postId === id && r.visibility !== widerOf(vis, floor))
      ? { ...r, visibility: widerOf(vis, floor) } : r));
    return id;
  }, [make, upsert, mutate, floor]);

  const deletePost = useCallback((id: string) => {
    const ids = latest.current.filter(r => (r as Partial<Row>).target === AVO_TARGET && r.targetId === 'pcmt'
      && ((r.avo ?? {}) as Record<string, unknown>).postId === id).map(r => r.id);
    remove([id, ...ids]);
  }, [remove]);

  const addCmt = useCallback((postId: string, text: string) => {
    const post = find(postId);
    const vis: Vis = post?.visibility === 'private' ? 'private' : 'public';
    const id = `avm-${newId(10)}`;
    upsert({ ...make(id, 'pcmt', { postId, text }, vis), text: text.slice(0, 5000) });
  }, [make, upsert]);
  const deleteCmt = useCallback((id: string) => remove([id]), [remove]);

  const reapplyVis = useCallback((vis?: Vis) => {
    const fl = vis ?? floor;
    let n = 0;
    mutate(all => all.map(r => {
      if ((r as Partial<Row>).target !== AVO_TARGET || r.targetId === 'conf') return r;
      let own: Vis = 'public';
      if (r.targetId === 'post') own = ((r.avo ?? {}) as Record<string, unknown>).secret === true ? 'private' : 'public';
      if (r.targetId === 'pcmt') {
        const pid = ((r.avo ?? {}) as Record<string, unknown>).postId;
        const p = all.find(x => x.id === pid);
        own = ((p?.avo ?? {}) as Record<string, unknown>).secret === true ? 'private' : 'public';
      }
      const v = widerOf(own, fl);
      if (r.visibility === v) return r;
      n++;
      return { ...r, visibility: v };
    }));
    return n;
  }, [mutate, floor]);

  return {
    loaded, conf, chars, posts, cmts, sheetLib, sheetData,
    saveConf, saveChar, deleteChar, saveSheetData, addSheetLib, deleteSheetLib,
    savePost, deletePost, addCmt, deleteCmt, reapplyVis,
  };
}

export const CONF_ID = 'avochar-conf';
export const sdId = (charId: string) => `avd-${charId}`.slice(0, 60);

/** 시트 입력값 정리 : 키 64자 · 값 5000자 · 깊이 3 · 항목 4000개 이내 (원본과 같은 한도) */
export function cleanSheetData(a: unknown, depth = 0, cnt = { n: 0 }): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!a || typeof a !== 'object' || Array.isArray(a) || depth > 3) return out;
  for (const [k0, v] of Object.entries(a as Record<string, unknown>)) {
    if (++cnt.n > 4000) break;
    const k = k0.replace(/[\u0000-\u001f<>"']/g, '');
    if (!k || k.length > 64) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = cleanSheetData(v, depth + 1, cnt);
    else if (typeof v === 'boolean') out[k] = v ? 1 : 0;
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 5000);
  }
  return out;
}
