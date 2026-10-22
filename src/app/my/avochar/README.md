# 아보카도 캐릭터 게시판 — O.home 이식판

아보카도 에디션용 캐릭터 게시판 스킨(avocado_char v1.9.2)을 O.home에서 쓸 수 있게 옮긴 것입니다.
**원본 O.home 파일은 하나도 고치지 않았고, 새 파일만 추가합니다.** 그래서 [Sync fork]로 업데이트해도 충돌이 나지 않습니다.

## 넣는 파일

```
src/app/my/avochar/          ← 게시판 화면 (page.tsx + _avo 폴더)
public/my/avochar/sheets/    ← TRPG 시트 9종 + 시트 SDK
```

## 설치

1. 내 O.home 저장소(GitHub)에서 **Add file › Upload files**
2. 압축을 푼 `src` 폴더와 `public` 폴더를 **통째로** 끌어다 놓기 → **Commit changes**
   (폴더 구조가 그대로 올라가야 해요: `src/app/my/avochar/page.tsx` 가 생겨야 정상)
3. Vercel이 1~2분 안에 다시 배포
4. 홈 **환경설정 › 메뉴 관리 › 커스텀 링크**에 이름(예: 캐릭터)과 주소 `/my/avochar` 를 추가하고,
   미배치에 생긴 항목을 원하는 메뉴에 넣은 뒤 저장

## 데이터는 어디에?

새 테이블을 만들지 않고 O.home의 `comments` 저장 공간을 빌려 씁니다(종류 표시 `target: "avochar"`).
O.home의 다른 화면은 댓글을 종류로 걸러 읽기 때문에 섞이지 않고, **백업 · 복원 · DB 이전에 자동으로 포함**됩니다.
Supabase SQL이나 Firebase 규칙을 다시 실행할 필요도 없습니다.

## 공개범위

- **비밀글**은 서버 권한(`visibility: private`)으로 저장돼요. 작성자와 관리자 말고는 서버에서 내려받을 수 없습니다.
- **게시판 설정 › 공개범위**를 「회원만」 「관리자만」으로 바꾸면 캐릭터·글 전체가 서버에서 막혀요.
  바꾼 뒤 나오는 「이미 저장된 것에도 적용」을 눌러 주세요.
- 메뉴 관리에서 메뉴를 숨기는 것은 화면만 가리는 것이라, 정말 숨겨야 하면 위의 공개범위를 쓰세요.

## 원본과 다른 점

- 캐릭터 등록·수정은 관리자만 (원본 기본값과 같음). 게시글 작성 권한은 설정에서 「관리자만 / 로그인한 회원」
- 편집창은 원본처럼 캐릭터 페이지 위 팝업으로 열리지만 iframe 대신 같은 화면 안의 창입니다
- 게시글 답글(답변 글) · 첨부파일 칸은 없습니다 (본문 에디터에서 이미지 넣기 가능)
- BGM은 YouTube 또는 mp3 **주소**만 (파일 업로드 없음)
- 홈페이지 기본 컬러 = O.home 테마의 강조색 (게시판 설정에서 따로 지정 가능)
- 시트 SDK 수정 1곳: 시트 편집 화면에서 「범위」 조절 버튼·안내가 처음부터 다 보이던 원본 버그 수정
- 새 시트는 **게시판 설정 › 업로드한 TRPG 시트** 또는 캐릭터 수정 › TRPG 시트 › 「커스텀 시트 업로드」로 올려요
  (`sheets` 폴더에 파일만 넣어서는 목록에 뜨지 않아요 — 기본 9종 목록은 `_avo/lib.ts` 의 BUILTIN_SHEETS)
- 기존 아보카도 데이터 이전 기능은 아직 없습니다

## 업데이트할 때 주의

원본 O.home이 내부 부품(`@/lib/postStore`, `@/components/ui/Kit` 등)의 이름을 바꾸면 이 게시판의 빌드가 실패할 수 있어요.
그때도 Vercel은 **이전 배포를 그대로 유지**하므로 홈이 꺼지지는 않습니다. [Sync fork] 뒤 Vercel의 배포 결과(Ready/Error)만 확인해 주세요.

사용하는 O.home 부품: `useLocalList` · `useMembers` · `useAuth` · `putBlob / useBlobUrl / getBlob` · `sanitizeHtml` ·
`KInput / KTextarea / KCheck / KRadio / KSelect / KDate / KStep` · `ColorField` · `RichEditor` · `HtmlBody` · `PageTitle` · `useToast`
