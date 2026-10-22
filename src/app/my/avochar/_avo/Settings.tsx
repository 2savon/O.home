'use client';
// 라벨 관리 · 게시판 설정 (관리자)
import React, { useState } from 'react';
import { KInput, KRadio, KStep } from '@/components/ui/Kit';
import { ColorField } from '@/components/ui/ColorField';
import { useToast } from '@/components/ui/Toast';
import { useAvo } from './ctx';
import { AvoModal, Icon, useAvoConfirm, useFilePicker } from './ui';
import { PALETTE, cleanColor, type Conf, type Vis } from './lib';
import { sheetMeta } from './Sheet';

/* ===================== 라벨 관리 ===================== */
export function LabelManager({ kind, onClose }: { kind: 'char' | 'rec'; onClose: () => void }) {
  const { store } = useAvo();
  const { conf, chars } = store;
  const list = kind === 'char' ? conf.labels : conf.recLabels;
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[list.length % PALETTE.length]);
  const [msg, setMsg] = useState('');
  const [ask, askNode] = useAvoConfirm();

  const usage = (n: string) => kind === 'char'
    ? chars.filter(c => (c.label || conf.labels[0]?.[0]) === n).length
    : chars.reduce((s, c) => s + c.records.filter(r => r.label === n).length, 0);
  const save = (next: [string, string][]) => store.saveConf({ ...conf, ...(kind === 'char' ? { labels: next } : { recLabels: next }) });

  const add = () => {
    const n = name.trim().slice(0, 30);
    const c = cleanColor(color);
    if (!n) { setMsg('라벨 이름을 적어 주세요.'); return; }
    if (list.some(l => l[0] === n)) { setMsg('이미 있는 라벨이에요.'); return; }
    if (!c) { setMsg('색을 골라 주세요.'); return; }
    save([...list, [n, c]]);
    setName(''); setMsg(''); setColor(PALETTE[(list.length + 1) % PALETTE.length]);
  };

  return (
    <AvoModal open onClose={onClose} boxClass="avo-lbm-box">
      <div className="avo-lbm-head"><b>{kind === 'char' ? '캐릭터 라벨' : '기록 라벨'} 관리</b><small>바꾸면 바로 저장돼요</small></div>
      <ul className="avo-lbm-list">
        {list.map(([n, c], i) => (
          <li key={n}>
            <ColorField value={c} onChange={hex => { const v = cleanColor(hex); if (v) save(list.map((l, j) => (j === i ? [l[0], v] : l))); }} />
            <b className="avo-lbm-name">{n}</b>
            <small>{usage(n)}개</small>
            <button type="button" className="avo-act avo-act-del avo-lbm-del" title="삭제" aria-label="삭제"
              onClick={() => {
                if (list.length <= 1) { setMsg('라벨은 최소 1개 있어야 해요.'); return; }
                const u = usage(n);
                const go = () => save(list.filter((_, j) => j !== i));
                if (u) ask(`「${n}」 라벨을 쓰는 항목이 ${u}개 있어요.\n삭제해도 항목의 라벨 이름은 남고, 색만 자동 색으로 바뀌어요.`, go, { danger: true, okLabel: '삭제' });
                else go();
              }}><Icon name="trash" /></button>
          </li>
        ))}
      </ul>
      <p className="avo-lbm-msg">{msg}</p>
      <div className="avo-lbm-add">
        <KInput value={name} maxLength={30} placeholder="새 라벨 이름" onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <ColorField value={color} onChange={setColor} />
        <button type="button" className="avo-btn avo-btn-pri" onClick={add}>추가</button>
      </div>
      <div style={{ padding: '0 16px 14px', textAlign: 'right' }}><button type="button" className="avo-btn" onClick={onClose}>닫기</button></div>
      {askNode}
    </AvoModal>
  );
}

