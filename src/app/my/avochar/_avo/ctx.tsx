'use client';
// 게시판 전체가 함께 쓰는 값 — 저장소 · 로그인 정보 · 주소 이동
import React, { createContext, useCallback, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { AvoStore, Conf, Char } from './lib';

export interface AvoCtxValue {
  store: AvoStore;
  user: { id: string; nickname: string } | null;
  isAdmin: boolean;
  siteAccent: string;
  /** 주소 이동 — 이 게시판 안에서 (?c= 캐릭터 · ?p= 글 · ?cf= 캐릭터별 글 · ?q= 검색 · ?pg= 쪽) */
  go: (q: Record<string, string | number | undefined>) => void;
  base: string;
}
const Ctx = createContext<AvoCtxValue | null>(null);

export function AvoProvider({ value, children }: { value: Omit<AvoCtxValue, 'go' | 'base'>; children: React.ReactNode }) {
  const router = useRouter();
  const base = usePathname() || '/my/avochar';
  const go = useCallback((q: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== '' && v !== 0) sp.set(k, String(v));
    const s = sp.toString();
    router.push(s ? `${base}?${s}` : base);
  }, [router, base]);
  return <Ctx.Provider value={{ ...value, go, base }}>{children}</Ctx.Provider>;
}

export function useAvo(): AvoCtxValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('AvoProvider 밖에서 사용됨');
  return v;
}

/** 캐릭터 테마 컬러 — 비우면 홈페이지 기본 컬러 */
export const themeOf = (c: Pick<Char, 'accent'>, conf: Conf, site: string) => c.accent || conf.accent || site || '#6f9a4c';
