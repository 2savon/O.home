'use client';
// 일반 게시글 보기 · 쓰기 · 댓글 — 원본 _view_post.php / write.skin.php(일반글) / view_comment.skin.php
import React, { useState } from 'react';
import { KCheck, KInput, KSelect, KTextarea } from '@/components/ui/Kit';
import { HtmlBody } from '@/components/ui/HtmlBody';
import { RichEditor } from '@/components/ui/RichEditor';
import { useAvo } from './ctx';
import { AvoModal, Img, Nl, useAvoConfirm } from './ui';
import { fmtDate, labelColor, type Post } from './lib';

/* ===================== 글 보기 ===================== */
export function PostView({ id }: { id: string }) {
  const { store, isAdmin, user, go, siteAccent } = useAvo();
  const { conf, chars, cmts } = store;
  const post = store.posts.find(p => p.id === id);
  const [edit, setEdit] = useState(false);
  const [ask, askNode] = useAvoConfirm();
  const [text, setText] = useState('');
  if (!store.loaded) return <p className="avo-empty">불러오는 중…</p>;
  if (!post || (post.secret && !isAdmin && post.authorId !== user?.id)) {
    return (
      <div className="avo-wrap"><p className="avo-empty">글을 찾을 수 없어요. (삭제되었거나 볼 수 있는 권한이 없어요)</p>
        <p style={{ textAlign: 'center' }}><button type="button" className="avo-btn" onClick={() => go({})}>목록으로</button></p></div>
    );
  }
  const ch = chars.find(c => c.id === post.charId);
  const mine = !!user && user.id === post.authorId;
  const canEdit = isAdmin || mine;
  const list = cmts.filter(c => c.postId === post.id);
  const canCmt = !!user && conf.cmtPerm === 'member';
  const canWrite = !!user && (isAdmin || conf.postPerm === 'member');
  const accent = conf.accent || siteAccent;

  return (
    <div className="avo-wrap" style={{ maxWidth: 'none', padding: 0, '--avo-accent': accent } as React.CSSProperties}>
      <article className="avo-post-view">
        <header className="avo-pv-head">
          {ch && (
            <button type="button" className="avo-pv-char" style={{ '--lb': labelColor(conf.labels, ch.label || conf.labels[0]?.[0] || '') } as React.CSSProperties} onClick={() => go({ c: ch.id })}>
              {(ch.thumb || ch.full) && <Img src={ch.thumb || ch.full} />}
              <span>{ch.name}</span>
            </button>
          )}
          <h1 className="avo-pv-title">{post.notice && <b className="avo-notice">공지</b>}{post.secret && '🔒 '}{post.title}</h1>
          <p className="avo-pv-meta">
            <span>{post.author}</span>
            <span>{fmtDate(post.date, true)}</span>
            {post.edited && <span>수정 {fmtDate(post.edited, true)}</span>}
          </p>
        </header>
        <div className="avo-pv-body">
          <HtmlBody className="avo-pv-content" html={post.body} />
        </div>
        <div className="avo-pv-btns">
          <button type="button" className="avo-btn" onClick={() => go({})}>목록</button>
          {ch && <button type="button" className="avo-btn" onClick={() => go({ cf: ch.id })}>이 캐릭터 글 모아보기</button>}
          <span className="avo-sp" />
          {canEdit && <button type="button" className="avo-btn" onClick={() => setEdit(true)}>수정</button>}
          {canEdit && <button type="button" className="avo-btn" onClick={() => ask('이 글을 삭제할까요?', () => { store.deletePost(post.id); go({}); }, { danger: true, okLabel: '삭제' })}>삭제</button>}
          {canWrite && <button type="button" className="avo-btn avo-btn-pri" onClick={() => go({ w: 'post', cf: post.charId })}>글쓰기</button>}
        </div>
      </article>

      {(conf.cmtPerm !== 'none' || list.length > 0) && (
        <section className="avo-cmts">
          <h3 className="avo-mini-title">댓글 {list.length}</h3>
          {list.map(c => (
            <div key={c.id} className="avo-cmt-item">
              <header><b>{c.author}</b><time>{fmtDate(c.date, true)}</time></header>
              <p className="avo-cmt-body"><Nl text={c.text} /></p>
              {(isAdmin || c.authorId === user?.id) && (
                <div className="avo-cmt-act"><button type="button" onClick={() => ask('댓글을 삭제할까요?', () => store.deleteCmt(c.id), { danger: true, okLabel: '삭제' })}>삭제</button></div>
              )}
            </div>
          ))}
          {canCmt ? (
            <form className="avo-cmt-form" onSubmit={e => { e.preventDefault(); const t = text.trim(); if (!t) return; store.addCmt(post.id, t); setText(''); }}>
              <KTextarea rows={2} value={text} maxLength={5000} placeholder="댓글" onChange={e => setText(e.target.value)} />
              <button type="submit" className="avo-btn avo-btn-pri" disabled={!text.trim()}>등록</button>
            </form>
          ) : conf.cmtPerm !== 'none' && <p className="avo-help">로그인하면 댓글을 남길 수 있어요.</p>}
        </section>
      )}

      {edit && <PostForm post={post} onClose={() => setEdit(false)} onSaved={() => setEdit(false)} />}
      {askNode}
    </div>
  );
}