/* ===================== 게시판 설정 ===================== */
export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { store, siteAccent } = useAvo();
  const toast = useToast();
  const [c, setC] = useState<Conf>(store.conf);
  const [dirty, setDirty] = useState(false);
  const [ask, askNode] = useAvoConfirm();
  const set = <K extends keyof Conf>(k: K, v: Conf[K]) => { setC(x => ({ ...x, [k]: v })); setDirty(true); };
  const [pickSheet, sheetInput] = useFilePicker('.html,.htm,text/html', async f => {
    if (f.size > 700 * 1024) { toast('시트 파일은 700KB 이하만 올릴 수 있어요'); return; }
    const html = (await f.text()).replace(/^﻿/, '');
    if (!html.trim()) return;
    const m = sheetMeta(html, f.name.replace(/\.[^.]+$/, ''));
    store.addSheetLib({ name: m.name.slice(0, 60), width: m.width, html });
    toast(`「${m.name}」 시트를 올렸어요`);
  });

  const visLabel: Record<Vis, string> = { public: '전체 공개', member: '회원만', private: '관리자만' };
  const save = () => {
    const changedVis = c.vis !== store.conf.vis;
    store.saveConf(c);
    setDirty(false);
    if (changedVis) {
      ask('공개범위를 바꿨어요. 이미 저장된 캐릭터·글에도 적용할까요?\n(적용하지 않으면 새로 저장하는 것부터 바뀌어요)', () => {
        setTimeout(() => { const n = store.reapplyVis(c.vis); toast(`${n}개 항목에 적용했어요`); onClose(); }, 50);
      }, { okLabel: '적용' });
    } else { toast('저장했어요'); onClose(); }
  };

  return (
    <AvoModal open onClose={onClose} dirty={dirty} boxClass="avo-form-box is-s">
      <div className="avo-form-scroll">
        <h2 className="avo-w-title">게시판 설정</h2>
        <fieldset className="avo-fs">
          <legend>제목</legend>
          <div className="avo-set-grid">
            <label className="avo-f"><span className="avo-lbl">페이지 제목</span><KInput value={c.title} maxLength={60} onChange={e => set('title', e.target.value)} /></label>
            <label className="avo-f"><span className="avo-lbl">설명 <small>(제목 아래)</small></span><KInput value={c.desc} maxLength={200} onChange={e => set('desc', e.target.value)} /></label>
          </div>
        </fieldset>
        <fieldset className="avo-fs">
          <legend>공개범위 · 권한</legend>
          <div className="avo-f"><span className="avo-lbl">게시판 공개범위 <small>(서버에서 막아요 — 메뉴를 숨기는 것과 달리 주소·API로도 안 보여요)</small></span>
            <div className="avo-radios">
              {(['public', 'member', 'private'] as Vis[]).map(v => <KRadio key={v} name="avo-vis" value={v} current={c.vis} onChange={x => set('vis', x as Vis)} label={visLabel[v]} />)}
            </div>
          </div>
          <div className="avo-f"><span className="avo-lbl">게시글 작성</span>
            <div className="avo-radios">
              <KRadio name="avo-pp" value="admin" current={c.postPerm} onChange={() => set('postPerm', 'admin')} label="관리자만" />
              <KRadio name="avo-pp" value="member" current={c.postPerm} onChange={() => set('postPerm', 'member')} label="로그인한 회원" />
            </div>
          </div>
          <div className="avo-f"><span className="avo-lbl">댓글</span>
            <div className="avo-radios">
              <KRadio name="avo-cp" value="member" current={c.cmtPerm} onChange={() => set('cmtPerm', 'member')} label="로그인한 회원" />
              <KRadio name="avo-cp" value="none" current={c.cmtPerm} onChange={() => set('cmtPerm', 'none')} label="사용 안 함" />
            </div>
          </div>
          <p className="avo-help">캐릭터 등록·수정은 관리자만 할 수 있어요. 비밀글은 작성자와 관리자만 서버에서 받을 수 있어요.</p>
        </fieldset>
        <fieldset className="avo-fs">
          <legend>화면</legend>
          <div className="avo-f"><span className="avo-lbl">캐릭터 페이지</span>
            <div className="avo-radios">
              <KRadio name="avo-vm" value="full" current={c.viewMode} onChange={() => set('viewMode', 'full')} label="화면 전체를 덮음" />
              <KRadio name="avo-vm" value="fit" current={c.viewMode} onChange={() => set('viewMode', 'fit')} label="홈 레이아웃 안에서" />
            </div>
          </div>
          <div className="avo-set-grid">
            <div className="avo-f"><span className="avo-lbl">캐릭터 목록 한 쪽</span><KStep value={c.perPage} min={4} max={40} onChange={v => set('perPage', v)} suffix="명" /></div>
            <div className="avo-f"><span className="avo-lbl">게시글 목록 한 쪽</span><KStep value={c.postRows} min={5} max={100} onChange={v => set('postRows', v)} suffix="개" /></div>
          </div>
          <div className="avo-f"><span className="avo-lbl">기록 정렬</span>
            <div className="avo-radios">
              <KRadio name="avo-rs" value="desc" current={c.recSort} onChange={() => set('recSort', 'desc')} label="최신 날짜가 위" />
              <KRadio name="avo-rs" value="asc" current={c.recSort} onChange={() => set('recSort', 'asc')} label="오래된 날짜가 위" />
            </div>
          </div>
          <div className="avo-f"><span className="avo-lbl">기본 컬러 <small>(테마 컬러를 비운 캐릭터 · 비우면 O.home 강조색 {siteAccent})</small></span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <ColorField value={c.accent || siteAccent} onChange={v => set('accent', cleanColor(v))} />
              {c.accent && <button type="button" className="avo-btn avo-btn-s" onClick={() => set('accent', '')}>비우기</button>}
            </div>
          </div>
        </fieldset>
        <fieldset className="avo-fs">
          <legend>업로드한 TRPG 시트 <small>홈 전체에서 공유 · 만드는 법은 sheets/SHEET_GUIDE.md</small></legend>
          <ul className="avo-lbm-list avo-sheet-lib" style={{ padding: 0 }}>
            {store.sheetLib.map(s => (
              <li key={s.id} style={{ padding: '6px 0' }}>
                <b>{s.name}</b><small>{s.width}px · {Math.round(s.html.length / 1024)}KB</small>
                <button type="button" className="avo-act avo-act-del" title="삭제" aria-label="삭제"
                  onClick={() => ask(`「${s.name}」 시트를 삭제할까요?\n이 시트를 고른 캐릭터에서는 시트가 보이지 않게 돼요.`, () => store.deleteSheetLib(s.id), { danger: true, okLabel: '삭제' })}>
                  <Icon name="trash" /></button>
              </li>
            ))}
            {!store.sheetLib.length && <li className="avo-dim" style={{ padding: '6px 0' }}>아직 없어요.</li>}
          </ul>
          <button type="button" className="avo-btn avo-btn-s avo-btn-add" onClick={pickSheet}><Icon name="plus" />시트 업로드 (.html)</button>
          {sheetInput}
        </fieldset>
      </div>
      <div className="avo-w-btns">
        <button type="button" className="avo-btn" onClick={onClose}>닫기</button>
        <button type="button" className="avo-btn avo-btn-pri" onClick={save}>저장</button>
      </div>
      {askNode}
    </AvoModal>
  );
}
