'use client';
// 공용 부품 — 아이콘 · 팝업창 · 이미지 칸(자르기·크기 편집기) · 썸네일 위치 · 텍스트 에디터
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { putBlob, useBlobUrl, getBlob } from '@/lib/blobStore';
import { KInput } from '@/components/ui/Kit';
import { useToast } from '@/components/ui/Toast';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Pos } from './lib';

/* ===================== 아이콘 (원본 스킨의 픽토그램 그대로) ===================== */
const ICONS: Record<string, string> = {
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  story: '<path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',
  log: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.5h5"/>',
  sheet: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-2-.4-1.2.4-2.3 1.7-2.3H18a3 3 0 0 0 3-3C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  record: '<path d="M7 3h10v18l-5-4-5 4z"/><path d="M10 8h4"/>',
  alert: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".6"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.3"/>',
};
export function Icon({ name }: { name: string }) {
  return <svg className="avo-ico" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />;
}

/* ===================== 스크롤 잠금 (여러 곳이 동시에 잠가도 안전하게) ===================== */
let locks = 0;
export function useScrollLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    locks++;
    document.documentElement.classList.add('avo-lock-scroll');
    return () => {
      locks = Math.max(0, locks - 1);
      if (!locks) document.documentElement.classList.remove('avo-lock-scroll');
    };
  }, [on]);
}

