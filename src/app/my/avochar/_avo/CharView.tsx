'use client';
// 캐릭터 페이지 — 원본 _view_char.php + avo.js(initChar)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HtmlBody } from '@/components/ui/HtmlBody';
import { useToast } from '@/components/ui/Toast';
import { useAvo, themeOf } from './ctx';
import { AvoModal, Icon, Img, Nl, cleanProfileHtml, posStyle, refToPortableUrl, useAvoConfirm, useImg, useScrollLock } from './ui';
import { extraRows, fmtDate, fmtShort, initial, labelColor, recordDates, sortRecords, visibleTabs, youtubeId, type Char, type Rec, type SheetEntry, type TabKey, type Wd } from './lib';
import { SheetFrame, sheetChoices, useSheetDoc, type SheetInit } from './Sheet';
import { CharForm, RecordForm, RefForm, SheetEditor, WardrobeForm, useDeleteItem } from './CharForms';
import { LabelManager } from './Settings';

/** 왼쪽에 보일 프로필 한 벌 (기본 / AU) */
interface Variant {
  key: string; au: string; cname: string; nameSub: string; affiliation: string; quote: string;
  age: string; size: string; birthday: string; extra: string; intro: string; story: string;
}

export function CharView({ id }: { id: string }) {
  const { store, isAdmin, siteAccent, go, user } = useAvo();
  const char = store.chars.find(c => c.id === id);
  if (!store.loaded) return <p className="avo-empty">불러오는 중…</p>;
  if (!char) {
    return (
      <div className="avo-wrap"><p className="avo-empty">캐릭터를 찾을 수 없어요. (삭제되었거나 볼 수 있는 권한이 없어요)</p>
        <p style={{ textAlign: 'center' }}><button type="button" className="avo-btn" onClick={() => go({})}>목록으로</button></p></div>
    );
  }
  return <CharPage key={char.id} char={char} isAdmin={isAdmin} siteAccent={siteAccent} userId={user?.id} />;
}