/* ===================== 글쓰기 / 수정 ===================== */
export function PostForm({ post, charId, onClose, onSaved }: { post?: Post; charId?: string; onClose: () => void; onSaved: (id: string) => void }) {
  const { store, isAdmin, user, siteAccent } = useAvo();
  const { chars, conf } = store;
  const [p, setP] = useState<Post>(() => post ? { ...post } : {
    id: '', charId: charId && chars.some(c => c.id === charId) ? charId : '', title: '', body: '', secret: false, notice: false,
    author: user?.nickname ?? '', authorId: user?.id ?? '', date: '',
  });
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState('');
  const set = <K extends keyof Post>(k: K, v: Post[K]) => { setP(x => ({ ...x, [k]: v })); setDirty(true); };
  const save = () => {
    const title = p.title.trim();
    if (!title) { setErr('제목은 필수 입력이에요.'); return; }
    const id = store.savePost({ ...p, title: title.slice(0, 80), notice: isAdmin && p.notice });
    setDirty(false);
    onSaved(id);
  };
  return (
    <AvoModal open onClose={onClose} dirty={dirty} accent={conf.accent || siteAccent}>
      <div className="avo-form-scroll avo-write">
        <h2 className="avo-w-title">{post ? '글 수정' : '게시글 작성'}</h2>
        {err && <p className="avo-err">{err}</p>}
        <fieldset className="avo-fs">
          <div className="avo-f"><span className="avo-lbl">캐릭터 <small>(등록한 캐릭터가 카테고리가 돼요)</small></span>
            <KSelect value={p.charId} onChange={v => set('charId', v)} minWidth={220} maxWidth={320}
              options={[{ value: '', label: '— 선택 안 함 —' }, ...chars.map(c => ({ value: c.id, label: `[${c.label || conf.labels[0]?.[0] || ''}] ${c.name}` }))]} />
          </div>
          <div className="avo-f"><span className="avo-lbl">제목</span><KInput value={p.title} maxLength={80} onChange={e => set('title', e.target.value)} /></div>
          <div className="avo-check-row">
            <KCheck checked={p.secret} onChange={v => set('secret', v)} label="비밀글 (작성자와 관리자만 — 서버에서 막아요)" />
            {isAdmin && <KCheck checked={p.notice} onChange={v => set('notice', v)} label="공지" />}
          </div>
          <div className="avo-f avo-editor"><RichEditor value={p.body} onChange={v => set('body', v)} placeholder="내용" /></div>
        </fieldset>
      </div>
      <div className="avo-w-btns">
        <button type="button" className="avo-btn" onClick={onClose}>취소</button>
        <button type="button" className="avo-btn avo-btn-pri" onClick={save}>저장</button>
      </div>
    </AvoModal>
  );
}
