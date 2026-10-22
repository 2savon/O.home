'use client';
/**
 * TRPG 시트 — 원본 스킨의 시트 SDK(sheets/_sdk.js)와 같은 약속(postMessage)으로 동작한다.
 * 시트 HTML은 격리된 창(sandbox="allow-scripts", 별도 출처)에서 실행되어
 * 홈페이지 쿠키·로그인·화면에 접근할 수 없다. 저장은 홈페이지가 대신 한다.
 */
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BUILTIN_SHEETS, SHEET_BASE, type SheetLib } from './lib';

export const FONT_CSS = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

/* ---------- 시트 문서 불러오기 (한 번 받은 것은 기억) ---------- */
const cache = new Map<string, Promise<string>>();
function getText(url: string): Promise<string> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text(); });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

/** 시트 메타(이름표) : <meta name="avo-sheet" content='{"name":..,"width":..}'> */
export function sheetMeta(html: string, fallback = ''): { name: string; width: number } {
  const m = /<meta\s+name=["']avo-sheet["']\s+content=(['"])([\s\S]*?)\1/i.exec(html);
  let name = fallback, width = 820;
  if (m) {
    try {
      const txt = m[2].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      const j = JSON.parse(txt) as { name?: unknown; width?: unknown };
      if (typeof j.name === 'string' && j.name) name = j.name;
      if (typeof j.width === 'number') width = Math.max(320, Math.min(1600, Math.round(j.width)));
    } catch { /* 이름표가 깨졌으면 기본값 */ }
  }
  return { name: name || '이름 없는 시트', width };
}

/** 시트 목록 : 기본 9종 + 업로드한 시트 */
export function sheetChoices(lib: SheetLib[]) {
  return [
    ...BUILTIN_SHEETS.map(s => ({ id: s.id, name: s.name, width: s.width, builtin: true })),
    ...lib.map(s => ({ id: `c:${s.id}`, name: s.name, width: s.width, builtin: false })),
  ];
}
export function sheetInfo(id: string, lib: SheetLib[]) {
  return sheetChoices(lib).find(s => s.id === id) ?? null;
}

function buildDoc(sdk: string, html: string): string {
  const s = `<link rel="stylesheet" href="${FONT_CSS}"><script>${sdk.replace(/<\/script/gi, '<\\/script')}</script>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => `${m}<meta charset="utf-8">${s}`);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${s}</head><body>${html}</body></html>`;
}

/** 시트 id → srcdoc 문서 */
export function useSheetDoc(sheetId: string, lib: SheetLib[]): { doc: string; width: number; err: string } {
  const [st, setSt] = useState({ doc: '', width: 820, err: '' });
  const libHtml = sheetId.startsWith('c:') ? lib.find(s => `c:${s.id}` === sheetId) : undefined;
  const custom = libHtml?.html;
  const customW = libHtml?.width;
  useEffect(() => {
    let alive = true;
    setSt({ doc: '', width: 820, err: '' });
    const sdkP = getText(`${SHEET_BASE}_sdk.js`);
    let htmlP: Promise<string>;
    let width = 820;
    if (sheetId.startsWith('b:')) {
      const b = BUILTIN_SHEETS.find(s => s.id === sheetId);
      if (!b) { setSt({ doc: '', width, err: '시트를 찾을 수 없어요.' }); return; }
      width = b.width;
      htmlP = getText(`${SHEET_BASE}${b.file}.html`);
    } else if (custom !== undefined) {
      width = customW ?? 820;
      htmlP = Promise.resolve(custom);
    } else { setSt({ doc: '', width, err: '시트를 찾을 수 없어요. (삭제된 시트)' }); return; }
    Promise.all([sdkP, htmlP]).then(([sdk, html]) => { if (alive) setSt({ doc: buildDoc(sdk, html), width, err: '' }); })
      .catch(() => { if (alive) setSt({ doc: '', width, err: '시트를 불러오지 못했어요.' }); });
    return () => { alive = false; };
  }, [sheetId, custom, customW]);
  return st;
}

/* ---------- 시트 창 ---------- */
export interface SheetInit {
  data: Record<string, unknown>;
  images: Record<string, string>;
  ctx: { name: string; nameSub: string; accent: string; label: string; images: { thumb: string; full: string } };
}
export interface SheetHandle { sendImage: (key: string, url: string) => void; requestData: () => Promise<Record<string, unknown>> }

export const SheetFrame = React.forwardRef<SheetHandle, {
  doc: string; width: number; mode: 'view' | 'edit'; init: SheetInit;
  /** fit = 칸 폭에 맞춰 줄임(읽기 전용) · grow = 남는 폭에 맞춰 최대 1.6배 · edit = 원래 크기(가로 스크롤) */
  layout: 'fit' | 'grow' | 'edit';
  onData?: (d: Record<string, unknown>) => void;
  onImageFile?: (m: { key: string; dataUrl: string; mime: string; ratio: string; max: number }) => void;
  onImageClear?: (key: string) => void;
  className?: string;
}>(function SheetFrame({ doc, width, mode, init, layout, onData, onImageFile, onImageClear, className }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(300);
  const [k, setK] = useState(1);
  const initRef = useRef(init);
  initRef.current = init;
  const cbs = useRef({ onData, onImageFile, onImageClear });
  cbs.current = { onData, onImageFile, onImageClear };
  const finalWait = useRef<((d: Record<string, unknown>) => void) | null>(null);

  const send = useCallback((m: unknown) => { try { frame.current?.contentWindow?.postMessage(m, '*'); } catch { /* 무시 */ } }, []);
  const sendInit = useCallback(() => {
    const i = initRef.current;
    send({ type: 'avo:init', mode, data: i.data, images: i.images, ctx: i.ctx });
  }, [send, mode]);

  useImperativeHandle(ref, () => ({
    sendImage: (key, url) => send({ type: 'avo:image', key, url }),
    requestData: () => new Promise(res => {
      const t = setTimeout(() => { finalWait.current = null; res({}); }, 1500);
      finalWait.current = d => { clearTimeout(t); finalWait.current = null; res(d); };
      send({ type: 'avo:get' });
    }),
  }), [send]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;   // 이 시트 창에서 온 것만
      const m = (e.data ?? {}) as Record<string, unknown>;
      if (m.type === 'avo:ready') sendInit();
      else if (m.type === 'avo:height') setH(Math.max(120, Math.min(Number(m.h) || 0, 20000)));
      else if (m.type === 'avo:data') {
        const d = (m.data && typeof m.data === 'object' ? m.data : {}) as Record<string, unknown>;
        if (m.final && finalWait.current) finalWait.current(d);
        cbs.current.onData?.(d);
      } else if (m.type === 'avo:image-file' && typeof m.key === 'string' && typeof m.dataUrl === 'string') {
        cbs.current.onImageFile?.({ key: m.key, dataUrl: m.dataUrl, mime: String(m.mime ?? ''), ratio: String(m.ratio ?? ''), max: Number(m.max) || 1200 });
      } else if (m.type === 'avo:image-clear' && typeof m.key === 'string') cbs.current.onImageClear?.(m.key);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [sendInit]);

  /* 칸 폭에 맞춰 크기 */
  useEffect(() => {
    const el = host.current;
    if (!el || layout === 'edit') { setK(1); return; }
    const calc = () => {
      let avail = el.clientWidth;
      if (layout === 'grow' && el.parentElement) {
        const ps = getComputedStyle(el.parentElement);
        avail = el.parentElement.clientWidth - (parseFloat(ps.paddingLeft) || 0) - (parseFloat(ps.paddingRight) || 0);
      }
      const kk = (avail || width) / width;
      setK(layout === 'grow' ? Math.min(kk, 1.6) : Math.min(kk, 1));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(layout === 'grow' && el.parentElement ? el.parentElement : el);
    return () => ro.disconnect();
  }, [layout, width]);

  const fitCls = layout === 'edit' ? 'is-edit' : `is-fit${layout === 'grow' ? ' is-grow' : ''}`;
  const hostStyle: React.CSSProperties = layout === 'edit' ? {} : {
    height: Math.ceil(h * k), ...(layout === 'grow' ? { width: Math.floor(width * k) } : {}),
  };
  return (
    <div ref={host} className={`avo-sheet-host ${fitCls} ${className ?? ''}`} style={hostStyle}>
      {doc && (
        <iframe ref={frame} sandbox="allow-scripts" title="TRPG 시트" srcDoc={doc} onLoad={sendInit}
          style={{ width, height: h, transform: Math.abs(k - 1) > 0.001 ? `scale(${k})` : undefined }} />
      )}
    </div>
  );
});
