'use client';
/**
 * TRPG 로그 — 참여 인물 얼굴 (개인화 추가분)
 *
 * 얼굴 목록은 로그 항목에 `faces` 칸으로 함께 저장한다. 원본 상세 페이지(/trpg/[id])의 수정은
 * 기존 항목을 펼쳐(...l) 덮어쓰므로 이 칸이 지워지지 않고, 로그의 공개범위도 그대로 따른다.
 *
 * 한 사람당 두 장 : thumb = 원형 칸에 보일 작은 그림(1:1 · 긴 변 FACE_PX) / src = 다시 자를 때 쓰는 원본(긴 변 1200)
 */
import React, { useState } from 'react';
import { putBlob, useBlobUrl } from '@/lib/blobStore';
import { KInput } from '@/components/ui/Kit';
import { useToast } from '@/components/ui/Toast';
import { useCrop } from '@/app/my/avochar/_avo/ui';

export const FACE_PX = 160;   // 저장 크기 (표시 44px의 약 3.5배 — 고해상도 화면에서도 선명)
export interface Face { id: string; name: string; thumb: string; src: string }

export function facesOf(v: unknown): Face[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap(x => {
    if (!x || typeof x !== 'object') return [];
    const o = x as Record<string, unknown>;
    const s = (k: string) => (typeof o[k] === 'string' ? (o[k] as string) : '');
    return s('thumb') ? [{ id: s('id') || Math.random().toString(36).slice(2, 10), name: s('name').slice(0, 40), thumb: s('thumb'), src: s('src') || s('thumb') }] : [];
  }).slice(0, 12);
}

/** 원본 보관용 : 긴 변 max 로 줄이기 (GIF·작은 그림은 그대로) */
async function shrink(file: Blob, max: number): Promise<Blob> {
  if (/gif|svg/.test(file.type)) return file;
  const url = URL.createObjectURL(file);
  try {
    const im = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
    if (k >= 1) return file;
    const cv = document.createElement('canvas');
    cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
    const x = cv.getContext('2d')!;
    x.imageSmoothingQuality = 'high';
    x.drawImage(im, 0, 0, cv.width, cv.height);
    const png = /png|webp/.test(file.type);
    return await new Promise<Blob>(res => cv.toBlob(b => res(b ?? file), png ? 'image/png' : 'image/jpeg', 0.9));
  } finally { URL.revokeObjectURL(url); }
}

/* ===================== 보기 : 동그란 얼굴 줄 ===================== */
function FaceDot({ f, size }: { f: Face; size: number }) {
  const url = useBlobUrl(f.thumb);
  return (
    <span className="mt-face" style={{ width: size, height: size }} title={f.name || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? <img src={url} alt={f.name} loading="lazy" decoding="async" /> : <i>{Array.from(f.name)[0] ?? ''}</i>}
    </span>
  );
}
export function FaceRow({ faces, size = 44 }: { faces: Face[]; size?: number }) {
  if (!faces.length) return null;
  return <div className="mt-faces">{faces.map(f => <FaceDot key={f.id} f={f} size={size} />)}</div>;
}