function CharPage({ char, isAdmin, siteAccent, userId }: { char: Char; isAdmin: boolean; siteAccent: string; userId?: string }) {
  const { store, go } = useAvo();
  const toast = useToast();
  const { conf, chars, posts } = store;
  const accent = themeOf(char, conf, siteAccent);
  const labelName = char.label || conf.labels[0]?.[0] || 'OC';
  const lbColor = labelColor(conf.labels, labelName);
  const full = conf.viewMode === 'full';
  useScrollLock(full);
  const canEdit = isAdmin;

  /* 탭 */
  const tabs = visibleTabs(char);
  const [tab, setTab] = useState<TabKey | ''>(() => tabs.find(t => t !== 'ref') ?? '');
  const panel = useRef<HTMLDivElement>(null);

  /* 프로필 세트 (기본 + AU) */
  const vars = useMemo(() => {
    const v0: Variant = {
      key: 'v0', au: '', cname: char.name, nameSub: char.nameSub, affiliation: char.affiliation, quote: char.quote,
      age: char.age, size: char.size, birthday: char.birthday, extra: char.extra, intro: char.intro, story: char.story,
    };
    const m = new Map<string, Variant>([['v0', v0]]);
    for (const w of char.wardrobe) {
      if (w.kind !== 'au') continue;
      const pick = (a: string | undefined, b: string) => (a && a.trim() ? a : b);
      m.set(w.id, {
        key: w.id, au: w.name || 'AU', cname: pick(w.cname, v0.cname), nameSub: pick(w.nameSub, v0.nameSub),
        affiliation: pick(w.affiliation, v0.affiliation), quote: pick(w.quote, v0.quote), age: pick(w.age, v0.age),
        size: pick(w.size, v0.size), birthday: pick(w.birthday, v0.birthday), extra: pick(w.extra, v0.extra),
        intro: pick(w.intro, v0.intro), story: pick(w.story, v0.story),
      });
    }
    return m;
  }, [char]);
  const [sel, setSel] = useState<{ v: string; img: string; bg: string; wd: string }>({ v: 'v0', img: char.full, bg: '', wd: 'base' });
  const v = vars.get(sel.v) ?? vars.get('v0')!;
  const wdItems = char.wardrobe.filter(w => w.kind === 'wd');
  const auItems = char.wardrobe.filter(w => w.kind === 'au');
  // 저장 후(옷장 수정 등) 고른 항목이 바뀌었으면 맞춘다
  useEffect(() => {
    if (sel.wd === 'base') { if (sel.img !== char.full) setSel(s => ({ ...s, img: char.full })); return; }
    const w = char.wardrobe.find(x => x.id === sel.wd);
    if (!w) setSel({ v: 'v0', img: char.full, bg: '', wd: 'base' });
    else if (w.img !== sel.img || w.bg !== sel.bg) setSel({ v: w.kind === 'au' ? w.id : 'v0', img: w.img, bg: w.bg, wd: w.id });
  }, [char, sel]);
  const pickWd = (w: Wd | null) => {
    if (!w) setSel({ v: 'v0', img: char.full, bg: '', wd: 'base' });
    else setSel({ v: w.kind === 'au' ? w.id : 'v0', img: w.img, bg: w.bg, wd: w.id });
  };

  /* 배경 */
  const bgRef = sel.bg || char.bgImg;
  const bgUrl = useImg(bgRef);
  const rootStyle: React.CSSProperties = {
    '--avo-accent': accent, '--lb': lbColor,
    ...(char.bgColor ? { backgroundColor: char.bgColor } : {}),
    ...(bgUrl ? { backgroundImage: `url("${bgUrl.replace(/"/g, '%22')}")` } : {}),
  } as React.CSSProperties;

  /* 가운데 : 인물 / 시트 크게 보기 / 기록 링크 */
  const stageUrl = useImg(sel.img);
  const [stageShown, setStageShown] = useState(stageUrl);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (stageUrl === stageShown) return;
    if (!stageUrl) { setStageShown(undefined); return; }
    setFade(true);
    const im = new Image();
    im.onload = im.onerror = () => { setStageShown(stageUrl); setFade(false); };
    im.src = stageUrl;
  }, [stageUrl, stageShown]);
  const [frame, setFrame] = useState<{ kind: 'link'; url: string; title: string; rec: string } | { kind: 'sheet' } | null>(null);

  /* 로그 */
  const logs = posts.filter(p => p.charId === char.id).slice(0, 100);
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const logPost = logOpen ? posts.find(p => p.id === logOpen) : undefined;

  /* 기록 */
  const records = sortRecords(char.records, conf.recSort);

  /* 시트 */
  const sheetList = char.useSheet ? char.sheets.filter(s => sheetChoices(store.sheetLib).some(o => o.id === s.sheetId)) : [];
  const [sheetPick, setSheetPick] = useState(sheetList[0]?.id ?? '');
  const sheet = sheetList.find(s => s.id === sheetPick) ?? sheetList[0];
  const [unlocked, setUnlocked] = useState(!char.sheetSpoiler);
  const sheetLabel = (e: SheetEntry) => e.title || sheetChoices(store.sheetLib).find(o => o.id === e.sheetId)?.name || '시트';

  /* 편집창들 */
  const [editChar, setEditChar] = useState(false);
  const [wdForm, setWdForm] = useState<{ kind: 'wd' | 'au'; item?: Wd } | null>(null);
  const [recForm, setRecForm] = useState<{ item?: Rec } | null>(null);
  const [refOpen, setRefOpen] = useState(false);
  const [refEdit, setRefEdit] = useState(false);
  const [sheetEdit, setSheetEdit] = useState<{ entry: SheetEntry; init: SheetInit } | null>(null);
  const [recLbm, setRecLbm] = useState(false);
  const { delWd, delRec, node: delNode } = useDeleteItem(char);
  const [ask, askNode] = useAvoConfirm();

  /* BGM */
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const bgmSrc = useImg(char.bgm);
  const yt = youtubeId(char.bgm);
  useEffect(() => () => { audio.current?.pause(); }, []);
  const toggleBgm = () => {
    const on = !playing;
    setPlaying(on);
    if (yt) return;
    if (!bgmSrc) return;
    if (!audio.current) { audio.current = new Audio(bgmSrc); audio.current.loop = true; }
    if (on) void audio.current.play().catch(() => { setPlaying(false); toast('재생하지 못했어요'); });
    else audio.current.pause();
  };

  const tabBtn = (k: TabKey, icon: string, label: string, badge?: number) => tabs.includes(k) && (
    <button type="button" className={`avo-tab ${tab === k ? 'is-on' : ''}`} aria-label={label}
      onClick={() => {
        if (k === 'ref') { setRefOpen(true); return; }
        setTab(k);
        if (k === 'log') setLogOpen(null);
        if (panel.current) panel.current.scrollTop = 0;
      }}>
      <Icon name={icon} /><span className="avo-tab-label">{label}</span>
      {!!badge && <i className="avo-tab-badge">{badge}</i>}
    </button>
  );

  return (
    <>
      <div className={`avo-wrap avo-cv is-${full ? 'full' : 'fit'} ${tabs.length ? '' : 'no-tabs'}`} style={rootStyle}>
        <div className="avo-cv-inner">
          {/* ========== 왼쪽 ========== */}
          <section className="avo-cv-left">
            <div className="avo-cv-top">
              <a href="#" className="avo-cv-back" onClick={e => { e.preventDefault(); go({}); }}><Icon name="back" />목록</a>
            </div>
            <div className="avo-cv-basic">
              <div className="avo-var" key={v.key}>
                <span className="avo-ribbon avo-ribbon-inline">{labelName}</span>
                {v.au && <span className="avo-au-tag">AU · {v.au}</span>}
                {v.affiliation && <p className="avo-cv-aff">{v.affiliation}</p>}
                <h1 className="avo-cv-name">{v.cname}</h1>
                {v.nameSub && <p className="avo-cv-sub">{v.nameSub}</p>}
                {v.quote && <p className="avo-cv-quote">“{v.quote}”</p>}
              </div>
            </div>

            <div className="avo-cv-panel" ref={panel}>
              {/* 프로필 */}
              {tab === 'profile' && (
                <div className="avo-pane is-on">
                  <div className="avo-var" key={v.key}>
                    <dl className="avo-prof">
                      {v.affiliation && <><dt>소속</dt><dd>{v.affiliation}</dd></>}
                      <dt>이름</dt><dd>{v.cname}{v.nameSub && <> <small>{v.nameSub}</small></>}</dd>
                      {v.age && <><dt>나이</dt><dd>{v.age}</dd></>}
                      {v.size && <><dt>신장/체중</dt><dd>{v.size}</dd></>}
                      {v.birthday && <><dt>생일</dt><dd>{v.birthday}</dd></>}
                      {extraRows(v.extra).map(([k, val], i) => k
                        ? <React.Fragment key={i}><dt>{k}</dt><dd>{val}</dd></React.Fragment>
                        : <dd key={i} className="avo-prof-full">{val}</dd>)}
                    </dl>
                    {v.intro && <HtmlBody className="avo-prof-intro" html={cleanProfileHtml(v.intro)} />}
                  </div>
                </div>
              )}

              {/* 서사 */}
              {tab === 'story' && (
                <div className="avo-pane is-on">
                  <div className="avo-var" key={v.key}>
                    {v.story.replace(/<[^>]*>/g, '').trim() || /<img/i.test(v.story)
                      ? <HtmlBody className="avo-story" html={v.story} />
                      : <p className="avo-empty">작성된 서사가 없어요.</p>}
                  </div>
                </div>
              )}

              {/* 시트 */}
              {tab === 'sheet' && (
                <div className="avo-pane avo-pane-sheet is-on">
                  <div className="avo-sheet-tools">
                    <span className="avo-sheet-name"><Icon name="dice" /><span>{sheet ? sheetLabel(sheet) : 'TRPG 시트'}</span></span>
                    {sheet && <button type="button" className="avo-btn avo-btn-s" disabled={!unlocked} onClick={() => setFrame({ kind: 'sheet' })}><Icon name="external" />크게 보기</button>}
                    {canEdit && sheet && <SheetEditBtn char={char} entry={sheet} accent={accent} lbColor={lbColor} onOpen={(entry, init) => setSheetEdit({ entry, init })} />}
                  </div>
                  {sheetList.length > 1 && (
                    <div className="avo-sheet-chips" role="tablist">
                      {sheetList.map(s => <button key={s.id} type="button" className={`avo-sheet-chip ${s.id === sheet?.id ? 'is-on' : ''}`} onClick={() => setSheetPick(s.id)}>{sheetLabel(s)}</button>)}
                    </div>
                  )}
                  {sheet ? (
                    <div className={`avo-sheet-card ${unlocked ? '' : 'is-locked'}`}>
                      <SheetView char={char} entry={sheet} accent={accent} lbColor={lbColor} layout="fit" />
                      {!unlocked && (
                        <div className="avo-spoiler" role="dialog" aria-modal="false">
                          <div className="avo-spoiler-card">
                            <span className="avo-spoiler-ico"><Icon name="alert" /></span>
                            <strong className="avo-spoiler-t">SPOILER</strong>
                            <p className="avo-spoiler-msg">이 시트에는 특정 시나리오의 스포일러가 포함될 수 있습니다.</p>
                            <button type="button" className="avo-spoiler-yes" onClick={() => setUnlocked(true)}>YES</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : <p className="avo-empty">선택된 시트가 없어요.{canEdit && <><br />캐릭터 수정에서 시트를 골라 주세요.</>}</p>}
                </div>
              )}

              {/* 로그 */}
              {tab === 'log' && (
                <div className="avo-pane is-on">
                  {!logPost ? (
                    <div className="avo-log-list">
                      {logs.length ? (
                        <>
                          <ul className="avo-log">
                            {logs.map(p => {
                              const ok = !p.secret || isAdmin || p.authorId === userId;
                              return (
                                <li key={p.id}><a href="#" onClick={e => { e.preventDefault(); setLogOpen(p.id); if (panel.current) panel.current.scrollTop = 0; }}>
                                  <span className="avo-log-t">{p.secret && '🔒 '}{ok ? p.title : '비밀글입니다'}{(() => { const n = store.cmts.filter(c => c.postId === p.id).length; return n ? <em className="avo-cmt">{n}</em> : null; })()}</span>
                                  <span className="avo-log-d">{fmtShort(p.date)}</span>
                                </a></li>
                              );
                            })}
                          </ul>
                          <a className="avo-log-more" href="#" onClick={e => { e.preventDefault(); go({ cf: char.id }); }}>메인 게시판에서 모아보기 →</a>
                        </>
                      ) : <p className="avo-empty">이 캐릭터로 지정된 글이 아직 없어요.</p>}
                    </div>
                  ) : (
                    <div className="avo-log-view">
                      <div className="avo-log-body">
                        <div className="avo-log-art">
                          <h1 className="avo-pv-title">{logPost.secret && '🔒 '}{logPost.title}</h1>
                          <p className="avo-pv-meta"><span>{logPost.author}</span><span>{fmtDate(logPost.date, true)}</span></p>
                          <HtmlBody className="avo-pv-content" html={logPost.body} />
                        </div>
                      </div>
                      <div className="avo-log-bar">
                        <button type="button" className="avo-btn avo-btn-s" onClick={() => setLogOpen(null)}><Icon name="list" />목록</button>
                        <span className="avo-sp" />
                        <button type="button" className="avo-btn avo-btn-s avo-btn-pri" onClick={() => go({ p: logPost.id })}>페이지 이동 →</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 기록 */}
              {tab === 'record' && (
                <div className="avo-pane is-on">
                  {canEdit && (
                    <div className="avo-rec-tools">
                      <button type="button" className="avo-btn avo-btn-s" onClick={() => setRecLbm(true)}><Icon name="tag" />라벨 관리</button>
                      <button type="button" className="avo-btn avo-btn-s" onClick={() => setRecForm({})}><Icon name="plus" />작성</button>
                    </div>
                  )}
                  {records.length ? (
                    <ul className="avo-recs">
                      {records.map(r => {
                        const meta = recordDates(r);
                        const open = frame?.kind === 'link' && frame.rec === r.id;
                        const act = () => {
                          if (!r.link) return;
                          if (open) setFrame(null); else setFrame({ kind: 'link', url: r.link, title: r.title, rec: r.id });
                        };
                        return (
                          <li key={r.id} className={`avo-rec ${r.link ? 'has-link' : ''} ${open ? 'is-open' : ''}`}
                            style={{ '--rl': conf.recLabels.find(l => l[0] === r.label)?.[1] ?? '#9a9a9a' } as React.CSSProperties}
                            {...(r.link ? { tabIndex: 0, role: 'button', onClick: act, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } } } : {})}>
                            <span className="avo-rec-thumb">{r.thumb ? <Img src={r.thumb} /> : initial(r.title)}</span>
                            <span className="avo-rec-body">
                              <b className="avo-rec-label">{r.label}</b>
                              <strong>{r.title}</strong>
                              {meta && <small>{meta}</small>}
                            </span>
                            {canEdit ? (
                              <span className="avo-item-acts" onClick={e => e.stopPropagation()}>
                                <a href="#" className="avo-act" title="수정" aria-label="수정" onClick={e => { e.preventDefault(); setRecForm({ item: r }); }}><Icon name="edit" /></a>
                                <a href="#" className="avo-act avo-act-del" title="삭제" aria-label="삭제" onClick={e => { e.preventDefault(); delRec(r); }}><Icon name="trash" /></a>
                              </span>
                            ) : r.link ? <span className="avo-rec-go"><Icon name="external" /></span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : <p className="avo-empty">아직 기록이 없어요.</p>}
                </div>
              )}
            </div>

            {char.rels.length > 0 && (
              <div className="avo-cv-rels">
                <h3 className="avo-mini-title">관계</h3>
                <ul>
                  {char.rels.map((r, i) => {
                    const rc = r.charId ? chars.find(x => x.id === r.charId) : undefined;
                    const name = rc ? rc.name : r.name;
                    const img = r.img || (rc ? rc.thumb || rc.full : '');
                    const style = rc ? ({ '--lb': labelColor(conf.labels, rc.label || conf.labels[0]?.[0] || '') } as React.CSSProperties) : undefined;
                    const inner = (
                      <>
                        <span className="avo-rel-img">{img ? <Img src={img} /> : initial(name)}</span>
                        <span className="avo-rel-name">{name}</span>
                        {r.label && <span className="avo-rel-label">{r.label}</span>}
                      </>
                    );
                    return (
                      <li key={i}>
                        {rc ? <a href="#" className="avo-rel" style={style} title={`${name}${r.label ? ` - ${r.label}` : ''}`} onClick={e => { e.preventDefault(); go({ c: rc.id }); }}>{inner}</a>
                          : <span className="avo-rel" title={`${name}${r.label ? ` - ${r.label}` : ''}`}>{inner}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          {/* ========== 픽토그램 탭 ========== */}
          <nav className="avo-cv-tabs" aria-label="캐릭터 정보">
            {tabBtn('profile', 'profile', '프로필')}
            {tabBtn('story', 'story', '서사')}
            {tabBtn('sheet', 'dice', '시트')}
            {tabBtn('log', 'log', '로그', logs.length)}
            {tabBtn('record', 'record', '기록')}
            {tabBtn('ref', 'sheet', '자료')}
          </nav>

          {/* ========== 가운데 : 인물 ========== */}
          <section className={`avo-cv-stage ${frame ? 'is-frame' : ''}`}>
            {canEdit && (
              <div className="avo-stage-tools">
                <a href="#" className="avo-icobtn" title="캐릭터 수정" onClick={e => { e.preventDefault(); setEditChar(true); }}><Icon name="edit" /><span>캐릭터 수정</span></a>
                <a href="#" className="avo-icobtn" title="삭제" onClick={e => {
                  e.preventDefault();
                  ask('캐릭터를 삭제할까요?\n(이 캐릭터로 지정된 글은 남아 있어요)', () => { store.deleteChar(char.id); go({}); }, { danger: true, okLabel: '삭제' });
                }}><Icon name="trash" /><span>삭제</span></a>
              </div>
            )}
            {stageShown
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className={`avo-stage-img ${fade ? 'is-fade' : ''}`} src={stageShown} alt={char.name} decoding="async" />
              : <div className="avo-stage-ph">전신 이미지를 등록해 주세요</div>}
            {frame?.kind === 'sheet' && sheet && (
              <div className="avo-stage-frame avo-stage-sheet">
                <div className="avo-sf-bar"><strong className="avo-sf-title">{sheetLabel(sheet)}</strong>
                  <button type="button" className="avo-btn avo-btn-s" onClick={() => setFrame(null)}><Icon name="close" />닫기</button></div>
                <div className="avo-sheet-scroll"><SheetView char={char} entry={sheet} accent={accent} lbColor={lbColor} layout="grow" /></div>
              </div>
            )}
            {frame?.kind === 'link' && (
              <div className="avo-stage-frame avo-stage-link">
                <div className="avo-sf-bar">
                  <strong className="avo-sf-title">{frame.title}</strong>
                  <a href={frame.url} target="_blank" rel="noopener noreferrer" className="avo-btn avo-btn-s"><Icon name="external" />새 창</a>
                  <button type="button" className="avo-btn avo-btn-s" onClick={() => setFrame(null)}><Icon name="close" />닫기</button>
                </div>
                <iframe title="기록" src={frame.url} referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms" />
                <p className="avo-sf-tip">화면이 비어 있으면 그 사이트가 다른 페이지 안에서 열리는 것을 막아 둔 경우예요. 「새 창」을 눌러 주세요.</p>
              </div>
            )}
          </section>

          {/* ========== 오른쪽 : SD / 옷장 / AU / BGM ========== */}
          <aside className="avo-cv-right">
            {char.sd && <div className="avo-sd"><Img src={char.sd} alt="SD" /></div>}
            <div className="avo-wd-group">
              <h3 className="avo-mini-title">옷장{canEdit && <a href="#" className="avo-mini-edit" title="옷장 추가" onClick={e => { e.preventDefault(); setWdForm({ kind: 'wd' }); }}><Icon name="plus" />추가</a>}</h3>
              <div className="avo-wd">
                {char.full && (
                  <div className="avo-wd-cell">
                    <button type="button" className={`avo-wd-item ${sel.wd === 'base' ? 'is-on' : ''}`} title="기본" onClick={() => pickWd(null)} style={posStyle(char.fullPos)}>
                      <Img src={char.full} /><span>기본</span>
                    </button>
                  </div>
                )}
                {wdItems.map(w => <WdCell key={w.id} w={w} on={sel.wd === w.id} canEdit={canEdit} onPick={() => pickWd(w)} onEdit={() => setWdForm({ kind: 'wd', item: w })} onDel={() => delWd(w)} />)}
              </div>
            </div>
            {(auItems.length > 0 || canEdit) && (
              <div className="avo-wd-group">
                <h3 className="avo-mini-title">AU{canEdit && <a href="#" className="avo-mini-edit" title="AU 추가" onClick={e => { e.preventDefault(); setWdForm({ kind: 'au' }); }}><Icon name="plus" />추가</a>}</h3>
                <div className="avo-wd">
                  {auItems.map(w => <WdCell key={w.id} w={w} on={sel.wd === w.id} canEdit={canEdit} onPick={() => pickWd(w)} onEdit={() => setWdForm({ kind: 'au', item: w })} onDel={() => delWd(w)} />)}
                </div>
                {!auItems.length && <p className="avo-wd-empty">등록된 AU 가 없어요</p>}
              </div>
            )}
            {char.bgm && (
              <div className={`avo-bgm ${playing ? 'is-playing' : ''}`}>
                <button type="button" className="avo-bgm-btn" aria-label="BGM 재생" onClick={toggleBgm}><span className="avo-bgm-ico">{playing ? '❚❚' : '▶'}</span></button>
                <div className="avo-bgm-txt"><small>BGM</small><span>{char.bgmTitle || '캐릭터 BGM'}</span></div>
                <div className="avo-bgm-holder">
                  {yt && playing && <iframe src={`https://www.youtube.com/embed/${yt}?autoplay=1&loop=1&playlist=${yt}`} allow="autoplay" title="BGM" />}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ========== 커미션 자료 ========== */}
      {refOpen && <RefSheet char={char} accent={accent} canEdit={canEdit} onEdit={() => setRefEdit(true)} onClose={() => setRefOpen(false)} />}

      {editChar && <CharForm char={char} onClose={() => setEditChar(false)} onSaved={() => setEditChar(false)} />}
      {wdForm && <WardrobeForm char={char} kind={wdForm.kind} item={wdForm.item} onClose={() => setWdForm(null)} />}
      {recForm && <RecordForm char={char} item={recForm.item} onClose={() => setRecForm(null)} />}
      {refEdit && <RefForm char={char} onClose={() => setRefEdit(false)} />}
      {sheetEdit && <SheetEditor char={char} entry={sheetEdit.entry} init={sheetEdit.init} onClose={() => setSheetEdit(null)} />}
      {recLbm && <LabelManager kind="rec" onClose={() => setRecLbm(false)} />}
      {delNode}{askNode}
    </>
  );
}

function WdCell({ w, on, canEdit, onPick, onEdit, onDel }: { w: Wd; on: boolean; canEdit: boolean; onPick: () => void; onEdit: () => void; onDel: () => void }) {
  return (
    <div className="avo-wd-cell">
      <button type="button" className={`avo-wd-item ${w.kind === 'au' ? 'is-au' : ''} ${on ? 'is-on' : ''}`} title={w.name || (w.kind === 'au' ? 'AU' : '옷장')} onClick={onPick} style={posStyle(w.pos)}>
        <Img src={w.img} /><span>{w.name || (w.kind === 'au' ? 'AU' : '옷장')}</span>
      </button>
      {canEdit && (
        <span className="avo-item-acts avo-wd-acts">
          <a href="#" className="avo-act" title="수정" aria-label="수정" onClick={e => { e.preventDefault(); onEdit(); }}><Icon name="edit" /></a>
          <a href="#" className="avo-act avo-act-del" title="삭제" aria-label="삭제" onClick={e => { e.preventDefault(); onDel(); }}><Icon name="trash" /></a>
        </span>
      )}
    </div>
  );
}

/* ---------- 시트 : 보기용 초기값 (이미지 참조 → 격리 창에서 읽을 수 있는 주소) ---------- */
function useSheetInit(char: Char, entry: SheetEntry, accent: string, lbColor: string): SheetInit | null {
  const { store } = useAvo();
  const data = store.sheetData(char.id).e[entry.id] ?? {};
  const dataKey = JSON.stringify(data);
  const imgKey = JSON.stringify([entry.img, char.thumb, char.full]);
  const [init, setInit] = useState<SheetInit | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const images: Record<string, string> = {};
      for (const [k, r] of Object.entries(entry.img)) { const u = await refToPortableUrl(r); if (u) images[k] = u; }
      const thumb = await refToPortableUrl(char.thumb), fullU = await refToPortableUrl(char.full);
      if (alive) setInit({ data: JSON.parse(dataKey) as Record<string, unknown>, images, ctx: { name: char.name, nameSub: char.nameSub, accent, label: lbColor, images: { thumb, full: fullU } } });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, imgKey, char.name, char.nameSub, accent, lbColor]);
  return init;
}

function SheetView({ char, entry, accent, lbColor, layout }: { char: Char; entry: SheetEntry; accent: string; lbColor: string; layout: 'fit' | 'grow' }) {
  const { store } = useAvo();
  const { doc, width, err } = useSheetDoc(entry.sheetId, store.sheetLib);
  const init = useSheetInit(char, entry, accent, lbColor);
  if (err) return <p className="avo-empty">{err}</p>;
  if (!doc || !init) return <p className="avo-empty">불러오는 중…</p>;
  // 값이 바뀌면 시트를 새로 띄운다 (시트 SDK는 처음 받은 값만 적용하므로)
  return <SheetFrame key={`${entry.id}:${JSON.stringify(init).length}:${doc.length}`} doc={doc} width={width} mode="view" init={init} layout={layout} />;
}

function SheetEditBtn({ char, entry, accent, lbColor, onOpen }: { char: Char; entry: SheetEntry; accent: string; lbColor: string; onOpen: (e: SheetEntry, i: SheetInit) => void }) {
  const init = useSheetInit(char, entry, accent, lbColor);
  return <button type="button" className="avo-btn avo-btn-s" disabled={!init} onClick={() => init && onOpen(entry, init)}><Icon name="edit" />편집</button>;
}

/* ---------- 커미션 자료 팝업 (JPG 저장) ---------- */
function RefSheet({ char, accent, canEdit, onEdit, onClose }: { char: Char; accent: string; canEdit: boolean; onEdit: () => void; onClose: () => void }) {
  const toast = useToast();
  const body = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const fullRef = char.comFull || char.full;
  const headRef = char.comHead || char.thumb;
  const saveJpg = async () => {
    if (!body.current) return;
    setBusy(true);
    try {
      const w = window as unknown as { html2canvas?: (el: HTMLElement, o: Record<string, unknown>) => Promise<HTMLCanvasElement> };
      if (!w.html2canvas) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          s.onload = () => res(); s.onerror = () => rej(new Error('load'));
          document.head.appendChild(s);
        });
      }
      const cv = await w.html2canvas!(body.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      const url = cv.toDataURL('image/jpeg', 0.93);
      const a = document.createElement('a');
      a.href = url; a.download = `${char.name.replace(/[\\/:*?"<>|]/g, '_')}_자료.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch { toast('이미지로 저장하지 못했어요'); }
    setBusy(false);
  };
  return (
    <AvoModal open onClose={onClose} accent={accent} boxClass="avo-sheet-wrap">
      <div className="avo-sheet-tools" data-html2canvas-ignore="true">
        {canEdit && <button type="button" className="avo-btn" onClick={onEdit}><Icon name="edit" />자료 편집</button>}
        <span className="avo-sp" />
        <button type="button" className="avo-btn avo-btn-pri" disabled={busy} onClick={() => { void saveJpg(); }}>{busy ? '저장 중…' : 'JPG 저장'}</button>
        <button type="button" className="avo-btn" onClick={onClose}>닫기</button>
      </div>
      <div className="avo-sheet" ref={body} style={{ '--avo-accent': accent } as React.CSSProperties}>
        <header className="avo-sheet-head">
          <strong>{char.name}</strong>
          {char.nameSub && <span>{char.nameSub}</span>}
          <em>Reference Sheet</em>
        </header>
        <div className="avo-sheet-main">
          <div className="avo-sheet-full">
            {fullRef ? <Img src={fullRef} /> : <span className="avo-stage-ph">전신</span>}
            <span className="avo-sheet-cap">전신 (메인)</span>
          </div>
          <div className="avo-sheet-info">
            <div className="avo-sheet-top">
              <div className="avo-sheet-head-img">
                {headRef ? <Img src={headRef} /> : <span className="avo-stage-ph">두상</span>}
                <span className="avo-sheet-cap">두상</span>
              </div>
              <div className="avo-sheet-colors">
                <h4>테마색</h4>
                {(char.comColors.length ? char.comColors : [{ hex: accent, name: '대표색' }]).map((c, i) => (
                  <div key={i} className="avo-sw"><i style={{ background: c.hex }} /><span><b>{c.name}</b><code>{c.hex.toUpperCase()}</code></span></div>
                ))}
              </div>
            </div>
            <dl className="avo-sheet-feat">
              <dt>특징 · 눈매</dt><dd>{char.comEye ? <Nl text={char.comEye} /> : <span className="avo-dim">-</span>}</dd>
              <dt>인상</dt><dd>{char.comImpression ? <Nl text={char.comImpression} /> : <span className="avo-dim">-</span>}</dd>
              <dt>헤어스타일</dt><dd>{char.comHair ? <Nl text={char.comHair} /> : <span className="avo-dim">-</span>}</dd>
              {char.comEtc && <><dt>기타</dt><dd><Nl text={char.comEtc} /></dd></>}
            </dl>
          </div>
        </div>
        <div className="avo-sheet-extra">
          <h4>추가 자료</h4>
          {char.comExtra && <div className="avo-sheet-note"><Nl text={char.comExtra} /></div>}
          {char.comImages.length > 0 && (
            <div className="avo-sheet-imgs">
              {char.comImages.map((im, i) => <figure key={i}><Img src={im.img} />{im.cap && <figcaption>{im.cap}</figcaption>}</figure>)}
            </div>
          )}
          {!char.comExtra && !char.comImages.length && <div className="avo-sheet-blank">커미션에 따라 필요한 자료를 자유롭게 추가하는 공간</div>}
        </div>
      </div>
    </AvoModal>
  );
}
