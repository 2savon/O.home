'use client';
/**
 * 아보카도 캐릭터 게시판 (avocado_char v1.9.2) — O.home 이식판
 *
 * 이 폴더(src/app/my/avochar)와 public/my/avochar 는 O.home 원본에 없는 **새 파일만** 있다.
 * 원본 파일을 한 줄도 고치지 않으므로 [Sync fork]로 업데이트해도 충돌이 나지 않는다.
 * 메뉴 연결 : 환경설정 › 메뉴 관리 › 커스텀 링크에 `/my/avochar` 를 추가.
 *
 * 주소 : /my/avochar            목록
 *        /my/avochar?c=<id>     캐릭터 페이지
 *        /my/avochar?p=<id>     게시글
 *        /my/avochar?cf=<id>    캐릭터별 글 모아보기 (&q= 검색, &pg= 쪽)
 */
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { PageTitle } from '@/components/ui/PageText';
import { useAvoStore } from './_avo/lib';
import { AvoProvider, useAvo } from './_avo/ctx';
import { AVO_CSS } from './_avo/css';
import { CropProvider } from './_avo/ui';
import { ListView } from './_avo/List';
import { CharView } from './_avo/CharView';
import { PostView } from './_avo/Posts';

export default function AvoCharPage() {
  return <Suspense fallback={<section className="page" />}><Inner /></Suspense>;
}

function Inner() {
  const { user, isAdmin } = useAuth();
  const store = useAvoStore(user ? { id: user.id, nickname: user.nickname } : null);
  const [siteAccent, setSiteAccent] = useState('#a63a45');
  useEffect(() => {
    // O.home 테마의 강조색을 홈페이지 기본 컬러로 (원본은 아보카도 디자인 설정의 포인트 컬러를 가져왔다)
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if (v) setSiteAccent(v);
  }, []);
  return (
    <AvoProvider value={{ store, user: user ? { id: user.id, nickname: user.nickname } : null, isAdmin, siteAccent }}>
      <CropProvider>
        <style>{AVO_CSS}</style>
        <Body />
      </CropProvider>
    </AvoProvider>
  );
}

function Body() {
  const sp = useSearchParams();
  const { store, siteAccent, base } = useAvo();
  const c = sp.get('c') ?? '';
  const p = sp.get('p') ?? '';
  const cf = sp.get('cf') ?? '';
  const q = sp.get('q') ?? '';
  const pg = Number(sp.get('pg')) || 1;
  const w = sp.get('w') ?? '';
  const { conf } = store;
  const fullChar = !!c && conf.viewMode === 'full';
  useEffect(() => { window.scrollTo(0, 0); }, [c, p]);
  // 팝업(자르기 편집기 등)은 body에 따로 뜨므로 기본 컬러를 문서 전체에 알려 둔다
  const site = conf.accent || siteAccent;
  useEffect(() => {
    document.documentElement.style.setProperty('--avo-site', site);
    return () => { document.documentElement.style.removeProperty('--avo-site'); };
  }, [site]);
  return (
    <section className="page avo-page">
      {!fullChar && (
        <div className="page-head">
          <PageTitle href={base}>{conf.title}</PageTitle>
          {conf.desc && <p>{conf.desc}</p>}
        </div>
      )}
      {!store.loaded ? <div className="avo-wrap"><p className="avo-empty">불러오는 중…</p></div>
        : c ? <CharView id={c} />
          : p ? <PostView id={p} />
            : <ListView cf={cf} q={q} pg={pg} w={w} />}
    </section>
  );
}
