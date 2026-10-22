'use client';
// 캐릭터 편집창들 — 원본 write.skin.php (캐릭터 · 옷장/AU · 기록 · 커미션 자료 · TRPG 시트 입력)
import React, { useMemo, useRef, useState } from 'react';
import { KCheck, KDate, KInput, KRadio, KSelect, KTextarea } from '@/components/ui/Kit';
import { ColorField } from '@/components/ui/ColorField';
import { RichEditor } from '@/components/ui/RichEditor';
import { useToast } from '@/components/ui/Toast';
import { putBlob } from '@/lib/blobStore';
import { useAvo, themeOf } from './ctx';
import { AvoModal, Icon, ImageField, Rte, ThumbPos, refToPortableUrl, useAvoConfirm, useCrop, useFilePicker } from './ui';
import {
  TAB_LIST, blankChar, cleanColor, cleanUrl, labelColor, newId,
  type Char, type ComColor, type ComImg, type Rec, type Rel, type SheetEntry, type TabKey, type Wd,
} from './lib';
import { SheetFrame, sheetChoices, sheetMeta, useSheetDoc, type SheetHandle, type SheetInit } from './Sheet';

/* ---------- 공용 ---------- */
function F({ label, children, full }: { label: React.ReactNode; children: React.ReactNode; full?: boolean }) {
  return <div className="avo-f" style={full ? { gridColumn: '1 / -1' } : undefined}><span className="avo-lbl">{label}</span>{children}</div>;
}
function Fs({ title, children, extra }: { title: React.ReactNode; children: React.ReactNode; extra?: React.ReactNode }) {
  return <fieldset className="avo-fs"><legend>{title}</legend>{extra}{children}</fieldset>;
}
function FormShell({ title, sub, onClose, onSave, dirty, saving, children, err, small, saveLabel, danger }: {
  title: string; sub?: string; onClose: () => void; onSave: () => void; dirty: boolean; saving?: boolean;
  children: React.ReactNode; err?: string; small?: boolean; saveLabel?: string; danger?: boolean;
}) {
  const { store, siteAccent } = useAvo();
  return (
    <AvoModal open onClose={onClose} dirty={dirty} accent={store.conf.accent || siteAccent} boxClass={`avo-form-box ${small ? 'is-s' : ''}`}>
      <div className="avo-form-scroll avo-write">
        <h2 className="avo-w-title">{title}{sub && <small>{sub}</small>}</h2>
        {err && <p className="avo-err">{err}</p>}
        {children}
      </div>
      <div className="avo-w-btns">
        <button type="button" className="avo-btn" onClick={onClose}>취소</button>
        <button type="button" className={`avo-btn avo-btn-pri ${danger ? 'avo-btn-danger' : ''}`} onClick={onSave} disabled={saving}>{saving ? '저장 중…' : saveLabel ?? '저장'}</button>
      </div>
    </AvoModal>
  );
}

/** 최신 캐릭터 값(다른 창에서 바뀌었을 수 있음) 위에 변경분만 덮어 저장 */
function useSaveChar() {
  const { store } = useAvo();
  return (id: string, patch: Partial<Char>) => {
    const base = store.chars.find(c => c.id === id);
    if (!base) return '';
    return store.saveChar({ ...base, ...patch });
  };
}