/* ===================== 편집 : 추가 · 다시 자르기 · 이름 · 순서 · 삭제 ===================== */
export function FacesEditor({ value, onChange }: { value: Face[]; onChange: (v: Face[]) => void }) {
  const crop = useCrop();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const pickRef = React.useRef<HTMLInputElement>(null);

  /** 원본 → 1:1 자르기 편집기 → 작은 썸네일 */
  const cut = async (srcUrl: string, type: string): Promise<string> => {
    const b = await crop({ src: srcUrl, name: 'face', type, ratio: '1:1', max: FACE_PX });
    if (!b) return '';
    return putBlob(await shrink(b, FACE_PX));   // 「원본 그대로」를 눌러도 작게
  };

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).filter(f => /^image\//.test(f.type)).slice(0, 12 - value.length);
    if (!list.length) { toast('이미지 파일만 넣을 수 있어요'); return; }
    setBusy(true);
    let next = value;
    try {
      for (const f of list) {
        const orig = await shrink(f, 1200);
        const url = URL.createObjectURL(orig);
        const thumb = await cut(url, orig.type || f.type);
        URL.revokeObjectURL(url);
        if (!thumb) continue;
        const src = await putBlob(orig);
        next = [...next, { id: Math.random().toString(36).slice(2, 10), name: f.name.replace(/\.[^.]+$/, '').slice(0, 40), thumb, src }];
        onChange(next);
      }
    } catch { toast('이미지를 올리지 못했어요'); }
    setBusy(false);
  };

  const reCut = async (i: number, srcUrl?: string) => {
    if (!srcUrl) return;
    setBusy(true);
    try {
      const thumb = await cut(srcUrl, 'image/png');
      if (thumb) onChange(value.map((x, j) => (j === i ? { ...x, thumb } : x)));
    } catch { toast('이미지를 편집하지 못했어요'); }
    setBusy(false);
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const n = value.slice();
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div className="mt-fe">
      <div className="mt-fe-list">
        {value.map((f, i) => <FaceEditRow key={f.id} f={f} i={i} n={value.length} busy={busy}
          onName={name => onChange(value.map((x, j) => (j === i ? { ...x, name } : x)))}
          onReCut={url => { void reCut(i, url); }} onMove={d => move(i, d)}
          onDel={() => onChange(value.filter((_, j) => j !== i))} />)}
      </div>
      {value.length < 12 && (
        <button type="button" className="btn btn-ghost mt-fe-add" disabled={busy} onClick={() => pickRef.current?.click()}>
          {busy ? '처리 중…' : '＋ 얼굴 추가'}
        </button>
      )}
      <input ref={pickRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden style={{ display: 'none' }}
        onChange={e => { void add(e.target.files); e.target.value = ''; }} />
      <p className="mt-fe-help">고르면 1:1 자르기 창이 열려요 · {FACE_PX}px로 자동 축소 · 여러 장 한 번에 가능 · 최대 12명</p>
    </div>
  );
}

function FaceEditRow({ f, i, n, busy, onName, onReCut, onMove, onDel }: {
  f: Face; i: number; n: number; busy: boolean;
  onName: (v: string) => void; onReCut: (srcUrl?: string) => void; onMove: (d: number) => void; onDel: () => void;
}) {
  const srcUrl = useBlobUrl(f.src);
  return (
    <div className="mt-fe-row">
      <FaceDot f={f} size={40} />
      <KInput value={f.name} maxLength={40} placeholder="이름 (마우스를 올리면 보여요)" onChange={e => onName(e.target.value)} />
      <button type="button" className="btn btn-ghost" disabled={busy || !srcUrl} onClick={() => onReCut(srcUrl)} title="원본에서 다시 자르기">✂</button>
      <button type="button" className="btn btn-ghost" disabled={i === 0} onClick={() => onMove(-1)} title="앞으로">←</button>
      <button type="button" className="btn btn-ghost" disabled={i === n - 1} onClick={() => onMove(1)} title="뒤로">→</button>
      <button type="button" className="btn btn-ghost" onClick={onDel} title="빼기">✕</button>
    </div>
  );
}

export const FACES_CSS = `
.mt-faces{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 2px}
.mt-face{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;background:var(--line,#e2e4e8);box-shadow:0 0 0 2px var(--panel-solid,#fff),0 1px 4px rgba(0,0,0,.18)}
.mt-face img{width:100%;height:100%;object-fit:cover;display:block}
.mt-face i{font-style:normal;font-size:12px;font-weight:700;color:var(--sub,#5d636d)}
.ticket .stub .mt-faces{margin-top:8px}
.list-item .mt-faces{margin:4px 0 0;gap:4px}
.mt-fe{display:grid;gap:8px}
.mt-fe-list{display:grid;gap:6px}
.mt-fe-row{display:flex;align-items:center;gap:6px}
.mt-fe-row .k-input{flex:1;min-width:0}
.mt-fe-row .btn{padding:5px 9px;font-size:11px;flex:none}
.mt-fe-add{justify-self:start;padding:6px 12px;font-size:11.5px}
.mt-fe-help{margin:0;font-size:11px;color:var(--faint,#9aa0a9)}
.mt-face-btn{position:absolute;right:12px;top:12px;z-index:5;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border-radius:50%;font-size:15px;line-height:1;opacity:.55;transition:opacity .15s}
.ticket:hover .mt-face-btn{opacity:1}
`;
