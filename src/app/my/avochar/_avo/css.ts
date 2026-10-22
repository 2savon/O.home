// 게시판 스타일 — 원본 스킨 style.css를 그대로 옮기고 O.home 레이어에 맞춰 z-index만 조정
// (전역 CSS import 대신 문자열로 두어 Next 버전이 바뀌어도 영향이 없게)
export const AVO_CSS = String.raw`/* 원본 style.css (아보카도 캐릭터 게시판 스킨 v1.9.2) + O.home 이식 추가분 — 자동 생성 아님, 직접 고쳐도 됩니다 */
/* =========================================================
   아보카도 캐릭터 게시판 스킨 v1.3
   색은 아래 변수만 바꾸면 전체에 적용돼요.
   ========================================================= */
.avo-wrap, .avo-modal {
    --avo-accent: #6f9a4c;              /* 기본 강조색 (캐릭터 페이지에서는 캐릭터 대표색) */
    --avo-ink: #2b2b2b;                 /* 글자색 */
    --avo-sub: #8a8a8a;                 /* 보조 글자색 */
    --avo-line: rgba(0,0,0,.1);         /* 선 */
    --avo-panel: rgba(255,255,255,.86); /* 패널 배경 (반투명 → 배경이 비침) */
    --avo-soft: rgba(0,0,0,.04);
    --avo-radius: 10px;
}
/* 기본 글꼴 : Pretendard (불러오지 못하면 시스템 글꼴) */
.avo-wrap, .avo-modal { font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
.avo-wrap button, .avo-wrap input, .avo-wrap select, .avo-wrap textarea, .avo-modal button, .avo-modal input, .avo-modal select, .avo-modal textarea { font-family: inherit; }
.avo-wrap { box-sizing: border-box; max-width: 1100px; margin: 0 auto; padding: 16px; color: var(--avo-ink); font-size: 14px; line-height: 1.6; }
.avo-wrap *, .avo-modal * { box-sizing: border-box; }
.avo-wrap a, .avo-modal a { color: inherit; text-decoration: none; }
.avo-wrap img, .avo-modal img { max-width: 100%; }
.avo-wrap [hidden], .avo-modal [hidden] { display: none !important; }
.avo-ico { width: 20px; height: 20px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

/* 공통 버튼 / 입력 */
.avo-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 34px; padding: 0 14px; border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; color: var(--avo-ink) !important; font-size: 13px; font-family: inherit; line-height: 1; cursor: pointer; white-space: nowrap; transition: border-color .15s, color .15s, filter .15s; }
.avo-btn:hover { border-color: var(--avo-accent); color: var(--avo-accent) !important; }
.avo-btn .avo-ico { width: 15px; height: 15px; }
.avo-btn-pri { background: var(--avo-accent); border-color: var(--avo-accent); color: #fff !important; }
.avo-btn-pri:hover { filter: brightness(1.08); color: #fff !important; }
.avo-btn-danger { background: #d64545 !important; border-color: #d64545 !important; }
.avo-btn-s { height: 30px; padding: 0 10px; font-size: 12px; }
.avo-btn:disabled { opacity: .5; cursor: default; }
.avo-in { width: 100%; height: 36px; padding: 0 10px; border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; color: var(--avo-ink); font: inherit; font-size: 14px; }
textarea.avo-in { height: auto; padding: 8px 10px; line-height: 1.6; resize: vertical; }
.avo-in:focus { outline: none; border-color: var(--avo-accent); box-shadow: 0 0 0 3px rgba(111,154,76,.15); }
.avo-in-s { width: auto; min-width: 120px; height: 32px; }
.avo-sp { flex: 1; }
.avo-empty { padding: 28px 0; text-align: center; color: var(--avo-sub); list-style: none; }
.avo-empty a { color: var(--avo-accent); text-decoration: underline; }
.avo-mini-title { display: flex; align-items: center; gap: 6px; margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .08em; color: var(--avo-sub); }
.avo-cmt { font-style: normal; font-size: 11px; color: var(--avo-accent); font-weight: 700; margin-left: 4px; }
.avo-dim { color: var(--avo-sub); }
html.avo-lock-scroll, html.avo-lock-scroll body { overflow: hidden !important; }
/* 편집창·자료 팝업이 열려 있는 동안 뒤 화면의 흐림 효과를 꺼서 입력 지연 방지 */
html.avo-has-frame .avo-cv-left, html.avo-has-frame .avo-cv-right,
html.avo-lock-scroll .avo-modal.is-open ~ .avo-cv .avo-cv-left { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
html.avo-has-frame .avo-cv { animation: none !important; }

/* 숨김 스크롤 : 스크롤은 되지만 막대는 보이지 않음 */
.avo-cv-panel, .avo-cv-right, .avo-cv-rels ul, .avo-cv-tabs { scrollbar-width: none; -ms-overflow-style: none; }
.avo-cv-panel::-webkit-scrollbar, .avo-cv-right::-webkit-scrollbar, .avo-cv-rels ul::-webkit-scrollbar, .avo-cv-tabs::-webkit-scrollbar { display: none; }

/* 컬러 라벨 */
.avo-ribbon { position: absolute; top: 0; left: 0; z-index: 2; padding: 3px 9px 3px 8px; border-radius: 0 0 8px 0; background: var(--lb, var(--avo-accent)); color: #fff; font-size: 11px; font-weight: 700; line-height: 1.4; box-shadow: 0 1px 3px rgba(0,0,0,.15); }
.avo-ribbon-inline { position: static; display: inline-block; border-radius: 99px; padding: 2px 10px; box-shadow: none; }
.avo-cv .avo-ribbon-inline { background: var(--avo-accent); } /* 캐릭터 페이지 왼쪽 위 라벨 = 캐릭터 테마 컬러 (메인 카드와 같게) */

/* =========================================================
   메인 : 캐릭터 목록
   ========================================================= */
.avo-sec-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.avo-sec-title { margin: 0; font-size: 18px; font-weight: 800; }
.avo-sec-title small { margin-left: 4px; font-size: 12px; font-weight: 600; color: var(--avo-sub); }
.avo-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.avo-chip { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 12px; border: 1px solid var(--avo-line); border-radius: 99px; background: #fff; color: var(--avo-ink); font: inherit; font-size: 12px; cursor: pointer; }
.avo-chip i { width: 8px; height: 8px; border-radius: 50%; }
/* 라벨 색 점 (관리자) : 누르면 색 선택 */
.avo-lbc { cursor: pointer; transition: box-shadow .15s, transform .15s; }
.avo-lbc:hover { box-shadow: 0 0 0 2px #fff, 0 0 0 3px currentColor; transform: scale(1.25); }
.avo-chip i.avo-lbc { width: 10px; height: 10px; }
.avo-sec-head .avo-chips { margin-left: auto; }
.avo-lbm-btn { flex: none; }
.avo-rec-label.avo-lbc:hover { transform: none; box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--rl); }
/* 라벨 관리 창 */
.avo-lbm-box { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 420px; max-height: 100%; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
.avo-lbm-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--avo-line); }
.avo-lbm-head small { color: var(--avo-sub); font-size: 12px; }
.avo-lbm-list { flex: 1 1 auto; margin: 0; padding: 6px 0; list-style: none; overflow-y: auto; }
.avo-lbm-list li { display: flex; align-items: center; gap: 10px; padding: 7px 16px; }
.avo-lbm-list li i { flex: none; width: 22px; height: 22px; border-radius: 6px; }
.avo-lbm-list li b { flex: 1 1 auto; min-width: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.avo-lbm-list li small { flex: none; color: var(--avo-sub); font-size: 12px; }
.avo-lbm-add { display: flex; gap: 6px; padding: 12px 16px; border-top: 1px solid var(--avo-line); }
.avo-lbm-add .avo-in { flex: 1 1 auto; min-width: 0; height: 36px; }
.avo-lbm-col { flex: none; width: 40px; height: 36px; padding: 3px; border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; cursor: pointer; }
.avo-lbm-msg { margin: 0; padding: 0 16px 10px; color: #d64545; font-size: 12px; }
.avo-lbm-msg:empty { display: none; }
.avo-lbc-pick { position: fixed; z-index: -1; width: 1px; height: 1px; padding: 0; border: 0; opacity: 0; pointer-events: none; }
.avo-chip.is-on { border-color: var(--avo-ink); background: var(--avo-ink); color: #fff; }

.avo-chars { padding: 18px; border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); }
.avo-slider { display: flex; align-items: center; gap: 10px; }
.avo-arrow { flex: none; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--avo-line); border-radius: 50%; background: #fff; cursor: pointer; }
.avo-arrow svg { width: 18px; height: 18px; fill: none; stroke: var(--avo-ink); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.avo-arrow:hover:not(:disabled) { border-color: var(--avo-accent); }
.avo-arrow:hover:not(:disabled) svg { stroke: var(--avo-accent); }
.avo-arrow:disabled { opacity: .3; cursor: default; }
.avo-chars.is-single .avo-arrow { visibility: hidden; }
.avo-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; min-width: 0; max-width: 760px; margin: 0 auto; }
.avo-grid.slide-l { animation: avoSlideL .3s ease; }
.avo-grid.slide-r { animation: avoSlideR .3s ease; }
@keyframes avoSlideL { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes avoSlideR { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }

.avo-card { position: relative; display: block; min-width: 0; text-align: center; }
/* 3:4 비율 (aspect-ratio 미지원 브라우저는 padding 방식) */
.avo-card-thumb { position: relative; display: block; height: 0; padding-top: 133.33%; overflow: hidden; border-radius: 8px; background: var(--avo-soft); box-shadow: inset 0 0 0 1px var(--avo-line); }
.avo-card-thumb img, .avo-card-ph { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.avo-card-thumb img { object-fit: cover; object-position: center top; display: block; transition: transform .35s; }
.avo-card:hover .avo-card-thumb img { transform: scale(1.05); }
.avo-card-thumb::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; border-radius: 8px; box-shadow: inset 0 0 0 0 var(--lb); transition: box-shadow .2s; }
.avo-card:hover .avo-card-thumb::after { box-shadow: inset 0 0 0 3px var(--lb); }
.avo-card-ph { display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; color: var(--lb); opacity: .6; }
.avo-card-name { display: block; margin-top: 8px; font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-card-aff { display: block; font-size: 12px; color: var(--avo-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.avo-dots { display: flex; justify-content: center; gap: 4px; margin-top: 14px; }
.avo-dots:empty { display: none; }
.avo-dot { min-width: 26px; height: 26px; padding: 0 6px; border: 0; border-radius: 6px; background: transparent; color: var(--avo-sub); font: inherit; font-size: 13px; cursor: pointer; }
.avo-dot.is-on { background: var(--avo-ink); color: #fff; font-weight: 700; }

/* 툴바 */
.avo-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin: 16px 0 10px; padding: 10px 12px; border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); }
.avo-filter { display: flex; gap: 6px; flex: 1 1 360px; min-width: 0; }
.avo-filter select { flex: 0 1 170px; }
.avo-filter input { flex: 1 1 140px; min-width: 0; }
.avo-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.avo-btn-home .avo-ico { width: 15px; height: 15px; }

/* 게시글 목록 */
.avo-posts { border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); overflow: hidden; }
.avo-post-head, .avo-post { display: grid; grid-template-columns: 140px 1fr 80px; align-items: center; }
.avo-post-head { padding: 10px 14px; border-bottom: 1px solid var(--avo-line); font-size: 12px; font-weight: 700; color: var(--avo-sub); }
.avo-post-head .avo-col-char { border-right: 1px solid var(--avo-line); }
.avo-post-list { margin: 0; padding: 0; list-style: none; }
.avo-post { padding: 0 14px; border-bottom: 1px solid var(--avo-line); }
.avo-post:last-child { border-bottom: 0; }
.avo-post:hover { background: var(--avo-soft); }
.avo-post .avo-col-char { align-self: stretch; display: flex; align-items: center; padding: 10px 10px 10px 0; border-right: 1px solid var(--avo-line); min-width: 0; }
.avo-col-subj { display: block; padding: 11px 12px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-post-head .avo-col-subj { padding: 0 12px; }
.avo-col-date { text-align: right; font-size: 12px; color: var(--avo-sub); }
.avo-tag { display: inline-flex; align-items: center; max-width: 100%; gap: 5px; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-tag::before { content: ""; flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--lb, var(--avo-accent)); }
.avo-tag:hover { color: var(--lb); }
.avo-tag-none { color: var(--avo-sub); }
.avo-tag-none::before { display: none; }
.avo-re { color: var(--avo-sub); margin-right: 4px; }
.avo-notice { display: inline-block; margin-right: 6px; padding: 0 6px; border-radius: 4px; background: var(--avo-ink); color: #fff; font-size: 11px; }
.avo-lock { font-size: 11px; }
.avo-paging { padding: 14px; text-align: center; border-top: 1px solid var(--avo-line); }
.avo-paging .pg_wrap, .avo-paging .pg { float: none !important; display: inline-block; }
.avo-paging a, .avo-paging strong { display: inline-block; min-width: 28px; height: 28px; line-height: 28px; margin: 0 1px; padding: 0 6px; border-radius: 6px; font-size: 13px; }
.avo-paging strong, .avo-paging .pg_current { background: var(--avo-ink); color: #fff; }

/* =========================================================
   상세1 : 캐릭터 페이지 (화면 꽉 채움)
   ========================================================= */
.avo-cv { background-size: cover; background-position: center; background-repeat: no-repeat; }
.avo-cv.is-full { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 85; /* O.home 상단바(60)·BGM(70) 위, 모달(90)·선택창(140) 아래 */ max-width: none; margin: 0; padding: 0; overflow: hidden; background-color: var(--avo-site-bg, #f3f2ee); }
.avo-cv.is-fit { max-width: none; padding: 0; height: 100vh; min-height: 560px; }
.avo-cv-inner { display: grid; grid-template-columns: minmax(280px, 26%) 64px minmax(0, 1fr) minmax(150px, 13%); height: 100%; }
.avo-cv.is-full .avo-cv-inner { height: 100vh; }
@supports (height: 100dvh) { .avo-cv.is-full .avo-cv-inner, .avo-cv.is-fit { height: 100dvh; } }

/* 왼쪽 */
.avo-cv-left { display: flex; flex-direction: column; min-height: 0; background: var(--avo-panel); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.avo-cv-top { flex: none; display: flex; align-items: center; padding: 14px 20px 0; }
.avo-cv-back { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; font-weight: 700; color: var(--avo-sub) !important; transition: color .15s; }
.avo-cv-back .avo-ico { width: 16px; height: 16px; }
.avo-cv-back:hover { color: var(--avo-accent) !important; }
.avo-cv-basic { position: relative; flex: none; padding: 10px 24px 16px; border-bottom: 1px solid var(--avo-line); }
.avo-au-tag { display: inline-block; margin-left: 4px; padding: 1px 9px; border: 1px solid var(--avo-accent); border-radius: 99px; color: var(--avo-accent); font-size: 11px; font-weight: 700; }
.avo-cv-aff { margin: 8px 0 0; font-size: 12px; color: var(--avo-sub); }
.avo-cv-name { margin: 2px 0 0; font-size: 26px; font-weight: 800; line-height: 1.25; color: var(--avo-ink); word-break: keep-all; }
.avo-cv-sub { margin: 2px 0 0; font-size: 13px; color: var(--avo-accent); font-weight: 600; letter-spacing: .03em; }
.avo-cv-quote { margin: 10px 0 0; padding-left: 10px; border-left: 3px solid var(--avo-accent); font-size: 13px; color: #555; }
.avo-cv-panel { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 18px 24px; }
.avo-cv-panel { display: flex; flex-direction: column; }
.avo-pane { display: none; animation: avoFade .25s ease; }
.avo-pane.is-on { display: flex; flex-direction: column; flex: 1 0 auto; }
.avo-var { animation: avoFade .25s ease; }
@keyframes avoFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.avo-prof { display: grid; grid-template-columns: 80px 1fr; gap: 7px 10px; margin: 0; }
.avo-prof dt { font-size: 12px; font-weight: 700; color: var(--avo-accent); padding-top: 1px; }
.avo-prof dd { margin: 0; word-break: break-all; }
.avo-prof dd small { color: var(--avo-sub); }
.avo-prof .avo-prof-full { grid-column: 1 / -1; }
.avo-prof-intro { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--avo-line); font-size: 13px; color: #555; }
.avo-story { font-size: 14px; line-height: 1.85; word-break: break-all; }
.avo-story img { height: auto; }
.avo-log { margin: 0; padding: 0; list-style: none; }
.avo-log li a { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--avo-line); }
.avo-log li a:hover .avo-log-t { color: var(--avo-accent); }
.avo-log-t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.avo-log-d { flex: none; font-size: 12px; color: var(--avo-sub); }
.avo-log-more { display: inline-block; margin-top: 10px; font-size: 12px; color: var(--avo-accent) !important; }

/* 로그 읽기 (왼쪽 칸) */
.avo-log-view { display: flex; flex-direction: column; flex: 1 0 auto; }
.avo-log-body { flex: 1; }
.avo-log-art .avo-pv-title { margin: 0 0 4px; font-size: 18px; font-weight: 800; line-height: 1.35; word-break: break-all; }
.avo-log-art .avo-pv-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid var(--avo-line); font-size: 11px; color: var(--avo-sub); }
.avo-log-art .avo-pv-img { margin-bottom: 10px; }
.avo-log-art .avo-pv-content { min-height: 0; font-size: 14px; line-height: 1.8; word-break: break-all; }
.avo-log-art img { height: auto; }
.avo-log-art .avo-pv-files { margin: 14px 0 0; padding: 8px 10px; list-style: none; border-radius: 8px; background: var(--avo-soft); font-size: 12px; }
.avo-log-bar { position: -webkit-sticky; position: sticky; bottom: -18px; margin-top: auto !important; display: flex; align-items: center; gap: 6px; margin: 16px -24px -18px; padding: 10px 24px; background: rgba(255,255,255,.96); border-top: 1px solid var(--avo-line); }
.avo-log-bar .avo-ico { width: 14px; height: 14px; }

/* 기록 */
.avo-rec-tools { display: flex; gap: 4px; margin-bottom: 10px; }
.avo-rec-tools .avo-btn.is-on { border-color: var(--avo-accent); background: var(--avo-accent); color: #fff !important; }
.avo-rec-tools .avo-ico { width: 14px; height: 14px; }
.avo-rec-banner { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; padding: 6px 6px 6px 12px; border-radius: 8px; background: var(--avo-accent); color: #fff; font-size: 12px; font-weight: 700; }
.avo-recs { margin: 0; padding: 0; list-style: none; }
.avo-rec { display: flex; align-items: center; gap: 12px; padding: 10px 6px; border-bottom: 1px solid var(--avo-line); border-radius: 8px; outline: none; transition: background .15s; }
.avo-rec.has-link, .avo-pane[data-mode="edit"] .avo-rec, .avo-pane[data-mode="del"] .avo-rec { cursor: pointer; }
.avo-rec.has-link:hover, .avo-rec.has-link:focus-visible { background: var(--avo-soft); }
.avo-pane[data-mode="edit"] .avo-rec:hover { background: var(--avo-soft); box-shadow: inset 0 0 0 2px var(--avo-accent); }
.avo-pane[data-mode="del"] .avo-rec:hover { background: rgba(214,69,69,.06); box-shadow: inset 0 0 0 2px #d64545; }
.avo-rec-thumb { flex: none; display: flex; align-items: center; justify-content: center; width: 54px; height: 54px; overflow: hidden; border-radius: 8px; background: var(--rl); color: #fff; font-weight: 800; font-size: 18px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
.avo-rec-thumb img { width: 100%; height: 100%; object-fit: cover; }
.avo-rec-body { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.35; }
.avo-rec-label { align-self: flex-start; margin-bottom: 3px; padding: 0 7px; border-radius: 99px; background: var(--rl); color: #fff; font-size: 10px; font-weight: 700; line-height: 1.6; }
.avo-rec-body strong { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-rec-body small { margin-top: 2px; font-size: 11px; color: var(--avo-sub); }
.avo-rec-go { flex: none; color: var(--avo-sub); }
.avo-rec-go .avo-ico { width: 15px; height: 15px; }
.avo-rec.has-link:hover .avo-rec-go { color: var(--avo-accent); }
/* TRPG 시트 */
.avo-sheet-tools { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.avo-sheet-tools .avo-ico { width: 14px; height: 14px; }
.avo-sheet-name { flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: var(--avo-ink); }
.avo-sheet-name > span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-sheet-tools .avo-sheet-name .avo-ico { flex: none; width: 26px; height: 26px; padding: 5px; border-radius: 8px; background: var(--avo-accent); color: #fff; }
.avo-sheet-tools .avo-btn:disabled { pointer-events: none; }
.avo-sheet-host { position: relative; width: 100%; overflow: hidden; }
.avo-sheet-host iframe { display: block; border: 0; background: #fff; transform-origin: 0 0; }
.avo-sheet-host.is-fit iframe { pointer-events: none; } /* 읽기 전용 : 클릭 안 됨 */
.avo-sheet-host.is-edit { overflow-x: auto; overflow-y: hidden; border-radius: 6px; box-shadow: 0 0 0 1px var(--avo-line); }
.avo-sheet-scroll { flex: 1; overflow: auto; padding: 12px; background: #f3f3f1; -webkit-overflow-scrolling: touch; }
.avo-stage-sheet .avo-sheet-host { margin: 0 auto; max-width: none; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
/* 왼쪽 칸 시트 : 칸 가로를 꽉 채움 (패널 여백 밖으로) */
.avo-pane > .avo-sheet-host { width: calc(100% + 36px); margin: 0 -24px 0 -12px; } /* 왼쪽만 살짝 여백, 오른쪽은 끝까지 */
.avo-sheet-chips { display: flex; flex-wrap: wrap; gap: 5px; margin: -2px 0 10px; }
.avo-sheet-chip { height: 28px; padding: 0 12px; border: 1px solid var(--avo-line); border-radius: 99px; background: #fff; color: var(--avo-ink); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: border-color .15s, background .15s, color .15s; }
.avo-sheet-chip:hover { border-color: var(--avo-accent); color: var(--avo-accent); }
.avo-sheet-chip.is-on { border-color: var(--avo-accent); background: var(--avo-accent); color: #fff; }
.avo-sheet-row .avo-sheet-select { flex: 0 1 220px; }
.avo-sheet-row.is-pv { box-shadow: inset 3px 0 0 var(--avo-accent); }
.avo-sheet-card { position: relative; width: calc(100% + 36px); margin: 0 -24px 0 -12px; border-radius: 10px 0 0 10px; overflow: hidden; box-shadow: 0 6px 22px rgba(0,0,0,.08), 0 0 0 1px var(--avo-line); background: #fff; }
.avo-sheet-card .avo-sheet-host { transition: filter .35s ease, opacity .35s ease; }

/* 스포일러 경고 : 흐리게 가리고 YES 를 눌러야 열림 */
.avo-sheet-card.is-locked { min-height: 340px; }
.avo-sheet-card.is-locked .avo-sheet-host { filter: blur(14px) saturate(.85); opacity: .7; pointer-events: none; -webkit-user-select: none; user-select: none; }
.avo-sheet-card.is-opening .avo-sheet-host { filter: none; opacity: 1; }
.avo-spoiler { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 3; display: flex; align-items: flex-start; justify-content: center; padding: 48px 18px; background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.6)); transition: opacity .25s ease; }
.avo-sheet-card.is-opening .avo-spoiler { opacity: 0; }
.avo-spoiler-card { position: -webkit-sticky; position: sticky; top: 24px; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 290px; padding: 26px 22px 20px; border-radius: 16px; background: rgba(255,255,255,.94); box-shadow: 0 18px 48px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.05); text-align: center; animation: avoPop .35s cubic-bezier(.2,.9,.3,1.2); }
.avo-spoiler-card::before { content: ""; position: absolute; top: 0; left: 22px; right: 22px; height: 3px; border-radius: 0 0 3px 3px; background: var(--avo-accent); }
@keyframes avoPop { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: none; } }
.avo-spoiler-ico { position: relative; display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; margin-bottom: 10px; border-radius: 50%; color: var(--avo-accent); }
.avo-spoiler-ico::before { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; border-radius: 50%; background: var(--avo-accent); opacity: .14; }
.avo-spoiler-ico .avo-ico { position: relative; width: 24px; height: 24px; stroke-width: 2; }
.avo-spoiler-t { font-size: 12px; font-weight: 800; letter-spacing: .32em; text-indent: .32em; color: var(--avo-accent); }
.avo-spoiler-msg { margin: 8px 0 18px; font-size: 14px; line-height: 1.6; color: var(--avo-ink); word-break: keep-all; }
.avo-spoiler-yes { width: 100%; height: 42px; border: 0; border-radius: 99px; background: var(--avo-accent); color: #fff; font: inherit; font-size: 14px; font-weight: 800; letter-spacing: .2em; text-indent: .2em; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.14); transition: filter .15s, transform .15s; }
.avo-spoiler-yes:hover { filter: brightness(1.08); transform: translateY(-1px); }
.avo-spoiler-yes:focus-visible { outline: 3px solid var(--avo-accent); outline-offset: 3px; }

/* 서사 · TRPG 시트 : 추가 / 빼기 */
.avo-opt-fs[data-on="0"] .avo-opt-body, .avo-opt-fs[data-on="1"] .avo-opt-empty { display: none; }
.avo-opt-body, .avo-opt-empty { clear: both; }
.avo-opt-empty { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; }
.avo-opt-empty .avo-help { margin: 0; }
.avo-opt-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.avo-opt-bar .avo-help { margin: 0; }
.avo-opt-bar .avo-ico { width: 13px; height: 13px; }
.avo-opt-off:hover { border-color: #d64545; color: #d64545 !important; }

/* 캐릭터 페이지 탭 표시 체크 */
.avo-tabchk { display: flex; flex-wrap: wrap; gap: 8px; }
.avo-tabchk-item { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 6px; border: 1px solid var(--avo-line); border-radius: 12px; background: #fff; font-size: 13px; cursor: pointer; -webkit-user-select: none; user-select: none; transition: border-color .15s, opacity .15s; }
.avo-tabchk-item:hover { border-color: var(--avo-accent); }
.avo-tabchk-item input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; pointer-events: none; }
.avo-tabchk-ico { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9px; background: var(--avo-soft); color: var(--avo-sub); transition: background .15s, color .15s; }
.avo-tabchk-ico .avo-ico { width: 17px; height: 17px; }
.avo-tabchk-item input:checked + .avo-tabchk-ico { background: var(--avo-accent); color: #fff; }
.avo-tabchk-item input:not(:checked) ~ b { color: var(--avo-sub); text-decoration: line-through; font-weight: 600; }
.avo-tabchk-item input:focus-visible + .avo-tabchk-ico { outline: 2px solid var(--avo-accent); outline-offset: 2px; }
.avo-tabchk-na { display: none; font-size: 11px; color: var(--avo-sub); }
.avo-tabchk-item.is-na { opacity: .6; }
.avo-tabchk-item.is-na .avo-tabchk-na { display: inline; }
.avo-tabchk-help { clear: both; margin: 0 0 10px !important; }

/* (예전) 서사 모드 선택 */
.avo-smode { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed var(--avo-line); }
.avo-sm-panel { display: none; }
.avo-story-fs[data-sm="story"] .avo-sm-panel[data-sm="story"],
.avo-story-fs[data-sm="trpg"] .avo-sm-panel[data-sm="trpg"],
.avo-story-fs[data-sm="none"] .avo-sm-panel[data-sm="none"] { display: block; }
.avo-sheet-preview { margin: 4px 0 12px; padding: 10px; border-radius: 8px; background: var(--avo-soft); }
.avo-sheet-preview .avo-sheet-host { max-width: 560px; border-radius: 4px; box-shadow: 0 0 0 1px var(--avo-line); background: #fff; }
.avo-sheet-preview .avo-sheet-host:empty { height: 60px; }
.avo-sheet-manage { margin-bottom: 10px; padding: 8px 12px; border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; }
.avo-sheet-manage summary { cursor: pointer; font-size: 13px; font-weight: 700; }
.avo-sheet-manage ul { margin: 8px 0 0; padding: 0; list-style: none; }
.avo-sheet-manage li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 0; border-top: 1px solid var(--avo-line); font-size: 13px; }
.avo-sheet-manage li small { color: var(--avo-sub); margin-left: 4px; }
.avo-fs-sheet { padding: 14px; }

/* 이미지 크게 보기 */
.avo-lightbox { z-index: 5000; }
.avo-lightbox .avo-modal-dim { background: rgba(10,10,10,.82); }
.avo-lb-box { position: relative; max-width: 100%; max-height: 100%; display: flex; align-items: center; justify-content: center; }
.avo-lb-box img { display: block; max-width: calc(100vw - 40px); max-height: calc(100vh - 40px); object-fit: contain; border-radius: 4px; box-shadow: 0 10px 40px rgba(0,0,0,.4); cursor: zoom-in; background: #fff; }
.avo-lightbox.is-zoom .avo-lb-box { max-width: none; max-height: none; }
.avo-lightbox.is-zoom { overflow: auto; align-items: flex-start; justify-content: flex-start; }
.avo-lightbox.is-zoom .avo-lb-box img { max-width: none; max-height: none; cursor: zoom-out; }
.avo-lb-msg { display: none; margin: 0; padding: 16px 22px; border-radius: 8px; background: #fff; color: #555; font-size: 14px; }
.avo-lightbox.is-fail .avo-lb-box img { display: none; }
.avo-lightbox.is-fail .avo-lb-msg { display: block; }
.avo-lb-close { position: fixed; top: 14px; right: 14px; z-index: 2; width: 38px; height: 38px; border: 0; border-radius: 50%; background: rgba(255,255,255,.92); color: #333; font-size: 16px; cursor: pointer; }
.avo-pv-content img, .avo-pv-img img, .avo-log-art img { cursor: zoom-in; }

/* 항목별 수정·삭제 픽토그램 */
.avo-item-acts { flex: none; display: flex; gap: 2px; }
.avo-act { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; color: var(--avo-sub) !important; transition: background .15s, color .15s; }
.avo-act .avo-ico { width: 15px; height: 15px; }
.avo-act:hover { background: var(--avo-soft); color: var(--avo-accent) !important; }
.avo-act-del:hover { color: #d64545 !important; background: rgba(214,69,69,.08); }
.avo-rec.is-open { background: var(--avo-soft); box-shadow: inset 3px 0 0 var(--avo-accent); }
.avo-wd-cell { position: relative; min-width: 0; }
.avo-wd-acts { position: absolute; top: 2px; right: 2px; z-index: 2; flex-direction: column; gap: 2px; opacity: 0; transition: opacity .15s; pointer-events: none; }
.avo-wd-acts .avo-act { pointer-events: auto; }
.avo-wd-cell:hover .avo-wd-acts, .avo-wd-acts:focus-within { opacity: 1; }
.avo-wd-acts .avo-act { width: 17px; height: 17px; background: rgba(255,255,255,.92); box-shadow: 0 1px 3px rgba(0,0,0,.15); }
.avo-wd-acts .avo-act .avo-ico { width: 10px; height: 10px; }
@media (hover: none) { .avo-wd-acts { opacity: 1; } }
.avo-wd-empty { margin: 0; font-size: 11px; color: var(--avo-sub); }
.avo-rec-preview { padding: 10px; border: 1px solid var(--avo-line); background: #fff; }

/* 관계캐 */
.avo-cv-rels { flex: none; padding: 12px 24px 16px; border-top: 1px solid var(--avo-line); }
.avo-cv-rels ul { display: flex; gap: 10px; margin: 0; padding: 4px 2px 2px; list-style: none; overflow-x: auto; }
.avo-rel { display: flex; flex-direction: column; align-items: center; width: 58px; text-align: center; }
.avo-rel-img { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; overflow: hidden; border-radius: 50%; background: var(--avo-soft); box-shadow: 0 0 0 2px #fff, 0 0 0 3px var(--lb, var(--avo-line)); font-weight: 700; color: var(--avo-sub); transition: transform .15s; }
.avo-rel-img img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
a.avo-rel:hover .avo-rel-img { transform: translateY(-2px); }
.avo-rel-name { margin-top: 6px; width: 100%; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-rel-label { width: 100%; font-size: 10px; color: var(--avo-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 픽토그램 탭 */
.avo-cv-tabs { position: relative; z-index: 5; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 0; background: var(--avo-panel); border-left: 1px solid var(--avo-line); border-right: 1px solid var(--avo-line); }
.avo-tab { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 12px; background: transparent; color: var(--avo-sub); font: inherit; cursor: pointer; transition: background .15s, color .15s; }
.avo-tab .avo-ico { width: 22px; height: 22px; }
.avo-tab:hover, .avo-tab:focus-visible { color: var(--avo-accent); background: var(--avo-soft); outline: none; }
.avo-tab.is-on { background: var(--avo-accent); color: #fff; }
.avo-tab-label { position: absolute; top: 50%; left: 100%; margin-left: 10px; padding: 4px 10px; border-radius: 6px; background: var(--avo-accent); color: #fff; font-size: 12px; font-weight: 700; white-space: nowrap; pointer-events: none; opacity: 0; transform: translate(-6px, -50%); transition: opacity .15s, transform .15s; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.avo-tab-label::before { content: ""; position: absolute; top: 50%; right: 100%; margin-top: -5px; border: 5px solid transparent; border-right-color: var(--avo-accent); }
.avo-tab:hover .avo-tab-label, .avo-tab:focus-visible .avo-tab-label { opacity: 1; transform: translate(0, -50%); }
.avo-cv.no-tabs .avo-cv-tabs { visibility: hidden; } /* 보이는 탭이 하나도 없을 때 */
.avo-tab-badge { position: absolute; top: 3px; right: 2px; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 99px; background: var(--avo-ink); color: #fff; font-style: normal; font-size: 9px; line-height: 15px; text-align: center; }

/* 가운데 인물 */
.avo-cv-stage { position: relative; display: flex; align-items: flex-end; justify-content: center; min-width: 0; min-height: 0; padding: 24px 16px 0; }
#avoStageImg { max-width: 100%; max-height: 100%; object-fit: contain; object-position: bottom center; transition: opacity .16s; filter: drop-shadow(0 6px 14px rgba(0,0,0,.12)); }
#avoStageImg.is-fade { opacity: 0; }
.avo-stage-ph { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--avo-sub); font-size: 13px; border: 2px dashed var(--avo-line); border-radius: 10px; }
.avo-cv-stage .avo-stage-ph { align-self: stretch; height: auto; margin-bottom: 24px; background: var(--avo-panel); }
.avo-stage-frame { position: absolute; top: 12px; right: 12px; bottom: 12px; left: 12px; z-index: 4; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; background: #fff; box-shadow: 0 10px 40px rgba(0,0,0,.18); animation: avoFade .25s ease; }
.avo-sf-bar { flex: none; display: flex; align-items: center; gap: 6px; padding: 8px 10px 8px 16px; border-bottom: 3px solid var(--avo-accent); }
.avo-sf-title { flex: 1; min-width: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-sf-bar .avo-ico { width: 14px; height: 14px; }
.avo-stage-frame iframe { flex: 1; width: 100%; border: 0; background: #fff; }
.avo-sf-tip { flex: none; margin: 0; padding: 5px 12px; font-size: 11px; color: var(--avo-sub); background: var(--avo-soft); }
.avo-cv-stage.is-frame .avo-stage-tools { display: none; }
.avo-stage-tools { position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; gap: 6px; }
.avo-icobtn { display: inline-flex; align-items: center; gap: 0; height: 34px; padding: 0 8px; border-radius: 99px; background: rgba(255,255,255,.85); color: var(--avo-sub) !important; box-shadow: 0 1px 4px rgba(0,0,0,.1); font-size: 12px; font-weight: 700; transition: color .15s, gap .15s; }
.avo-icobtn .avo-ico { width: 17px; height: 17px; }
.avo-icobtn span { max-width: 0; overflow: hidden; white-space: nowrap; transition: max-width .2s; }
.avo-icobtn:hover { color: var(--avo-accent) !important; gap: 4px; }
.avo-icobtn:hover span { max-width: 90px; }

/* 오른쪽 */
.avo-cv-right { display: flex; flex-direction: column; gap: 18px; padding: 18px 14px; background: var(--avo-panel); border-left: 1px solid var(--avo-line); overflow-y: auto; min-height: 0; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.avo-mini-edit { display: inline-flex; align-items: center; gap: 2px; margin-left: auto; padding: 2px 7px; border: 1px solid var(--avo-line); border-radius: 99px; font-size: 11px; letter-spacing: 0; color: var(--avo-sub) !important; transition: .15s; }
.avo-mini-edit .avo-ico { width: 12px; height: 12px; }
.avo-mini-edit:hover { border-color: var(--avo-accent); color: var(--avo-accent) !important; }
.avo-wd { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.avo-wd-item { position: relative; display: block; width: 100%; height: 0; padding: 100% 0 0; overflow: hidden; border: 1px solid var(--avo-line); border-radius: 6px; background: var(--avo-soft); cursor: pointer; }
.avo-wd-item img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.avo-wd-item span { position: absolute; left: 0; right: 0; bottom: 0; padding: 1px 2px; background: rgba(0,0,0,.55); color: #fff; font-size: 9px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: .15s; }
.avo-wd-item:hover span, .avo-wd-item.is-on span { opacity: 1; }
.avo-wd-item.is-on { border-color: var(--avo-accent); box-shadow: 0 0 0 2px var(--avo-accent); }
.avo-wd-item.is-au::before { content: "AU"; position: absolute; top: 2px; left: 2px; z-index: 1; padding: 0 3px; border-radius: 3px; background: var(--avo-accent); color: #fff; font-size: 8px; font-weight: 800; line-height: 1.4; }
.avo-sd { position: -webkit-sticky; position: sticky; top: 0; z-index: 2; flex: none; align-self: center; width: 120px; height: 120px; overflow: hidden; border-radius: 50%; background: #fff; box-shadow: 0 0 0 3px var(--avo-accent), 0 4px 14px rgba(0,0,0,.08); }
.avo-sd img { width: 100%; height: 100%; object-fit: contain; }
.avo-bgm { position: relative; display: flex; align-items: center; gap: 8px; margin-top: auto; padding: 8px; border-radius: 10px; background: var(--avo-soft); }
.avo-bgm-btn { flex: none; width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--avo-accent); color: #fff; font-size: 11px; cursor: pointer; }
.avo-bgm-txt { min-width: 0; line-height: 1.3; }
.avo-bgm-txt small { display: block; font-size: 9px; font-weight: 800; letter-spacing: .1em; color: var(--avo-accent); }
.avo-bgm-txt span { display: block; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.avo-bgm.is-playing .avo-bgm-btn { animation: avoPulse 1.6s infinite; }
@keyframes avoPulse { 50% { box-shadow: 0 0 0 6px rgba(0,0,0,.06); } }
.avo-bgm-holder { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
.avo-bgm-holder iframe { width: 200px; height: 120px; border: 0; }

/* =========================================================
   팝업 공통 / 커미션 자료
   ========================================================= */
.avo-modal { display: none; position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 87; align-items: center; justify-content: center; padding: 20px; color: #2b2b2b; font-size: 14px; line-height: 1.6; }
.avo-modal.is-open { display: flex; }
.avo-modal-dim { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: rgba(20,20,20,.55); }
.avo-sheet-wrap { position: relative; width: 100%; max-width: 840px; max-height: calc(100vh - 40px); overflow-y: auto; border-radius: 12px; background: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: avoFade .25s ease; }
.avo-sheet-tools { position: -webkit-sticky; position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 6px; padding: 10px 12px; background: rgba(255,255,255,.96); border-bottom: 1px solid var(--avo-line); }
.avo-sheet { padding: 26px 28px 28px; background: #fff; }
.avo-sheet-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; padding-bottom: 12px; margin-bottom: 18px; border-bottom: 3px solid var(--avo-accent); }
.avo-sheet-head strong { font-size: 24px; font-weight: 800; }
.avo-sheet-head span { color: var(--avo-sub); }
.avo-sheet-head em { margin-left: auto; font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .15em; color: var(--avo-accent); text-transform: uppercase; }
.avo-sheet-main { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
.avo-sheet-full, .avo-sheet-head-img { position: relative; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; border-radius: 10px; background: #f5f5f3; }
.avo-sheet-full { height: 440px; padding: 10px 10px 26px; }
.avo-sheet-full img { max-height: 100%; object-fit: contain; }
.avo-sheet-head-img { flex: none; width: 150px; height: 150px; padding-bottom: 22px; align-items: center; }
.avo-sheet-head-img img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.avo-sheet-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 3px; background: var(--avo-accent); color: #fff; font-size: 11px; font-weight: 700; text-align: center; }
.avo-sheet-top { display: flex; gap: 16px; margin-bottom: 18px; }
.avo-sheet-colors { flex: 1; min-width: 0; }
.avo-sheet h4 { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: .08em; color: var(--avo-accent); }
.avo-sw { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.avo-sw i { flex: none; width: 30px; height: 30px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); }
.avo-sw span { line-height: 1.25; min-width: 0; }
.avo-sw b { display: block; font-size: 12px; }
.avo-sw code { font-size: 11px; color: var(--avo-sub); font-family: monospace; }
.avo-sheet-feat { display: grid; grid-template-columns: 90px 1fr; margin: 0; border-top: 1px solid var(--avo-line); }
.avo-sheet-feat dt, .avo-sheet-feat dd { margin: 0; padding: 10px 0; border-bottom: 1px solid var(--avo-line); }
.avo-sheet-feat dt { font-size: 12px; font-weight: 700; color: var(--avo-accent); }
.avo-sheet-extra { margin-top: 24px; padding-top: 18px; border-top: 1px dashed var(--avo-line); }
.avo-sheet-note { margin-bottom: 12px; }
.avo-sheet-imgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
.avo-sheet-imgs figure { margin: 0; border-radius: 8px; overflow: hidden; background: #f5f5f3; }
.avo-sheet-imgs img { display: block; width: 100%; }
.avo-sheet-imgs figcaption { padding: 5px 8px; font-size: 12px; color: #555; }
.avo-sheet-blank { display: flex; align-items: center; justify-content: center; min-height: 90px; border: 2px dashed var(--avo-line); border-radius: 10px; color: var(--avo-sub); font-size: 12px; }

/* 편집창 (iframe) */
.avo-frame-modal { z-index: 88; }
.avo-frame-box { position: relative; width: 100%; max-width: 960px; height: calc(100vh - 40px); border-radius: 12px; overflow: hidden; background: #f4f3ef; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.avo-frame-box iframe { display: block; width: 100%; height: 100%; border: 0; opacity: 0; transition: opacity .2s; }
.avo-frame-modal.is-ready iframe { opacity: 1; }
.avo-frame-modal.is-ready .avo-frame-loading { display: none; }
.avo-frame-loading { position: absolute; top: 50%; left: 0; right: 0; text-align: center; color: var(--avo-sub); font-size: 13px; }
.avo-write.is-frame { padding: 22px 24px 4px; }

/* 이미지 자르기 편집기 */
.avo-crop-modal { z-index: 89; padding: 10px; }
/* 버튼 영역은 항상 보이고, 남는 높이만 이미지 영역이 차지 */
.avo-crop-box { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 900px; height: 100%; max-height: 760px; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
.avo-crop-head, .avo-crop-ctrl, .avo-crop-btns { flex: none; }
.avo-crop-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--avo-line); }
.avo-crop-size { font-size: 12px; color: var(--avo-sub); font-family: monospace; white-space: nowrap; }
.avo-crop-stage { position: relative; flex: 1 1 auto; min-height: 120px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #2a2a2a; -webkit-user-select: none; user-select: none; touch-action: none; }
.avo-crop-view { position: relative; display: none; flex: none; }
.avo-crop-cv { display: block; width: 100%; height: 100%; }
.avo-crop-rect { position: absolute; box-shadow: 0 0 0 9999px rgba(0,0,0,.5); outline: 1px solid rgba(255,255,255,.9); cursor: move; background-image: linear-gradient(rgba(255,255,255,.35), rgba(255,255,255,.35)), linear-gradient(rgba(255,255,255,.35), rgba(255,255,255,.35)), linear-gradient(90deg, rgba(255,255,255,.35), rgba(255,255,255,.35)), linear-gradient(90deg, rgba(255,255,255,.35), rgba(255,255,255,.35)); background-size: 100% 1px, 100% 1px, 1px 100%, 1px 100%; background-position: 0 33.33%, 0 66.66%, 33.33% 0, 66.66% 0; background-repeat: no-repeat; }
.avo-crop-rect i { position: absolute; width: 18px; height: 18px; border: 3px solid #fff; }
.avo-crop-rect i[data-h="-1,-1"] { top: -3px; left: -3px; border-right: 0; border-bottom: 0; cursor: nwse-resize; }
.avo-crop-rect i[data-h="1,-1"] { top: -3px; right: -3px; border-left: 0; border-bottom: 0; cursor: nesw-resize; }
.avo-crop-rect i[data-h="-1,1"] { bottom: -3px; left: -3px; border-right: 0; border-top: 0; cursor: nesw-resize; }
.avo-crop-rect i[data-h="1,1"] { bottom: -3px; right: -3px; border-left: 0; border-top: 0; cursor: nwse-resize; }
.avo-crop-rect i::after { content: ""; position: absolute; top: -12px; right: -12px; bottom: -12px; left: -12px; } /* 손가락으로 잡기 쉽게 */
.avo-crop-msg { margin: 0; color: #bbb; font-size: 13px; }
.avo-crop-ctrl { padding: 10px 16px 0; }
.avo-crop-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; margin-bottom: 8px; }
.avo-crop-row .avo-lbl { margin: 0 6px 0 0; min-width: 64px; }
.avo-crop-btns { display: flex; gap: 6px; padding: 10px 16px 14px; border-top: 1px solid var(--avo-line); }

/* =========================================================
   일반 게시글 보기 / 댓글
   ========================================================= */
.avo-post-view { padding: 24px; border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); }
.avo-pv-head { padding-bottom: 16px; margin-bottom: 20px; border-bottom: 1px solid var(--avo-line); }
.avo-pv-char { display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px 3px 3px; border-radius: 99px; background: var(--avo-soft); box-shadow: inset 0 0 0 1px var(--lb); font-size: 12px; font-weight: 700; }
.avo-pv-char img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; object-position: center top; }
.avo-pv-title { margin: 10px 0 6px; font-size: 22px; font-weight: 800; line-height: 1.35; word-break: break-all; }
.avo-pv-meta { display: flex; flex-wrap: wrap; gap: 12px; margin: 0; font-size: 12px; color: var(--avo-sub); }
.avo-pv-img { margin-bottom: 14px; text-align: center; }
.avo-pv-img img, .avo-pv-content img { height: auto; }
.avo-pv-content { min-height: 120px; line-height: 1.85; word-break: break-all; }
.avo-pv-files { margin: 20px 0 0; padding: 12px 14px; list-style: none; border-radius: 8px; background: var(--avo-soft); font-size: 13px; }
.avo-pv-files small { color: var(--avo-sub); }
.avo-pv-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--avo-line); }

.avo-cmts { margin-top: 14px; padding: 20px 24px; border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); }
.avo-cmt-item { padding: 12px 0; border-bottom: 1px solid var(--avo-line); }
.avo-cmt-item header { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
.avo-cmt-item time { font-size: 11px; color: var(--avo-sub); }
.avo-cmt-body { margin: 4px 0; word-break: break-all; }
.avo-cmt-act { display: flex; gap: 10px; font-size: 12px; color: var(--avo-sub); }
.avo-cmt-act a:hover { color: var(--avo-accent); }
#avo-cmt-w { margin-top: 14px; }
#avo-cmt-w .avo-grid2 { margin-bottom: 6px; }
.avo-cmt-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.avo-cmt-item #fviewcomment { margin-top: 10px; }

/* =========================================================
   상세2 : 글쓰기 / 편집
   ========================================================= */
.avo-write { max-width: 920px; }
.avo-w-title { margin: 0 0 14px; font-size: 20px; font-weight: 800; }
.avo-w-title small { margin-left: 6px; font-size: 14px; font-weight: 600; color: var(--avo-sub); }
.avo-w-note { margin: -4px 0 14px; padding: 10px 14px; border-radius: 8px; background: var(--avo-soft); font-size: 13px; color: #666; }
.avo-fs { margin: 0 0 14px; padding: 18px 20px; border: 1px solid var(--avo-line); border-radius: var(--avo-radius); background: var(--avo-panel); min-width: 0; }
.avo-fs legend { float: left; width: 100%; margin: 0 0 12px; padding: 0; font-size: 15px; font-weight: 800; }
/* 그누보드 기본 CSS 가 legend 를 숨기는 것(font-size:0 등)을 되돌림 → 칸 제목이 보이게 */
.avo-wrap .avo-fs legend { position: static; height: auto; overflow: visible; font-size: 15px; line-height: 1.4; text-indent: 0; color: var(--avo-ink); }
.avo-fs legend small, .avo-lbl small { font-weight: 400; font-size: 12px; color: var(--avo-sub); margin-left: 4px; }
.avo-fs legend + * { clear: both; }
.avo-f { display: block; margin-bottom: 12px; min-width: 0; }
.avo-lbl { display: block; margin-bottom: 4px; font-size: 13px; font-weight: 700; }
.avo-help { margin: 4px 0 0; font-size: 12px; color: var(--avo-sub); }
.avo-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.avo-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 14px; }
.avo-radios { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; }
.avo-radio, .avo-check { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer; }
.avo-radio i { width: 12px; height: 12px; border-radius: 3px; }
.avo-radio small { color: var(--avo-sub); }
.avo-opts { display: flex; gap: 14px; margin: -4px 0 12px; }
.avo-color-pair { display: flex; gap: 6px; align-items: center; }
.avo-color-pick { flex: none; width: 40px; height: 36px; padding: 2px; border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; cursor: pointer; }
.avo-site-color { display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 11px; color: var(--avo-sub); }
.avo-site-color i { flex: none; width: 11px; height: 11px; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); }
.avo-color-hex { width: 110px; flex: 1; font-family: monospace; }
.avo-story-in { min-height: 240px; }
.avo-file-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 6px; }
.avo-file-row .avo-in { flex: 1 1 200px; height: auto; padding: 6px 8px; }
.avo-editor textarea { width: 100%; min-height: 300px; }

.avo-imgf { display: flex; gap: 10px; margin-bottom: 12px; min-width: 0; }
.avo-imgf-prev { flex: none; display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; overflow: hidden; border-radius: 8px; background-color: #f2f2f0; background-image: linear-gradient(45deg, rgba(0,0,0,.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.05) 75%), linear-gradient(45deg, rgba(0,0,0,.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.05) 75%); background-size: 12px 12px; background-position: 0 0, 6px 6px; box-shadow: inset 0 0 0 1px var(--avo-line); }
.avo-imgf-prev img { width: 100%; height: 100%; object-fit: contain; }
.avo-imgf-note { font-size: 22px; color: var(--avo-accent); }
.avo-imgf-body { flex: 1; min-width: 0; }
.avo-imgf-row { display: flex; gap: 6px; }
.avo-imgf-row .avo-btn { flex: none; }
.avo-imgf-file { display: block; width: 100%; margin-top: 6px; font-size: 12px; }
.avo-imgf-info { display: block; font-size: 11px; color: var(--avo-accent); font-weight: 600; }
.avo-imgf-info:empty { display: none; }

/* 텍스트 에디터 */
.avo-rte { border: 1px solid var(--avo-line); border-radius: 8px; background: #fff; overflow: hidden; }
.avo-rte:focus-within { border-color: var(--avo-accent); box-shadow: 0 0 0 3px rgba(111,154,76,.15); }
.avo-rte-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 5px 6px; border-bottom: 1px solid var(--avo-line); background: #fafaf8; }
.avo-rte-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 5px; border: 0; border-radius: 6px; background: transparent; color: #444; font: inherit; font-size: 13px; line-height: 1; cursor: pointer; }
.avo-rte-btn:hover { background: var(--avo-soft); color: var(--avo-accent); }
.avo-rte-btn.is-on { background: var(--avo-accent); color: #fff; }
.avo-rte-btn small { font-size: 10px; } .avo-rte-btn big { font-size: 16px; }
.avo-rte-btn input[type=color] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 0; border: 0; opacity: 0; cursor: pointer; }
.avo-rte-color { font-weight: 800; border-bottom: 3px solid #c76b8f; line-height: 1.1; }
.avo-rte-sep { width: 1px; height: 16px; margin: 0 3px; background: var(--avo-line); }
.avo-rte-area { min-height: 140px; max-height: 420px; overflow-y: auto; padding: 10px 12px; line-height: 1.7; font-size: 14px; outline: none; word-break: break-all; }
.avo-rte-area:empty::before { content: attr(data-ph); color: #aaa; }
.avo-rte-area hr, .avo-prof-intro hr { border: 0; border-top: 1px solid var(--avo-line); margin: 10px 0; }
.avo-rte-area ul, .avo-prof-intro ul { margin: 4px 0; padding-left: 20px; }

/* 썸네일 위치 · 크기 */
.avo-tpos { margin-bottom: 12px; }
.avo-tpos-wrap { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
.avo-tpos-box { position: relative; flex: none; width: 132px; height: 132px; overflow: hidden; border-radius: 8px; background: var(--avo-soft); box-shadow: inset 0 0 0 1px var(--avo-line), 0 0 0 2px var(--avo-accent); cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.avo-tpos-box.is-drag { cursor: grabbing; }
.avo-tpos-box img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.avo-tpos-empty { position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; align-items: center; justify-content: center; padding: 10px; text-align: center; font-size: 11px; color: var(--avo-sub); }
.avo-tpos-ctrl { flex: 1; min-width: 180px; }
.avo-tpos-zoom { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
.avo-tpos-zoom input { flex: 1; accent-color: var(--avo-accent); }
.avo-tpos-zoom input:focus:not(:focus-visible) { outline: none; }
.avo-tpos-ctrl .avo-help { margin: 6px 0 8px; }

.avo-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.avo-rows:empty { display: none; }
.avo-row { padding: 12px; border: 1px solid var(--avo-line); border-radius: 8px; background: rgba(255,255,255,.7); }
.avo-row-head { display: flex; gap: 6px; margin-bottom: 10px; }
.avo-row-head .avo-in { flex: 1; min-width: 0; }
.avo-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
.avo-row .avo-imgf { margin-bottom: 0; }
.avo-row-inline { display: flex; gap: 6px; align-items: center; padding: 8px; }
.avo-row-inline > .avo-in { flex: 1; }
.avo-row-inline .avo-color-pair { flex: 0 0 auto; }
.avo-row-inline .avo-color-hex { flex: none; width: 96px; }
.avo-btn-add { border-style: dashed; }
.avo-w-btns { display: flex; justify-content: center; gap: 8px; margin: 20px 0; }
.avo-w-btns .avo-btn { min-width: 110px; height: 42px; font-size: 15px; }
.avo-write.is-frame .avo-w-btns { position: -webkit-sticky; position: sticky; bottom: 0; margin: 0 -24px; padding: 12px; background: rgba(244,243,239,.95); border-top: 1px solid var(--avo-line); }

/* =========================================================
   반응형
   ========================================================= */
@media (max-width: 1100px) {
    .avo-cv-inner { grid-template-columns: 280px 56px minmax(0, 1fr) 130px; }
    .avo-sd { width: 90px; height: 90px; }
}
@media (max-width: 760px) {
    .avo-wrap { padding: 12px; }
    .avo-chars { padding: 14px 10px; }
    .avo-slider { gap: 4px; }
    .avo-arrow { width: 28px; height: 28px; }
    .avo-grid { gap: 8px; }
    .avo-card-name { font-size: 12px; }
    .avo-card-aff { font-size: 11px; }
    .avo-ribbon { font-size: 10px; padding: 2px 6px; }
    .avo-post-head { display: none; }
    .avo-post { grid-template-columns: 1fr auto; grid-template-areas: "char date" "subj subj"; padding: 8px 12px; }
    .avo-post .avo-col-char { grid-area: char; border: 0; padding: 0; }
    .avo-post .avo-col-subj { grid-area: subj; padding: 2px 0 0; }
    .avo-post .avo-col-date { grid-area: date; }

    /* 캐릭터 페이지 : 세로로 쌓고 전체 스크롤 */
    .avo-cv.is-full { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .avo-cv.is-fit { height: auto; }
    .avo-cv-inner, .avo-cv.is-full .avo-cv-inner { display: flex; flex-direction: column; height: auto; min-height: 100%; }
    .avo-cv-left { display: contents; }
    .avo-cv-top { order: 0; padding: 10px 14px; background: var(--avo-panel); }
    .avo-cv-stage { order: 1; height: 62vh; min-height: 340px; padding-top: 10px; }
    .avo-cv-basic { order: 2; background: var(--avo-panel); }
    .avo-cv-tabs { order: 3; position: -webkit-sticky; position: sticky; top: 0; flex-direction: row; justify-content: space-around; padding: 6px 8px; border: 0; border-top: 1px solid var(--avo-line); border-bottom: 1px solid var(--avo-line); background: rgba(255,255,255,.95); }
    .avo-tab { flex: 1; flex-direction: column; width: auto; height: 50px; gap: 1px; }
    .avo-tab-label { position: static; margin: 0; padding: 0; background: none; color: inherit; font-size: 10px; opacity: 1; transform: none; box-shadow: none; }
    .avo-tab-label::before { display: none; }
    .avo-tab:hover .avo-tab-label { transform: none; }
    .avo-tab-badge { right: 18%; }
    .avo-cv-panel { order: 4; min-height: 40vh; background: var(--avo-panel); }
    .avo-cv-rels { order: 5; background: var(--avo-panel); }
    .avo-cv-right { order: 6; flex-direction: row; flex-wrap: wrap; align-items: center; border-left: 0; border-top: 1px solid var(--avo-line); overflow: visible; }
    .avo-wd-group { width: 100%; }
    .avo-wd { grid-template-columns: repeat(6, 1fr); }
    .avo-sd { width: 72px; height: 72px; }
    .avo-bgm { flex: 1; margin-top: 0; }
    .avo-icobtn span { display: none; }
    .avo-cv-stage.is-frame { height: 80vh; }
    .avo-stage-frame { top: 6px; right: 6px; bottom: 6px; left: 6px; }
    .avo-log-bar { margin: 16px -24px -18px; }
    .avo-cv-right .avo-sd { position: static; order: -1; }

    .avo-modal { padding: 10px; }
    .avo-sheet { padding: 18px 16px; }
    .avo-sheet-main { grid-template-columns: 1fr; }
    .avo-sheet-full { height: 380px; }
    .avo-sheet-head-img { width: 110px; height: 110px; }
    .avo-sheet-feat { grid-template-columns: 76px 1fr; }
    .avo-crop-head b { font-size: 13px; }
    .avo-crop-row .avo-lbl { min-width: 0; }
    .avo-crop-btns .avo-btn { padding: 0 10px; }

    .avo-grid2, .avo-grid3, .avo-row-grid { grid-template-columns: 1fr; }
    .avo-fs { padding: 14px; }
    .avo-row-inline { flex-wrap: wrap; }
    .avo-write.is-frame { padding: 14px 12px 4px; }
    .avo-write.is-frame .avo-w-btns { margin: 0 -12px; }
}
@media (prefers-reduced-motion: reduce) {
    .avo-wrap *, .avo-modal * { animation: none !important; transition: none !important; }
}

/* =========================================================
   O.home 이식판 추가분
   ========================================================= */
.avo-wrap, .avo-modal { --avo-accent: var(--avo-site, #6f9a4c); }
/* 목록·글 화면은 O.home 패널 색 (어두운 홈 배경 위에서도 또렷하게) · 캐릭터 페이지는 원본대로 반투명 */
.avo-page > .avo-wrap:not(.avo-cv) { --avo-panel: var(--panel, rgba(252,252,253,.94)); }
.avo-wrap .k-input, .avo-modal .k-input, .avo-wrap .k-textarea, .avo-modal .k-textarea { width: 100%; }
.avo-wrap .k-textarea, .avo-modal .k-textarea { min-height: 72px; }
.avo-cv { color: var(--avo-ink); font-size: 14px; line-height: 1.6; }
.avo-cv.is-fit { position: relative; border-radius: var(--avo-radius); overflow: hidden; background-color: var(--avo-site-bg, #f3f2ee); }
.avo-stage-img { max-width: 100%; max-height: 100%; object-fit: contain; object-position: bottom center; transition: opacity .16s; filter: drop-shadow(0 6px 14px rgba(0,0,0,.12)); }
.avo-stage-img.is-fade { opacity: 0; }
.avo-card { cursor: pointer; }
.avo-card-thumb img { object-position: var(--tp, center top); }
.avo-wd-item img { object-position: var(--tp, center top); transform: scale(var(--tz, 1)); transform-origin: var(--tp, center top); }
.avo-post .avo-col-subj { cursor: pointer; }
.avo-tag { cursor: pointer; border: 0; background: none; padding: 0; font: inherit; color: inherit; }
.avo-chip:focus-visible, .avo-btn:focus-visible { outline: 2px solid var(--avo-accent); outline-offset: 2px; }
.avo-search { flex: 1 1 140px; min-width: 0; }
.avo-filter .k-sel { flex: 0 1 190px; }
.avo-head-desc { margin: 4px 0 0; font-size: 12px; color: var(--page-desc, #9aa0a9); }

/* 팝업 편집창 (원본의 iframe 편집창 대신 같은 화면 안의 창) */
.avo-form-box { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 960px; max-height: calc(100vh - 40px); border-radius: 12px; overflow: hidden; background: #f4f3ef; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: avoFade .25s ease; }
.avo-form-box.is-s { max-width: 560px; }
.avo-form-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 22px 24px 4px; }
.avo-form-box .avo-w-btns { flex: none; margin: 0; padding: 12px; background: rgba(244,243,239,.96); border-top: 1px solid var(--avo-line); }
.avo-form-box .avo-w-title { margin-bottom: 14px; }
.avo-modal .avo-fs { color: var(--avo-ink); }
.avo-err { margin: 0 0 12px; padding: 10px 14px; border-radius: 8px; background: rgba(214,69,69,.1); color: #b03030; font-size: 13px; }
.avo-check-row { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 12px; }
.avo-imgf-url { display: flex; gap: 6px; }
.avo-imgf-url .k-input { flex: 1; min-width: 0; }
.avo-imgf-prev img { cursor: zoom-in; }
.avo-lbm-list li .avo-lbm-name { flex: 1 1 auto; min-width: 0; }
.avo-lbm-del { flex: none; }
.avo-set-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
.avo-radios .k-radio { margin-right: 4px; }
.avo-rte-area[contenteditable] { color: var(--avo-ink); background: #fff; }

/* 게시글 / 댓글 */
.avo-post-view { color: var(--avo-ink); }
.avo-pv-char { cursor: pointer; border: 0; }
.avo-cmts { color: var(--avo-ink); }
.avo-cmt-item header b { font-weight: 700; }
.avo-cmt-act button { border: 0; background: none; padding: 0; color: inherit; font: inherit; cursor: pointer; }
.avo-cmt-act button:hover { color: #d64545; }
.avo-cmt-form { display: flex; gap: 8px; align-items: flex-end; margin-top: 14px; }
.avo-cmt-form .k-textarea { flex: 1; }
.avo-log-art .avo-pv-content img { max-width: 100%; }

/* 시트 편집창 */
.avo-sheet-edit-box { max-width: 1000px; }
.avo-sheet-edit-box .avo-form-scroll { background: #f3f3f1; padding: 14px; }
.avo-sheet-edit-box .avo-sheet-host.is-edit { margin: 0 auto; background: #fff; }
.avo-sheet-msg { margin: 0 0 8px; font-size: 12px; color: var(--avo-sub); }
.avo-sheet-lib li { gap: 6px; }

/* 이미지 자르기 편집기 (캔버스) */
.avo-crop-modal.is-open { display: flex; }
.avo-crop-stage canvas { max-width: 100%; max-height: 100%; }

/* 썸네일 위치 */
.avo-tpos-box img { object-position: var(--tp, center top); transform: scale(var(--tz, 1)); transform-origin: var(--tp, center top); }

@media (max-width: 760px) {
  .avo-form-scroll { padding: 14px 12px 4px; }
  .avo-set-grid { grid-template-columns: 1fr; }
}
`;