/* ===================== 캐릭터 생성 / 수정 ===================== */
export function CharForm({ char, onClose, onSaved }: { char?: Char; onClose: () => void; onSaved: (id: string) => void }) {
  const { store, siteAccent } = useAvo();
  const toast = useToast();
  const { conf, chars, sheetLib } = store;
  const [c, setC] = useState<Char>(() => char ? structuredClone(char) : { ...blankChar(), label: conf.labels[0]?.[0] ?? 'OC', order: (chars.at(-1)?.order ?? 0) + 1 });
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof Char>(k: K, v: Char[K]) => { setC(x => ({ ...x, [k]: v })); setDirty(true); };
  const [pv, setPv] = useState(0);   // 시트 미리보기 줄

  const choices = sheetChoices(sheetLib);
  const [pickSheet, sheetInput] = useFilePicker('.html,.htm,text/html', async f => {
    if (f.size > 700 * 1024) { toast('시트 파일은 700KB 이하만 올릴 수 있어요'); return; }
    const html = (await f.text()).replace(/^﻿/, '');
    if (!html.trim()) return;
    const m = sheetMeta(html, f.name.replace(/\.[^.]+$/, ''));
    const id = store.addSheetLib({ name: m.name.slice(0, 60), width: m.width, html });
    if (c.sheets.length < 10) { set('sheets', [...c.sheets, { id: newId(8), sheetId: `c:${id}`, title: '', img: {} }]); setPv(c.sheets.length); }
    toast(`「${m.name}」 시트를 올렸어요`);
  });

  const save = () => {
    if (!c.name.trim()) { setErr('이름은 필수 입력이에요.'); return; }
    const id = store.saveChar({ ...c, name: c.name.trim().slice(0, 80), accent: cleanColor(c.accent), bgColor: cleanColor(c.bgColor), bgm: cleanUrl(c.bgm) });
    setDirty(false);
    onSaved(id);
  };

  const rowsUpd = <T,>(k: 'rels' | 'sheets', list: T[]) => set(k, list as never);
  const tabsOn = TAB_LIST.filter(t => !c.tabsOff.includes(t.key));
  const pvEntry = c.sheets[pv] ?? c.sheets[0];

  return (
    <FormShell title={char ? '캐릭터 수정' : '캐릭터 생성'} sub={char?.name} onClose={onClose} onSave={save} dirty={dirty} err={err}>
      <Fs title={<>기본 프로필 <small>메인 목록 카드 · 상세 좌측 상단</small></>}>
        <div className="avo-grid2">
          <F label="이름 *"><KInput value={c.name} maxLength={80} onChange={e => set('name', e.target.value)} /></F>
          <F label="영문명 / 별칭"><KInput value={c.nameSub} onChange={e => set('nameSub', e.target.value)} /></F>
          <F label="소속"><KInput value={c.affiliation} onChange={e => set('affiliation', e.target.value)} /></F>
          <F label="한마디"><KInput value={c.quote} onChange={e => set('quote', e.target.value)} /></F>
        </div>
        <F label="구분 라벨">
          <div className="avo-radios">
            {conf.labels.map(([n, col]) => (
              <KRadio key={n} name="avo-clabel" value={n} current={c.label} onChange={v => set('label', v)}
                label={<><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: col, marginRight: 4 }} />{n}</>} />
            ))}
            {c.label && !conf.labels.some(l => l[0] === c.label) && (
              <KRadio name="avo-clabel" value={c.label} current={c.label} onChange={() => undefined} label={<>{c.label} <small className="avo-dim">(목록에 없음)</small></>} />
            )}
          </div>
        </F>
        <div className="avo-grid2">
          <F label={<>캐릭터 테마 컬러 <small>(탭·영문명·SD 테두리·카드 라벨 등)</small></>}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <ColorField value={c.accent || themeOf(c, conf, siteAccent)} onChange={v => set('accent', cleanColor(v))} />
              {c.accent && <button type="button" className="avo-btn avo-btn-s" onClick={() => set('accent', '')}>비우기</button>}
            </div>
            <span className="avo-site-color"><i style={{ background: conf.accent || siteAccent }} />비우면 홈페이지 기본 컬러</span>
          </F>
          <F label={<>목록 순서 <small>(작을수록 앞)</small></>}>
            <KInput type="number" value={String(c.order)} onChange={e => set('order', Number(e.target.value) || 0)} />
          </F>
        </div>
      </Fs>

      <Fs title={<>이미지 <small>주소(URL)를 넣거나 파일을 올려 주세요 · 파일을 고르면 자르기·크기 편집창이 열려요</small></>}>
        <div className="avo-grid2">
          <ImageField label={<>두상 썸네일 <small>(목록 카드 3:4)</small></>} value={c.thumb} onChange={v => set('thumb', v)} ratio="3:4" max={600} />
          <ImageField label={<>전신 이미지 <small>(상세 가운데)</small></>} value={c.full} onChange={v => set('full', v)} max={2000} help="배경이 투명한 PNG 를 추천해요" />
          <ImageField label="SD" value={c.sd} onChange={v => set('sd', v)} ratio="1:1" max={600} />
          <div>
            <ImageField label="배경 이미지" value={c.bgImg} onChange={v => set('bgImg', v)} ratio="16:9" max={2400} help="배경 이미지·색을 모두 비우면 홈페이지 배경이 보여요" />
            <F label="배경 색">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ColorField value={c.bgColor || '#f4f1ea'} onChange={v => set('bgColor', cleanColor(v))} />
                {c.bgColor && <button type="button" className="avo-btn avo-btn-s" onClick={() => set('bgColor', '')}>비우기</button>}
              </div>
            </F>
          </div>
        </div>
        <ThumbPos label={<>옷장 「기본」 썸네일 <small>(전신 이미지 중 썸네일에 보일 위치·크기)</small></>} src={c.full} value={c.fullPos} onChange={p => set('fullPos', p)} />
      </Fs>

      <Fs title="프로필">
        <div className="avo-grid3">
          <F label="나이"><KInput value={c.age} onChange={e => set('age', e.target.value)} /></F>
          <F label="신장 / 체중"><KInput value={c.size} onChange={e => set('size', e.target.value)} /></F>
          <F label="생일"><KInput value={c.birthday} onChange={e => set('birthday', e.target.value)} /></F>
        </div>
        <F label={<>그 외 항목 <small>한 줄에 하나씩 「항목: 내용」</small></>}>
          <KTextarea rows={4} value={c.extra} onChange={e => set('extra', e.target.value)} placeholder={'MBTI: INFP\n좋아하는 것: 고양이'} />
        </F>
        <F label={<>프로필 <small>(프로필 탭 하단 · 글꼴·색·정렬 등 꾸미기 가능)</small></>}>
          <Rte value={c.intro} onChange={v => set('intro', v)} placeholder="짧은 소개" />
        </F>
      </Fs>

      <Fs title={<>서사 <small>캐릭터 페이지 › 서사 탭</small></>}>
        {c.useStory ? (
          <>
            <div className="avo-opt-bar">
              <p className="avo-help">서사 탭(책 아이콘)이 보여요.</p><span className="avo-sp" />
              <button type="button" className="avo-btn avo-btn-s avo-opt-off" onClick={() => set('useStory', false)}><Icon name="minus" />빼기</button>
            </div>
            <RichEditor value={c.story} onChange={v => set('story', v)} placeholder="서사" />
          </>
        ) : (
          <div className="avo-opt-empty">
            <button type="button" className="avo-btn avo-btn-s avo-btn-add" onClick={() => set('useStory', true)}><Icon name="plus" />서사 추가</button>
            <p className="avo-help">{c.story ? '뺀 서사 글은 지워지지 않고 보관돼요.' : '서사를 쓰지 않으면 서사 탭이 숨겨져요.'}</p>
          </div>
        )}
      </Fs>

      <Fs title={<>TRPG 시트 <small>캐릭터 페이지 › 시트 탭 (주사위 아이콘)</small></>}>
        {c.useSheet ? (
          <>
            <div className="avo-opt-bar">
              <p className="avo-help">시트를 여러 장 (최대 10장) 넣을 수 있어요. 입력은 캐릭터 페이지 › 시트 › 「편집」에서.</p><span className="avo-sp" />
              <button type="button" className="avo-btn avo-btn-s avo-opt-off" onClick={() => set('useSheet', false)}><Icon name="minus" />빼기</button>
            </div>
            <div className="avo-rows">
              {c.sheets.map((s, i) => (
                <div key={s.id} className={`avo-row avo-row-inline avo-sheet-row ${i === pv ? 'is-pv' : ''}`}>
                  <KSelect value={s.sheetId} onChange={v => { rowsUpd('sheets', c.sheets.map((x, j) => (j === i ? { ...x, sheetId: v } : x))); setPv(i); }}
                    options={choices.map(o => ({ value: o.id, label: o.builtin ? o.name : `${o.name} (업로드)` }))} minWidth={200} maxWidth={260} />
                  <KInput value={s.title} maxLength={60} placeholder="칸 이름 (예: 시나리오 A · 비우면 시트 이름)"
                    onChange={e => rowsUpd('sheets', c.sheets.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                  <button type="button" className="avo-btn avo-btn-s" onClick={() => setPv(i)}><Icon name="eye" /></button>
                  <button type="button" className="avo-act avo-act-del" title="빼기" onClick={() => { rowsUpd('sheets', c.sheets.filter((_, j) => j !== i)); setPv(0); }}><Icon name="trash" /></button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {c.sheets.length < 10 && (
                <button type="button" className="avo-btn avo-btn-s avo-btn-add"
                  onClick={() => { set('sheets', [...c.sheets, { id: newId(8), sheetId: choices[0].id, title: '', img: {} } as SheetEntry]); setPv(c.sheets.length); }}>
                  <Icon name="plus" />시트 추가</button>
              )}
              <button type="button" className="avo-btn avo-btn-s" onClick={pickSheet}><Icon name="plus" />커스텀 시트 업로드 (.html)</button>
              {sheetInput}
            </div>
            <div className="avo-check-row">
              <KCheck checked={c.sheetSpoiler} onChange={v => set('sheetSpoiler', v)}
                label={<>스포일러 경고 <small className="avo-dim">— 시트 탭을 열면 흐리게 가리고 YES 를 눌러야 보여요</small></>} />
            </div>
            {pvEntry && <SheetPreview entry={pvEntry} char={c} />}
          </>
        ) : (
          <div className="avo-opt-empty">
            <button type="button" className="avo-btn avo-btn-s avo-btn-add"
              onClick={() => { set('useSheet', true); if (!c.sheets.length) set('sheets', [{ id: newId(8), sheetId: choices[0].id, title: '', img: {} }]); }}>
              <Icon name="plus" />TRPG 시트 추가</button>
            <p className="avo-help">{c.sheets.length ? '뺀 시트 입력값은 지워지지 않고 보관돼요.' : '시트를 쓰지 않으면 시트 탭이 숨겨져요.'}</p>
          </div>
        )}
      </Fs>

      <Fs title={<>캐릭터 페이지 탭 <small>체크한 탭만 캐릭터 페이지에 보여요 · 처음 열리는 탭 = 보이는 탭 중 맨 앞</small></>}>
        <div className="avo-tabchk">
          {TAB_LIST.map(t => {
            const on = !c.tabsOff.includes(t.key);
            const na = (t.key === 'story' && !c.useStory) || (t.key === 'sheet' && !c.useSheet);
            return (
              <label key={t.key} className={`avo-tabchk-item ${na ? 'is-na' : ''}`}>
                <input type="checkbox" checked={on} onChange={e => set('tabsOff', e.target.checked ? c.tabsOff.filter(k => k !== t.key) : [...c.tabsOff, t.key] as TabKey[])} />
                <span className="avo-tabchk-ico"><Icon name={t.icon} /></span>
                <b>{t.label}</b>
                <span className="avo-tabchk-na">(추가 안 함)</span>
              </label>
            );
          })}
        </div>
        {!tabsOn.length && <p className="avo-help">보이는 탭이 없으면 탭 칸이 비어 보여요.</p>}
      </Fs>

      <Fs title={<>관계 캐릭터 <small>등록된 캐릭터를 고르면 클릭 시 그 캐릭터로 이동해요</small></>}>
        <div className="avo-rows">
          {c.rels.map((r, i) => {
            const upd = (p: Partial<Rel>) => rowsUpd('rels', c.rels.map((x, j) => (j === i ? { ...x, ...p } : x)));
            return (
              <div key={i} className="avo-row">
                <div className="avo-row-head">
                  <KSelect value={r.charId} onChange={v => upd({ charId: v })} minWidth={180}
                    options={[{ value: '', label: '— 직접 입력 —' }, ...chars.filter(x => x.id !== c.id).map(x => ({ value: x.id, label: x.name }))]} />
                  <span className="avo-sp" />
                  <button type="button" className="avo-act avo-act-del" title="빼기" onClick={() => rowsUpd('rels', c.rels.filter((_, j) => j !== i))}><Icon name="trash" /></button>
                </div>
                <div className="avo-row-grid">
                  {!r.charId && <F label="이름"><KInput value={r.name} onChange={e => upd({ name: e.target.value })} /></F>}
                  <F label="관계"><KInput value={r.label} placeholder="예: 소꿉친구" onChange={e => upd({ label: e.target.value })} /></F>
                  <ImageField label={<>이미지 <small>(비우면 그 캐릭터 썸네일)</small></>} value={r.img} onChange={v => upd({ img: v })} ratio="1:1" max={300} />
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" className="avo-btn avo-btn-s avo-btn-add" onClick={() => set('rels', [...c.rels, { charId: '', name: '', img: '', label: '' }])}><Icon name="plus" />관계 추가</button>
      </Fs>

      <Fs title="캐릭터 BGM">
        <div className="avo-grid2">
          <F label="곡 제목"><KInput value={c.bgmTitle} placeholder="아티스트 - 곡명" onChange={e => set('bgmTitle', e.target.value)} /></F>
          <F label={<>주소 <small>(YouTube 링크 또는 mp3 주소)</small></>}><KInput value={c.bgm} placeholder="https://" onChange={e => set('bgm', e.target.value.trim())} /></F>
        </div>
      </Fs>
    </FormShell>
  );
}

/** 편집 화면의 시트 미리보기 (빈 값) */
function SheetPreview({ entry, char }: { entry: SheetEntry; char: Char }) {
  const { store, siteAccent } = useAvo();
  const { doc, width, err } = useSheetDoc(entry.sheetId, store.sheetLib);
  const accent = themeOf(char, store.conf, siteAccent);
  const init: SheetInit = useMemo(() => ({
    data: {}, images: {},
    ctx: { name: char.name, nameSub: char.nameSub, accent, label: labelColor(store.conf.labels, char.label), images: { thumb: '', full: '' } },
  }), [char.name, char.nameSub, char.label, accent, store.conf.labels]);
  return (
    <div className="avo-f">
      <span className="avo-lbl">미리보기 <small>{sheetChoices(store.sheetLib).find(s => s.id === entry.sheetId)?.name}</small></span>
      <div className="avo-sheet-preview">
        {err ? <p className="avo-help">{err}</p> : <SheetFrame key={entry.sheetId + doc.length} doc={doc} width={width} mode="view" init={init} layout="fit" />}
      </div>
    </div>
  );
}

/* ===================== 옷장 / AU ===================== */
export function WardrobeForm({ char, kind, item, onClose }: { char: Char; kind: 'wd' | 'au'; item?: Wd; onClose: () => void }) {
  const saveChar = useSaveChar();
  const [w, setW] = useState<Wd>(() => item ? { ...item } : { id: newId(8), kind, name: '', img: '', bg: '' });
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof Wd>(k: K, v: Wd[K]) => { setW(x => ({ ...x, [k]: v })); setDirty(true); };
  const au = kind === 'au';
  const save = () => {
    if (!w.img) { setErr('전신 이미지를 넣어 주세요.'); return; }
    const list = char.wardrobe.some(x => x.id === w.id) ? char.wardrobe.map(x => (x.id === w.id ? w : x)) : [...char.wardrobe, w];
    saveChar(char.id, { wardrobe: list });
    setDirty(false); onClose();
  };
  const tf = (k: keyof Wd, label: React.ReactNode, ph = '') => (
    <F label={label}><KInput value={String(w[k] ?? '')} placeholder={ph} onChange={e => set(k, e.target.value as never)} /></F>
  );
  return (
    <FormShell title={`${au ? 'AU' : '옷장'} ${item ? '수정' : '추가'}`} sub={char.name} onClose={onClose} onSave={save} dirty={dirty} err={err}>
      <Fs title={au ? <>AU <small>선택하면 이미지와 함께 왼쪽 프로필·서사도 바뀌어요</small></> : <>옷장 <small>선택하면 이미지만 바뀌고 프로필은 그대로예요</small></>}>
        {tf('name', '이름', au ? '예: 판타지AU' : '예: 교복, 사복')}
        <div className="avo-grid2">
          <ImageField label="전신 이미지 *" value={w.img} onChange={v => set('img', v)} max={2000} />
          <ImageField label={<>배경 <small>(선택)</small></>} value={w.bg} onChange={v => set('bg', v)} ratio="16:9" max={2400} help="비우면 캐릭터 기본 배경" />
        </div>
        <ThumbPos label={<>썸네일 <small>(오른쪽 옷장·AU 칸에 보일 위치·크기)</small></>} src={w.img} value={w.pos} onChange={p => set('pos', p)} />
      </Fs>
      {au && (
        <Fs title={<>AU 프로필 <small>비워 둔 칸은 기본 프로필 값이 그대로 보여요</small></>}>
          <div className="avo-grid3">{tf('cname', 'AU 이름')}{tf('nameSub', '영문명 / 별칭')}{tf('affiliation', '소속')}</div>
          <div className="avo-grid3">{tf('age', '나이')}{tf('size', '신장 / 체중')}{tf('birthday', '생일')}</div>
          {tf('quote', '한마디')}
          <F label={<>그 외 항목 <small>한 줄에 「항목: 내용」</small></>}><KTextarea rows={3} value={w.extra ?? ''} onChange={e => set('extra', e.target.value)} /></F>
          <F label="프로필"><Rte value={w.intro ?? ''} onChange={v => set('intro', v)} placeholder="비우면 기본 프로필이 보여요" /></F>
          <F label="AU 서사"><RichEditor value={w.story ?? ''} onChange={v => set('story', v)} placeholder="비우면 기본 서사가 보여요" /></F>
        </Fs>
      )}
    </FormShell>
  );
}

/* ===================== 기록 ===================== */
export function RecordForm({ char, item, onClose }: { char: Char; item?: Rec; onClose: () => void }) {
  const { store } = useAvo();
  const saveChar = useSaveChar();
  const labels = store.conf.recLabels;
  const [r, setR] = useState<Rec>(() => item ? { ...item } : { id: newId(12), label: labels[0]?.[0] ?? '기타', title: '', date: '', end: '', link: '', thumb: '' });
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof Rec>(k: K, v: Rec[K]) => { setR(x => ({ ...x, [k]: v })); setDirty(true); };
  const save = () => {
    if (!r.title.trim()) { setErr('이름은 필수 입력이에요.'); return; }
    if (r.link && !cleanUrl(r.link)) { setErr('링크는 http(s):// 로 시작하는 주소만 넣을 수 있어요.'); return; }
    const it = { ...r, title: r.title.trim(), link: cleanUrl(r.link) };
    const list = char.records.some(x => x.id === it.id) ? char.records.map(x => (x.id === it.id ? it : x)) : [...char.records, it];
    saveChar(char.id, { records: list.slice(-300) });
    setDirty(false); onClose();
  };
  return (
    <FormShell small title={`기록 ${item ? '수정' : '작성'}`} sub={char.name} onClose={onClose} onSave={save} dirty={dirty} err={err}>
      <Fs title={<>기록 <small>시작 날짜순으로 자동 정렬돼요</small></>}>
        <F label="라벨">
          <div className="avo-radios">
            {labels.map(([n, col]) => (
              <KRadio key={n} name="avo-rlabel" value={n} current={r.label} onChange={v => set('label', v)}
                label={<><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: col, marginRight: 4 }} />{n}</>} />
            ))}
            {r.label && !labels.some(l => l[0] === r.label) && <KRadio name="avo-rlabel" value={r.label} current={r.label} onChange={() => undefined} label={<>{r.label} <small className="avo-dim">(목록에 없음)</small></>} />}
          </div>
        </F>
        <F label="이름 *"><KInput value={r.title} maxLength={200} placeholder="예: ○○ 커뮤니티" onChange={e => set('title', e.target.value)} /></F>
        <div className="avo-grid2">
          <F label="시작 날짜"><KDate value={r.date} onChange={v => set('date', v)} /></F>
          <F label={<>끝 날짜 <small>(선택)</small></>}><KDate value={r.end} onChange={v => set('end', v)} /></F>
        </div>
        <F label={<>링크 <small>(있으면 클릭 시 캐릭터 페이지 가운데에 열림 · 없으면 클릭 안 됨)</small></>}>
          <KInput value={r.link} placeholder="https://" onChange={e => set('link', e.target.value.trim())} />
        </F>
        <ImageField label="썸네일" value={r.thumb} onChange={v => set('thumb', v)} ratio="1:1" max={400} />
      </Fs>
    </FormShell>
  );
}

/* ===================== 커미션 자료 ===================== */
export function RefForm({ char, onClose }: { char: Char; onClose: () => void }) {
  const saveChar = useSaveChar();
  const [d, setD] = useState(() => ({
    comFull: char.comFull, comHead: char.comHead, comColors: char.comColors.map(x => ({ ...x })),
    comEye: char.comEye, comImpression: char.comImpression, comHair: char.comHair, comEtc: char.comEtc, comExtra: char.comExtra,
    comImages: char.comImages.map(x => ({ ...x })),
  }));
  const [dirty, setDirty] = useState(false);
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => { setD(x => ({ ...x, [k]: v })); setDirty(true); };
  const save = () => {
    saveChar(char.id, { ...d, comColors: d.comColors.filter(x => cleanColor(x.hex)), comImages: d.comImages.filter(x => x.img) });
    setDirty(false); onClose();
  };
  const ta = (k: 'comEye' | 'comImpression' | 'comHair' | 'comEtc' | 'comExtra', label: React.ReactNode, rows = 3, ph = '') => (
    <F label={label}><KTextarea rows={rows} value={d[k]} placeholder={ph} onChange={e => set(k, e.target.value)} /></F>
  );
  return (
    <FormShell title="커미션 자료 편집" sub={char.name} onClose={onClose} onSave={save} dirty={dirty}>
      <Fs title={<>커미션 자료 <small>캐릭터 페이지 › 자료 · JPG 로 저장할 수 있어요</small></>}>
        <div className="avo-grid2">
          <ImageField label={<>전신 <small>(비우면 캐릭터 전신 이미지)</small></>} value={d.comFull} onChange={v => set('comFull', v)} max={2000} />
          <ImageField label={<>두상 <small>(비우면 두상 썸네일)</small></>} value={d.comHead} onChange={v => set('comHead', v)} ratio="1:1" max={600} />
        </div>
        <F label="테마색">
          <div className="avo-rows">
            {d.comColors.map((col, i) => (
              <div key={i} className="avo-row avo-row-inline">
                <ColorField value={col.hex || '#888888'} onChange={v => set('comColors', d.comColors.map((x, j) => (j === i ? { ...x, hex: cleanColor(v) } : x)) as ComColor[])} />
                <KInput value={col.name} placeholder="이름 (예: 머리색)" onChange={e => set('comColors', d.comColors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <button type="button" className="avo-act avo-act-del" onClick={() => set('comColors', d.comColors.filter((_, j) => j !== i))}><Icon name="trash" /></button>
              </div>
            ))}
          </div>
          {d.comColors.length < 24 && <button type="button" className="avo-btn avo-btn-s avo-btn-add" onClick={() => set('comColors', [...d.comColors, { hex: '#888888', name: '' }])}><Icon name="plus" />색 추가</button>}
        </F>
        <div className="avo-grid3">
          {ta('comEye', '특징 - 눈매')}{ta('comImpression', '인상')}{ta('comHair', '헤어스타일')}
        </div>
        {ta('comEtc', '기타 특징', 2, '흉터, 점, 액세서리 등')}
        {ta('comExtra', <>추가 자료 메모 <small>(커미션마다 필요한 내용)</small></>)}
        <F label="추가 자료 이미지">
          <div className="avo-rows">
            {d.comImages.map((im, i) => (
              <div key={i} className="avo-row">
                <div className="avo-row-head"><span className="avo-sp" />
                  <button type="button" className="avo-act avo-act-del" onClick={() => set('comImages', d.comImages.filter((_, j) => j !== i))}><Icon name="trash" /></button></div>
                <div className="avo-row-grid">
                  <ImageField label="이미지" value={im.img} onChange={v => set('comImages', d.comImages.map((x, j) => (j === i ? { ...x, img: v } : x)) as ComImg[])} max={2000} />
                  <F label="설명"><KInput value={im.cap} onChange={e => set('comImages', d.comImages.map((x, j) => (j === i ? { ...x, cap: e.target.value } : x)))} /></F>
                </div>
              </div>
            ))}
          </div>
          {d.comImages.length < 40 && <button type="button" className="avo-btn avo-btn-s avo-btn-add" onClick={() => set('comImages', [...d.comImages, { img: '', cap: '' }])}><Icon name="plus" />이미지 추가</button>}
        </F>
      </Fs>
    </FormShell>
  );
}

/* ===================== TRPG 시트 입력 ===================== */
export function SheetEditor({ char, entry, init, onClose }: { char: Char; entry: SheetEntry; init: SheetInit; onClose: () => void }) {
  const { store } = useAvo();
  const toast = useToast();
  const crop = useCrop();
  const saveChar = useSaveChar();
  const { doc, width, err } = useSheetDoc(entry.sheetId, store.sheetLib);
  const frame = useRef<SheetHandle>(null);
  const data = useRef<Record<string, unknown>>(init.data);
  const imgs = useRef<Record<string, string>>({ ...entry.img });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const first = useRef(true);

  const onImageFile = async (m: { key: string; dataUrl: string; mime: string; ratio: string; max: number }) => {
    if (!/^data:image\/(png|jpe?g|gif|webp)/i.test(m.dataUrl)) { toast('이미지 파일만 넣을 수 있어요'); return; }
    let blob: Blob | null;
    if (/gif/i.test(m.mime)) blob = await (await fetch(m.dataUrl)).blob();
    else blob = await crop({ src: m.dataUrl, name: 'sheet', type: m.mime, ratio: m.ratio, max: m.max });
    if (!blob) return;
    try {
      const ref = await putBlob(blob);
      imgs.current = { ...imgs.current, [m.key]: ref };
      frame.current?.sendImage(m.key, await refToPortableUrl(ref));
      setDirty(true);
    } catch { toast('이미지를 올리지 못했어요'); }
  };

  const save = async () => {
    setSaving(true);
    const fin = await frame.current?.requestData();
    const d = fin && Object.keys(fin).length ? fin : data.current;
    store.saveSheetData(char.id, entry.id, d);
    const cur = store.chars.find(c => c.id === char.id) ?? char;
    saveChar(char.id, { sheets: cur.sheets.map(s => (s.id === entry.id ? { ...s, img: imgs.current } : s)) });
    setSaving(false); setDirty(false); onClose();
  };

  return (
    <AvoModal open onClose={onClose} dirty={dirty} accent={init.ctx.accent} boxClass="avo-form-box avo-sheet-edit-box">
      <div className="avo-form-scroll">
        <h2 className="avo-w-title">{entry.title || sheetChoices(store.sheetLib).find(s => s.id === entry.sheetId)?.name || '시트'} <small>{char.name}</small></h2>
        <p className="avo-sheet-msg">칸을 눌러 입력 · 이미지는 시트 안의 「이미지 변경」 · 「범위」로 보일 곳을 정해요.</p>
        {err ? <p className="avo-err">{err}</p> : doc ? (
          <SheetFrame ref={frame} doc={doc} width={width} mode="edit" init={init} layout="edit"
            onData={d => { data.current = d; if (first.current) first.current = false; else setDirty(true); }}
            onImageFile={m => { void onImageFile(m); }}
            onImageClear={k => { const n = { ...imgs.current }; delete n[k]; imgs.current = n; setDirty(true); }} />
        ) : <p className="avo-help">불러오는 중…</p>}
      </div>
      <div className="avo-w-btns">
        <button type="button" className="avo-btn" onClick={onClose}>취소</button>
        <button type="button" className="avo-btn avo-btn-pri" onClick={() => { void save(); }} disabled={saving || !doc}>{saving ? '저장 중…' : '저장'}</button>
      </div>
    </AvoModal>
  );
}

/** 옷장 · AU · 기록 삭제 확인 */
export function useDeleteItem(char: Char) {
  const { store } = useAvo();
  const saveChar = useSaveChar();
  const [ask, node] = useAvoConfirm();
  // 확인을 누르는 시점의 최신 값에서 거른다 (그 사이 다른 항목이 바뀌었을 수 있음)
  const latest = () => store.chars.find(c => c.id === char.id) ?? char;
  const delWd = (w: Wd) => ask(`이 ${w.kind === 'au' ? 'AU' : '옷장'}(${w.name || '이름 없음'})를 삭제할까요?\n삭제한 항목은 되돌릴 수 없어요.`,
    () => saveChar(char.id, { wardrobe: latest().wardrobe.filter(x => x.id !== w.id) }), { danger: true, okLabel: '삭제' });
  const delRec = (r: Rec) => ask(`이 기록(${r.title})을 삭제할까요?\n삭제한 항목은 되돌릴 수 없어요.`,
    () => saveChar(char.id, { records: latest().records.filter(x => x.id !== r.id) }), { danger: true, okLabel: '삭제' });
  return { delWd, delRec, node };
}