/* ===================== 팝업창 ===================== */
export function AvoModal({ open, onClose, children, className, accent, boxClass, dirty }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
  className?: string; boxClass?: string; accent?: string; dirty?: boolean;
}) {
  const [ask, setAsk] = useState(false);
  useScrollLock(open);
  useEffect(() => { if (!open) setAsk(false); }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (dirty) setAsk(true); else onClose(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose, dirty]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className={`avo-modal is-open ${className ?? ''}`} style={accent ? ({ '--avo-accent': accent } as React.CSSProperties) : undefined}>
      <div className="avo-modal-dim" onMouseDown={() => (dirty ? setAsk(true) : onClose())} />
      <div className={boxClass ?? 'avo-form-box'} role="dialog">{children}</div>
      {ask && (
        <div className="avo-modal is-open" style={{ zIndex: 89 }}>
          <div className="avo-modal-dim" onMouseDown={() => setAsk(false)} />
          <div className="avo-lbm-box" style={{ padding: 20 }}>
            <b style={{ fontSize: 15 }}>변경사항이 저장되지 않았어요</b>
            <p className="avo-help" style={{ margin: '6px 0 14px' }}>이대로 닫으면 입력한 내용이 사라져요.</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button type="button" className="avo-btn" onClick={() => { setAsk(false); onClose(); }}>저장하지 않고 닫기</button>
              <button type="button" className="avo-btn avo-btn-pri" onClick={() => setAsk(false)}>계속 편집</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

/** 확인창 (브라우저 confirm 대신) */
export function useAvoConfirm() {
  const [st, setSt] = useState<{ msg: string; ok: () => void; danger?: boolean; okLabel?: string } | null>(null);
  const ask = useCallback((msg: string, ok: () => void, opt?: { danger?: boolean; okLabel?: string }) => setSt({ msg, ok, ...opt }), []);
  const node = st ? (
    <AvoModal open onClose={() => setSt(null)} boxClass="avo-lbm-box">
      <div style={{ padding: 20 }}>
        <p style={{ margin: '0 0 16px', whiteSpace: 'pre-line', fontSize: 14 }}>{st.msg}</p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button type="button" className="avo-btn" onClick={() => setSt(null)}>취소</button>
          <button type="button" className={`avo-btn avo-btn-pri ${st.danger ? 'avo-btn-danger' : ''}`}
            onClick={() => { const f = st.ok; setSt(null); f(); }}>{st.okLabel ?? '확인'}</button>
        </div>
      </div>
    </AvoModal>
  ) : null;
  return [ask, node] as const;
}

/* ===================== 이미지 ===================== */
/** 저장 참조(파일 id · URL) → 화면에 쓸 수 있는 주소 */
export const useImg = (ref?: string) => useBlobUrl(ref || undefined);

export function Img({ src, alt, className, style, onClick }: {
  src?: string; alt?: string; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  const url = useImg(src);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt ?? ''} className={className} style={style} onClick={onClick} loading="lazy" decoding="async" />;
}

/** 참조 → 시트(격리된 창)에 넘길 주소. 로컬 모드 파일 id는 data: 주소로 바꾼다 (blob: 주소는 격리 창에서 못 읽음) */
export async function refToPortableUrl(ref: string): Promise<string> {
  if (!ref) return '';
  if (/^(https?:|data:)/.test(ref) || ref.startsWith('/')) return ref;
  const b = await getBlob(ref).catch(() => null);
  if (!b) return '';
  return new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(''); r.readAsDataURL(b); });
}

export const posStyle = (p?: Pos): React.CSSProperties =>
  (p ? ({ '--tp': `${p.x}% ${p.y}%`, '--tz': p.z } as React.CSSProperties) : {});

/* ---------- 자르기 · 크기 편집기 ---------- */
type Ratio = '' | '3:4' | '1:1' | '2:3' | '4:3' | '16:9';
const RATIOS: Ratio[] = ['', '3:4', '1:1', '2:3', '4:3', '16:9'];
const ratioNum = (r: Ratio) => { if (!r) return 0; const [a, b] = r.split(':').map(Number); return a / b; };

export interface CropReq { src: string; name: string; type: string; ratio?: string; max?: number; resolve: (b: Blob | null) => void }

export function CropModal({ req, onDone }: { req: CropReq | null; onDone: () => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [err, setErr] = useState('');
  const [rot, setRot] = useState(0);
  const [flip, setFlip] = useState(false);
  const [ratio, setRatio] = useState<Ratio>('');
  const [maxPx, setMaxPx] = useState(1200);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 1, h: 1 });   // 0~1 (회전 반영된 이미지 기준)
  const stageRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({ w: 0, h: 0 });
  useScrollLock(!!req);

  useEffect(() => {
    if (!req) return;
    setErr(''); setImg(null); setRot(0); setFlip(false);
    const r0 = (RATIOS.includes((req.ratio ?? '') as Ratio) ? req.ratio : '') as Ratio;
    setRatio(r0); setMaxPx(req.max && req.max > 0 ? req.max : 1200);
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => setImg(im);
    im.onerror = () => setErr('이미지를 불러오지 못했어요. (다른 사이트 이미지는 편집할 수 없어요)');
    im.src = req.src;
  }, [req]);

  const rw = img ? (rot % 180 ? img.naturalHeight : img.naturalWidth) : 1;
  const rh = img ? (rot % 180 ? img.naturalWidth : img.naturalHeight) : 1;

  /* 비율이 바뀌면 가운데에 가장 큰 사각형 */
  const fitRect = useCallback((r: Ratio) => {
    const k = ratioNum(r);
    if (!k) { setRect({ x: 0, y: 0, w: 1, h: 1 }); return; }
    const imgK = rw / rh;
    let w = 1, h = 1;
    if (imgK > k) w = k / imgK; else h = imgK / k;
    setRect({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  }, [rw, rh]);
  useEffect(() => { if (img) fitRect(ratio); }, [img, rot, ratio, fitRect]);

  /* 미리보기 그리기 */
  useEffect(() => {
    const st = stageRef.current, cv = cvRef.current;
    if (!img || !st || !cv) return;
    const draw = () => {
      const W = st.clientWidth - 20, H = st.clientHeight - 20;
      const s = Math.min(W / rw, H / rh, 1);
      const w = Math.max(1, Math.round(rw * s)), h = Math.max(1, Math.round(rh * s));
      cv.width = w; cv.height = h;
      const x = cv.getContext('2d')!;
      x.save();
      x.translate(w / 2, h / 2);
      x.rotate(rot * Math.PI / 180);
      if (flip) x.scale(-1, 1);
      const dw = rot % 180 ? h : w, dh = rot % 180 ? w : h;
      x.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      x.restore();
      setView({ w, h });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(st);
    return () => ro.disconnect();
  }, [img, rot, flip, rw, rh]);

  /* 끌기 : 이동 / 모서리 크기 조절 */
  const drag = useRef<{ mode: string; sx: number; sy: number; r: typeof rect } | null>(null);
  const onDown = (e: React.PointerEvent, mode: string) => {
    e.preventDefault(); e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, r: rect };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !view.w) return;
    const dx = (e.clientX - d.sx) / view.w, dy = (e.clientY - d.sy) / view.h;
    const k = ratioNum(ratio) ? ratioNum(ratio) * (rh / rw) : 0;   // 0~1 좌표에서의 w/h 비
    let { x, y, w, h } = d.r;
    if (d.mode === 'move') {
      x = Math.max(0, Math.min(1 - w, x + dx)); y = Math.max(0, Math.min(1 - h, y + dy));
    } else {
      const [hx, hy] = d.mode.split(',').map(Number);
      let nw = Math.max(0.05, w + hx * dx), nh = Math.max(0.05, h + hy * dy);
      if (k) { if (Math.abs(dx) > Math.abs(dy)) nh = nw / k; else nw = nh * k; }
      const ax = hx < 0 ? x + w : x, ay = hy < 0 ? y + h : y;   // 반대편 모서리 고정
      nw = Math.min(nw, hx < 0 ? ax : 1 - ax); nh = Math.min(nh, hy < 0 ? ay : 1 - ay);
      if (k) { if (nw / nh > k) nw = nh * k; else nh = nw / k; }
      x = hx < 0 ? ax - nw : ax; y = hy < 0 ? ay - nh : ay; w = nw; h = nh;
    }
    setRect({ x, y, w, h });
  };
  const onUp = () => { drag.current = null; };

  const outW = Math.round(rect.w * rw), outH = Math.round(rect.h * rh);
  const sc = Math.min(1, maxPx > 0 ? maxPx / Math.max(outW, outH) : 1);

  const apply = () => {
    if (!img || !req) return;
    const full = document.createElement('canvas');
    full.width = rw; full.height = rh;
    const fx = full.getContext('2d')!;
    fx.translate(rw / 2, rh / 2);
    fx.rotate(rot * Math.PI / 180);
    if (flip) fx.scale(-1, 1);
    fx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(outW * sc)); out.height = Math.max(1, Math.round(outH * sc));
    const ox = out.getContext('2d')!;
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(full, rect.x * rw, rect.y * rh, outW, outH, 0, 0, out.width, out.height);
    const png = /png|webp|svg/.test(req.type);
    try {
      out.toBlob(b => { req.resolve(b); onDone(); }, png ? 'image/png' : 'image/jpeg', 0.92);
    } catch {
      setErr('이 이미지는 편집할 수 없어요 (다른 사이트 이미지).');
    }
  };
  const cancel = () => { req?.resolve(null); onDone(); };

  if (!req || typeof document === 'undefined') return null;
  return createPortal(
    <div className="avo-modal avo-crop-modal is-open">
      <div className="avo-modal-dim" onMouseDown={cancel} />
      <div className="avo-crop-box">
        <div className="avo-crop-head"><b>이미지 자르기 · 크기</b><span className="avo-crop-size">{img ? `${Math.round(outW * sc)} × ${Math.round(outH * sc)}px` : ''}</span></div>
        <div className="avo-crop-stage" ref={stageRef} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {err ? <p className="avo-crop-msg">{err}</p> : !img ? <p className="avo-crop-msg">불러오는 중…</p> : (
            <div className="avo-crop-view" style={{ display: 'block', width: view.w, height: view.h }}>
              <canvas ref={cvRef} className="avo-crop-cv" />
              <div className="avo-crop-rect" onPointerDown={e => onDown(e, 'move')}
                style={{ left: rect.x * view.w, top: rect.y * view.h, width: rect.w * view.w, height: rect.h * view.h }}>
                {['-1,-1', '1,-1', '-1,1', '1,1'].map(h => <i key={h} data-h={h} onPointerDown={e => onDown(e, h)} />)}
              </div>
            </div>
          )}
          {!img && !err && <canvas ref={cvRef} style={{ display: 'none' }} />}
        </div>
        <div className="avo-crop-ctrl">
          <div className="avo-crop-row"><span className="avo-lbl">비율</span>
            {RATIOS.map(r => <button key={r || 'free'} type="button" className={`avo-btn avo-btn-s ${ratio === r ? 'avo-btn-pri' : ''}`} onClick={() => setRatio(r)}>{r || '자유'}</button>)}
          </div>
          <div className="avo-crop-row"><span className="avo-lbl">긴 변 최대</span>
            {[600, 1200, 2000, 2400].map(n => <button key={n} type="button" className={`avo-btn avo-btn-s ${maxPx === n ? 'avo-btn-pri' : ''}`} onClick={() => setMaxPx(n)}>{n}px</button>)}
            <span className="avo-sp" />
            <button type="button" className="avo-btn avo-btn-s" onClick={() => setRot(r => (r + 90) % 360)}>↻ 회전</button>
            <button type="button" className="avo-btn avo-btn-s" onClick={() => setFlip(f => !f)}>⇋ 좌우반전</button>
          </div>
        </div>
        <div className="avo-crop-btns">
          <button type="button" className="avo-btn" onClick={() => { if (req) { void fetch(req.src).then(r => r.blob()).then(b => { req.resolve(b); onDone(); }).catch(() => setErr('원본을 불러오지 못했어요.')); } }}>원본 그대로</button>
          <span className="avo-sp" />
          <button type="button" className="avo-btn" onClick={cancel}>취소</button>
          <button type="button" className="avo-btn avo-btn-pri" onClick={apply} disabled={!img}>적용</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** 자르기 편집기를 여는 훅 — 페이지에 하나 */
const CropCtx = React.createContext<(r: Omit<CropReq, 'resolve'>) => Promise<Blob | null>>(async () => null);
export function CropProvider({ children }: { children: React.ReactNode }) {
  const [req, setReq] = useState<CropReq | null>(null);
  const open = useCallback((r: Omit<CropReq, 'resolve'>) => new Promise<Blob | null>(resolve => setReq({ ...r, resolve })), []);
  return <CropCtx.Provider value={open}>{children}<CropModal req={req} onDone={() => setReq(null)} /></CropCtx.Provider>;
}
export const useCrop = () => React.useContext(CropCtx);

/** 파일 고르기 → (GIF 제외) 자르기 편집기 → 업로드 → 참조 */
export function usePickImage() {
  const crop = useCrop();
  const toast = useToast();
  return useCallback(async (file: File, ratio?: string, max?: number): Promise<string> => {
    if (!/^image\//.test(file.type)) { toast('이미지 파일만 올릴 수 있어요'); return ''; }
    if (file.size > 15 * 1024 * 1024) { toast('15MB 이하 이미지만 올릴 수 있어요'); return ''; }
    let blob: Blob | null = file;
    if (!/gif/.test(file.type)) {
      const url = URL.createObjectURL(file);
      blob = await crop({ src: url, name: file.name, type: file.type, ratio, max });
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (!blob) return '';
    }
    try { return await putBlob(blob); } catch { toast('이미지를 올리지 못했어요'); return ''; }
  }, [crop, toast]);
}

/** 파일 선택창 (숨긴 input) */
export function useFilePicker(accept: string, onFile: (f: File) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const node = <input ref={ref} type="file" accept={accept} hidden style={{ display: 'none' }}
    onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }} />;
  return [() => ref.current?.click(), node] as const;
}

/** 이미지 칸 : 주소 입력 또는 파일 올리기 (+ 다시 자르기 · 비우기) */
export function ImageField({ label, value, onChange, ratio, max, help }: {
  label: React.ReactNode; value: string; onChange: (ref: string) => void;
  ratio?: string; max?: number; help?: string;
}) {
  const pick = usePickImage();
  const crop = useCrop();
  const toast = useToast();
  const url = useImg(value);
  const [busy, setBusy] = useState(false);
  const isRemote = /^(https?:)?\/\//.test(value);
  const [open, input] = useFilePicker('image/png,image/jpeg,image/gif,image/webp', async f => {
    setBusy(true);
    const r = await pick(f, ratio, max);
    setBusy(false);
    if (r) onChange(r);
  });
  const reEdit = async () => {
    if (!url) return;
    const b = await crop({ src: url, name: 'image', type: 'image/png', ratio, max });
    if (!b) return;
    setBusy(true);
    try { onChange(await putBlob(b)); } catch { toast('이미지를 올리지 못했어요'); }
    setBusy(false);
  };
  return (
    <div className="avo-imgf">
      <span className="avo-imgf-prev">{url ? <img src={url} alt="" /> : <span className="avo-imgf-note">＋</span>}</span>
      <div className="avo-imgf-body">
        <span className="avo-lbl">{label}</span>
        <div className="avo-imgf-url">
          <KInput value={isRemote ? value : value ? '(올린 파일)' : ''} placeholder="이미지 주소(URL) 또는 [파일]"
            readOnly={!!value && !isRemote}
            onChange={e => onChange(e.target.value.trim())} />
        </div>
        <div className="avo-imgf-row" style={{ marginTop: 6 }}>
          <button type="button" className="avo-btn avo-btn-s" onClick={open} disabled={busy}>{busy ? '올리는 중…' : '파일'}</button>
          {url && <button type="button" className="avo-btn avo-btn-s" onClick={reEdit} disabled={busy}>자르기·크기</button>}
          {value && <button type="button" className="avo-btn avo-btn-s" onClick={() => onChange('')}>비우기</button>}
        </div>
        {help && <p className="avo-help">{help}</p>}
      </div>
      {input}
    </div>
  );
}

/* ===================== 썸네일 위치 · 크기 ===================== */
export function ThumbPos({ label, src, value, onChange, help }: {
  label: React.ReactNode; src: string; value?: Pos; onChange: (p: Pos | undefined) => void; help?: string;
}) {
  const url = useImg(src);
  const p = value ?? { x: 50, y: 0, z: 1 };
  const box = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ sx: number; sy: number; p: Pos } | null>(null);
  return (
    <div className="avo-tpos">
      <span className="avo-lbl">{label}</span>
      <div className="avo-tpos-wrap">
        <span ref={box} className="avo-tpos-box" style={posStyle(p)}
          onPointerDown={e => { if (!url) return; (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = { sx: e.clientX, sy: e.clientY, p }; }}
          onPointerMove={e => {
            const d = drag.current; if (!d || !box.current) return;
            const W = box.current.clientWidth;
            const k = 100 / (W * Math.max(1, d.p.z));
            onChange({ x: Math.max(0, Math.min(100, d.p.x - (e.clientX - d.sx) * k)), y: Math.max(0, Math.min(100, d.p.y - (e.clientY - d.sy) * k)), z: d.p.z });
          }}
          onPointerUp={() => { drag.current = null; }}
          onWheel={e => { if (!url) return; const z = Math.max(1, Math.min(4, p.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); onChange({ ...p, z }); }}>
          {url ? <img src={url} alt="" draggable={false} /> : <span className="avo-tpos-empty">이미지를 먼저 넣어 주세요</span>}
        </span>
        <div className="avo-tpos-ctrl">
          <label className="avo-tpos-zoom">크기
            <input type="range" min={1} max={4} step={0.05} value={p.z} onChange={e => onChange({ ...p, z: +e.target.value })} />
            <span>{p.z.toFixed(2)}×</span>
          </label>
          <p className="avo-help">{help ?? '이미지를 끌어서 보일 위치를 정하고, 슬라이더(휠)로 크기를 정해요.'}</p>
          <button type="button" className="avo-btn avo-btn-s" onClick={() => onChange(undefined)}>기본값</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== 텍스트 에디터 (프로필) — 원본 avoc_rte 이식 ===================== */
const RTE_TOOLS: ([string, React.ReactNode, string] | '|')[] = [
  ['bold', <b key="b">B</b>, '굵게'], ['italic', <i key="i">I</i>, '기울임'], ['underline', <u key="u">U</u>, '밑줄'], ['strikeThrough', <s key="s">S</s>, '취소선'], '|',
  ['size-s', <small key="s">가</small>, '작은 글씨'], ['size-m', '가', '보통 글씨'], ['size-l', <big key="l">가</big>, '큰 글씨'], '|',
  ['color', <span key="c" className="avo-rte-color">A</span>, '글자색'], '|',
  ['justifyLeft', '⇤', '왼쪽 정렬'], ['justifyCenter', '↔', '가운데 정렬'], ['justifyRight', '⇥', '오른쪽 정렬'], '|',
  ['insertUnorderedList', '•', '목록'], ['link', '🔗', '링크'], ['insertHorizontalRule', '―', '구분선'], ['removeFormat', '⌫', '서식 지우기'],
];
export function Rte({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const area = useRef<HTMLDivElement>(null);
  const init = useRef(false);
  const [linkAsk, setLinkAsk] = useState<string | null>(null);
  const saved = useRef<Range | null>(null);
  useEffect(() => {
    if (!area.current || init.current) return;
    area.current.innerHTML = cleanProfileHtml(value);
    init.current = true;
  }, [value]);
  const emit = () => { if (area.current) onChange(area.current.innerHTML); };
  const keep = () => { const s = window.getSelection(); if (s && s.rangeCount) saved.current = s.getRangeAt(0).cloneRange(); };
  const restore = () => { const s = window.getSelection(); if (s && saved.current) { s.removeAllRanges(); s.addRange(saved.current); } };
  const run = (cmd: string, arg?: string) => {
    area.current?.focus();
    restore();
    if (cmd.startsWith('size-')) {
      document.execCommand('fontSize', false, cmd === 'size-s' ? '2' : cmd === 'size-l' ? '5' : '3');
    } else document.execCommand(cmd, false, arg);
    emit();
  };
  return (
    <div className="avo-rte">
      <div className="avo-rte-bar" role="toolbar" onMouseDown={e => { if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault(); }}>
        {RTE_TOOLS.map((t, i) => t === '|' ? <i key={i} className="avo-rte-sep" /> : t[0] === 'color' ? (
          <label key={i} className="avo-rte-btn" title={t[2]}>{t[1]}
            <input type="color" defaultValue="#c76b8f" onMouseDown={keep} onChange={e => run('foreColor', e.target.value)} />
          </label>
        ) : (
          <button key={i} type="button" className="avo-rte-btn" title={t[2]} aria-label={t[2]}
            onClick={() => { if (t[0] === 'link') { keep(); setLinkAsk(''); } else run(t[0]); }}>{t[1]}</button>
        ))}
      </div>
      {linkAsk !== null && (
        <div className="avo-rte-bar" style={{ gap: 6 }}>
          <KInput autoFocus value={linkAsk} placeholder="https://" onChange={e => setLinkAsk(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (/^https?:\/\//.test(linkAsk)) run('createLink', linkAsk); setLinkAsk(null); } }} />
          <button type="button" className="avo-btn avo-btn-s" onClick={() => { if (/^https?:\/\//.test(linkAsk)) run('createLink', linkAsk); setLinkAsk(null); }}>넣기</button>
          <button type="button" className="avo-btn avo-btn-s" onClick={() => setLinkAsk(null)}>취소</button>
        </div>
      )}
      <div ref={area} className="avo-rte-area" contentEditable suppressContentEditableWarning data-ph={placeholder ?? ''}
        onInput={emit} onBlur={() => { keep(); emit(); }} onKeyUp={keep} onMouseUp={keep}
        onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); emit(); }} />
    </div>
  );
}

/** 프로필 HTML : 예전처럼 일반 텍스트면 줄바꿈 유지, HTML이면 정화 */
export function cleanProfileHtml(s: string): string {
  if (!s) return '';
  if (!/<[a-z/][^>]*>/i.test(s)) return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)).replace(/\n/g, '<br>');
  return sanitizeHtml(s);
}

/** 여러 줄 일반 텍스트 */
export function Nl({ text }: { text: string }) {
  const lines = text.split('\n');
  return <>{lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}</>;
}
