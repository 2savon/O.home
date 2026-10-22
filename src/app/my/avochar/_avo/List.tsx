'use client';
// 메인 : 캐릭터 목록(라벨 필터 · 슬라이드) + 툴바 + 게시글 목록 — 원본 list.skin.php
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KInput, KSelect } from '@/components/ui/Kit';
import { useAvo, themeOf } from './ctx';
import { Icon, Img, posStyle } from './ui';
import { fmtShort, initial, labelColor, type Char } from './lib';
import { LabelManager, SettingsModal } from './Settings';
import { CharForm } from './CharForms';
import { PostForm } from './Posts';

export function ListView({ cf, q, pg, w }: { cf: string; q: string; pg: number; w?: string }) {
  const { store, isAdmin, user, siteAccent, go } = useAvo();
  const { conf, chars, posts, cmts } = store;
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(0);
  const [lbm, setLbm] = useState(false);
  const [settings, setSettings] = useState(false);
  const [newChar, setNewChar] = useState(false);
  const [newPost, setNewPost] = useState(w === 'post');
  const [qText, setQText] = useState(q);
  useEffect(() => setQText(q), [q]);

  /* 라벨 칩 : 설정의 라벨 순서 → 그 밖에 캐릭터가 쓰는 라벨 */
  const labelOf = (c: Char) => c.label || conf.labels[0]?.[0] || 'OC';
  const chips = useMemo(() => {
    const used = new Set(chars.map(labelOf));
    const out: [string, string][] = conf.labels.filter(l => used.has(l[0]));
    for (const n of used) if (!out.some(x => x[0] === n)) out.push([n, labelColor(conf.labels, n)]);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, conf.labels]);

  const shown = chars.filter(c => !filter || labelOf(c) === filter);
  const per = conf.perPage;
  const pages = Math.max(1, Math.ceil(shown.length / per));
  const cur = Math.min(page, pages - 1);
  const slice = shown.slice(cur * per, cur * per + per);
  const move = (d: number) => { setDir(d); setPage(p => Math.max(0, Math.min(pages - 1, p + d))); };
  const sx = useRef(0);

  /* 게시글 */
  const canPost = !!user && (isAdmin || conf.postPerm === 'member');
  const kw = q.trim().toLowerCase();
  const list = posts.filter(p => (!cf || p.charId === cf) && (!kw || p.title.toLowerCase().includes(kw)
    || (!p.secret && p.body.replace(/<[^>]*>/g, ' ').toLowerCase().includes(kw))));
  const rows = conf.postRows;
  const tp = Math.max(1, Math.ceil(list.length / rows));
  const pp = Math.min(Math.max(1, pg || 1), tp);
  const pSlice = list.slice((pp - 1) * rows, pp * rows);
  const charMap = useMemo(() => new Map(chars.map(c => [c.id, c])), [chars]);
  const cmtCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cmts) m.set(c.postId, (m.get(c.postId) ?? 0) + 1);
    return m;
  }, [cmts]);
  const canRead = (authorId: string, secret: boolean) => !secret || isAdmin || authorId === user?.id;

  return (
    <div className="avo-wrap" style={{ maxWidth: 'none', padding: 0 }}>
      {/* ===== 캐릭터 목록 ===== */}
      <section className={`avo-chars ${pages <= 1 ? 'is-single' : ''}`}>
        <div className="avo-sec-head">
          <h2 className="avo-sec-title">Characters <small>{chars.length}</small></h2>
          {chips.length > 1 && (
            <div className="avo-chips" role="tablist">
              <button type="button" className={`avo-chip ${!filter ? 'is-on' : ''}`} onClick={() => { setFilter(''); setPage(0); }}>전체</button>
              {chips.map(([n, col]) => (
                <button key={n} type="button" className={`avo-chip ${filter === n ? 'is-on' : ''}`} onClick={() => { setFilter(n); setPage(0); setDir(0); }}>
                  <i style={{ background: col }} />{n}
                </button>
              ))}
            </div>
          )}
          {isAdmin && <button type="button" className="avo-btn avo-btn-s avo-lbm-btn" onClick={() => setLbm(true)}><Icon name="tag" />라벨 관리</button>}
        </div>

        {chars.length ? (
          <>
            <div className="avo-slider">
              <button type="button" className="avo-arrow avo-prev" aria-label="이전" disabled={cur <= 0} onClick={() => move(-1)}>
                <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <div key={`${cur}-${filter}`} className={`avo-grid ${dir > 0 ? 'slide-l' : dir < 0 ? 'slide-r' : ''}`}
                onTouchStart={e => { sx.current = e.touches[0].clientX; }}
                onTouchEnd={e => { const d = e.changedTouches[0].clientX - sx.current; if (Math.abs(d) > 50) move(d < 0 ? 1 : -1); }}>
                {slice.map(c => {
                  const th = c.thumb || c.full;
                  return (
                    <a key={c.id} className="avo-card" role="link" tabIndex={0} style={{ '--lb': themeOf(c, conf, siteAccent) } as React.CSSProperties}
                      onClick={() => go({ c: c.id })} onKeyDown={e => { if (e.key === 'Enter') go({ c: c.id }); }}>
                      <span className="avo-card-thumb">
                        {th ? <Img src={th} alt={c.name} style={!c.thumb ? posStyle(c.fullPos) : undefined} /> : <span className="avo-card-ph">{initial(c.name)}</span>}
                        <span className="avo-ribbon">{labelOf(c)}</span>
                      </span>
                      <span className="avo-card-name">{c.name}</span>
                      {c.affiliation && <span className="avo-card-aff">{c.affiliation}</span>}
                    </a>
                  );
                })}
              </div>
              <button type="button" className="avo-arrow avo-next" aria-label="다음" disabled={cur >= pages - 1} onClick={() => move(1)}>
                <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            {pages > 1 && (
              <div className="avo-dots">
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} type="button" className={`avo-dot ${i === cur ? 'is-on' : ''}`} onClick={() => { setDir(i - cur); setPage(i); }}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="avo-empty">아직 등록된 캐릭터가 없어요.{isAdmin && <> <a href="#" onClick={e => { e.preventDefault(); setNewChar(true); }}>첫 캐릭터 등록하기</a></>}</p>
        )}
      </section>

      {/* ===== 툴바 ===== */}
      <div className="avo-bar">
        <form className="avo-filter" onSubmit={e => { e.preventDefault(); go({ cf, q: qText.trim() }); }}>
          <KSelect value={cf} onChange={v => go({ cf: v, q })} minWidth={150}
            options={[{ value: '', label: '모든 캐릭터' }, ...chars.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="avo-search"><KInput type="search" value={qText} onChange={e => setQText(e.target.value)} placeholder="글 검색" /></div>
          <button type="submit" className="avo-btn">검색</button>
        </form>
        <div className="avo-actions">
          {isAdmin && <button type="button" className="avo-btn avo-btn-pri" onClick={() => setNewChar(true)}>＋ 캐릭터 생성</button>}
          {canPost && <button type="button" className="avo-btn avo-btn-pri" onClick={() => setNewPost(true)}>＋ 게시글 작성</button>}
          {isAdmin && <button type="button" className="avo-btn" onClick={() => setSettings(true)}><Icon name="gear" />설정</button>}
        </div>
      </div>

      {/* ===== 게시글 목록 ===== */}
      <section className="avo-posts">
        <div className="avo-post-head">
          <span className="avo-col-char">캐릭터</span>
          <span className="avo-col-subj">제목</span>
          <span className="avo-col-date">날짜</span>
        </div>
        <ul className="avo-post-list">
          {pSlice.map(p => {
            const ch = charMap.get(p.charId);
            const ok = canRead(p.authorId, p.secret);
            const n = cmtCount.get(p.id) ?? 0;
            return (
              <li key={p.id} className={`avo-post ${p.notice ? 'is-notice' : ''}`}>
                <span className="avo-col-char">
                  {ch ? (
                    <button type="button" className="avo-tag" style={{ '--lb': labelColor(conf.labels, labelOf(ch)) } as React.CSSProperties}
                      onClick={() => go({ cf: ch.id })}>{ch.name}</button>
                  ) : <span className="avo-tag avo-tag-none">—</span>}
                </span>
                <a className="avo-col-subj" role="link" tabIndex={0} onClick={() => ok && go({ p: p.id })} onKeyDown={e => { if (e.key === 'Enter' && ok) go({ p: p.id }); }}>
                  {p.notice && <b className="avo-notice">공지</b>}
                  {p.secret && <span className="avo-lock" title="비밀글">🔒 </span>}
                  {ok ? p.title : '비밀글입니다'}
                  {n > 0 && <em className="avo-cmt">{n}</em>}
                </a>
                <span className="avo-col-date">{fmtShort(p.date)}</span>
              </li>
            );
          })}
          {!pSlice.length && <li className="avo-empty">게시글이 없습니다.</li>}
        </ul>
        {tp > 1 && (
          <nav className="avo-paging">
            {Array.from({ length: tp }, (_, i) => i + 1).map(n => n === pp
              ? <strong key={n}>{n}</strong>
              : <a key={n} href="#" onClick={e => { e.preventDefault(); go({ cf, q, pg: n }); }}>{n}</a>)}
          </nav>
        )}
      </section>

      {lbm && <LabelManager kind="char" onClose={() => setLbm(false)} />}
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
      {newChar && <CharForm onClose={() => setNewChar(false)} onSaved={id => { setNewChar(false); go({ c: id }); }} />}
      {newPost && <PostForm charId={cf} onClose={() => { setNewPost(false); if (w) go({ cf, q }); }} onSaved={id => { setNewPost(false); go({ p: id }); }} />}
    </div>
  );
}
