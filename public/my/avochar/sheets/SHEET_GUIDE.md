# 아보카도 캐릭터 게시판 · TRPG 시트 만들기 가이드 (SDK v1)

> **O.home 이식판 안내** — 만든 시트는 홈의 **게시판 설정 › 업로드한 TRPG 시트 › 시트 업로드** 또는 캐릭터 수정 › TRPG 시트 › 「커스텀 시트 업로드」로 올려 주세요. 이 폴더에 파일만 넣어서는 목록에 나타나지 않아요. 파일 크기는 700KB 이하.

새 시트(다른 룰, 다른 디자인)를 만들어 **업로드**하거나 이 `sheets/` 폴더에 **파일로 넣으면** 바로 "작성 시트 선택"에 나타납니다.
Claude 에게 만들어 달라고 할 때는 이 문서를 통째로 붙여 넣고 "이 규칙대로 ○○ 시트를 만들어줘"라고 하면 됩니다.

---

## 1. 시트 파일은 이렇게 생겼어요

- **HTML 파일 1개** (`.html`, UTF-8, 1MB 이하). CSS 와 JS 를 모두 파일 안에 넣습니다.
- `<html>`, `<head>`, `<body>` 는 **없어도 됩니다** (있어도 괜찮아요).
- 첫 줄에 **이름표(meta)** 를 넣습니다.

```html
<meta name="avo-sheet" content='{"name":"시트 이름","width":820,"order":10}'>
```

| 항목 | 뜻 |
|---|---|
| `name` | 시트 선택 목록에 보일 이름 |
| `width` | 시트를 디자인한 가로 폭(px). 좁은 칸에서는 이 폭을 기준으로 자동 축소돼요 (320~1600) |
| `order` | (선택) sheets 폴더에 넣은 시트의 목록 순서. 작을수록 앞 (기본 시트는 1~9) |

- 폴더에 넣을 때 파일 이름은 영문·숫자·`-`·`_` 만 (예: `dnd5e.html`). `_` 로 시작하는 파일은 목록에서 빠집니다.

## 2. 값 저장은 `data-k` 만 붙이면 끝

입력칸에 `data-k="키"` 를 붙이면 **불러오기 · 저장 · 읽기 전용 표시**가 자동으로 됩니다.

```html
<input data-k="player">                      <!-- 글자 -->
<input data-k="STR" inputmode="numeric">     <!-- 숫자 (숫자만 저장) -->
<textarea data-k="memo"></textarea>
<select data-k="class"><option>전사</option><option>마법사</option></select>
<input type="checkbox" data-k="skill_grow">  <!-- 체크 = 1, 해제 = 0 -->
<span data-k="player"></span>                <!-- 입력칸이 아니면 값을 글자로 표시만 -->
```

- 키 이름 : 영문·숫자·`_` 권장, 64자 이내. 같은 키를 여러 곳에 쓰면 모두 같은 값을 보여줍니다.
- 계산 결과처럼 **저장하지 않을 칸**에는 `data-calc` 를 붙이세요.
- 캐릭터 페이지(보기 모드)에서는 모든 입력칸이 자동으로 잠깁니다. 클릭해도 바뀌지 않아요.

## 3. 캐릭터 정보 가져오기 `data-ctx`

```html
<h1 data-ctx="name"></h1>       <!-- 캐릭터 이름 -->
<p data-ctx="nameSub"></p>      <!-- 영문명 / 별칭 -->
```

CSS 에서는 캐릭터 색을 변수로 쓸 수 있어요.

```css
.title { color: var(--accent); }   /* 캐릭터 테마 컬러 (없으면 홈페이지 기본 컬러) */
.badge { background: var(--label); } /* 구분 라벨 색 */
```

## 4. 이미지 칸 `data-img`

```html
<div class="portrait" data-img="portrait" data-fallback="thumb" data-ratio="3:4" data-max="600" data-hint="권장 600×800"></div>
<img data-img="logo" data-ratio="1:1" data-max="400">
```

| 속성 | 뜻 |
|---|---|
| `data-img` | 이미지 이름 (영문·숫자·`_`, 30자 이내) |
| `data-fallback` | 이미지가 없을 때 쓸 캐릭터 이미지 : `thumb`(두상 썸네일) / `full`(전신). 없으면 비워 둠 → 테마색 배경 등 CSS 로 처리 |
| `data-ratio` | 자르기 편집기 기본 비율 (`3:4`, `1:1`, `16:9` … 비우면 자유) |
| `data-max` | 저장할 긴 변 최대 px |
| `data-hint` | 편집 모드에서 보여줄 권장 크기 안내 |
| `data-pixel` | (선택) 숫자를 적으면 넣은 이미지를 픽셀아트처럼 표시 · 숫자 = 픽셀 한 칸 크기(px) · `div` 칸에만 |

- 편집 모드에서 `div` 이미지 칸에는 「범위」 버튼이 붙어요. 끌어서 위치, 슬라이더 · 휠로 크기를 정하면 `_pos_이미지이름` 값으로 저장돼요 (따로 할 일 없음).
- `div` 등은 **배경 이미지**로, `img` 는 `src` 로 들어갑니다. 이미지가 있으면 `.has-img` 클래스가 붙어요.
- 편집 모드에서는 「이미지 변경 / 기본」 버튼이 자동으로 붙고, 홈페이지의 자르기 편집기가 열립니다.
- 버튼 위치는 시트 CSS 의 `.avo-img-bar` 로 꾸밀 수 있어요. 이미지 칸에는 `position: relative` 를 주세요.

## 5. 자동 계산 (선택)

```html
<script>
var S = window.AvoSheet;
S.onChange(function (data) {           // 처음 불러올 때 + 값이 바뀔 때마다
    var hp = Math.floor((S.num('CON') + S.num('SIZ')) / 10);
    document.getElementById('hp_max').textContent = hp;
});
</script>
```

| 함수 | 뜻 |
|---|---|
| `S.onChange(fn)` | 값이 바뀔 때마다 실행 (계산·표시 갱신) |
| `S.onInit(fn(data, ctx, mode))` | 처음 한 번 실행 |
| `S.num('키')` | 숫자로 읽기 (빈 칸 = 0) |
| `S.get('키')` / `S.set('키', 값)` | 읽기 / 코드에서 값 바꾸기 |
| `S.isEdit()` | 편집 모드인지 |
| `S.mode` | `'view'` 또는 `'edit'` |

- 표(기능 목록 등)를 JS 로 만들 때는 **`<script>` 를 시트 맨 아래**에 두고 바로 그리면 됩니다. (자동 저장 연결 전에 그려져야 해요)
- `<html>` 에 `is-view` / `is-edit` 클래스가 붙어서 CSS 로 모드별 모양을 바꿀 수 있어요.

```css
.is-view input { border-color: transparent; background: transparent; }
```

## 6. 지켜야 할 점

- 시트는 **격리된 창(sandbox)** 에서 실행돼요. 홈페이지 쿠키·화면·로그인 정보에 접근할 수 없고, 팝업·폼 전송도 막혀 있어요.
- 저장은 홈페이지가 대신 합니다. `fetch`/`XMLHttpRequest` 로 직접 저장하지 마세요.
- 외부 글꼴(구글 폰트 등)·CDN 은 쓸 수 있지만, 없어도 보이도록 기본 글꼴을 함께 지정하세요.
- 기본 글꼴 **Pretendard** 는 시트 안에 자동으로 불러와져요 : `font-family: "Pretendard Variable", Pretendard, sans-serif;`
- 높이는 자동으로 맞춰집니다. `height: 100vh` 같은 화면 높이 기준은 쓰지 마세요.
- 값 하나는 5000자, 전체 입력은 약 4000칸까지 저장돼요.

## 7. 가장 작은 예시 (그대로 업로드해 볼 수 있어요)

```html
<meta name="avo-sheet" content='{"name":"간단 메모 시트","width":600}'>
<style>
body { margin: 0; font: 14px sans-serif; }
.sheet { border: 3px solid var(--accent); padding: 16px; }
.hd { display: flex; gap: 12px; align-items: center; }
.pic { position: relative; width: 120px; height: 160px; background: var(--accent) center / cover; border-radius: 8px; }
h1 { margin: 0; color: var(--accent); }
.is-view input, .is-view textarea { border: 0; background: none; resize: none; }
</style>
<div class="sheet">
  <div class="hd">
    <div class="pic" data-img="pic" data-fallback="thumb" data-ratio="3:4" data-max="600" data-hint="3:4"></div>
    <div><h1 data-ctx="name"></h1><div data-ctx="nameSub"></div>
      <p>레벨 <input data-k="lv" inputmode="numeric" size="3"> · HP <b id="hp"></b></p></div>
  </div>
  <textarea data-k="memo" rows="5" style="width:100%"></textarea>
</div>
<script>
AvoSheet.onChange(function () { document.getElementById('hp').textContent = AvoSheet.num('lv') * 10; });
</script>
```

## 8. Claude 에게 부탁할 때 예시 문장

> 아래 가이드를 따르는 아보카도 TRPG 시트를 HTML 파일 하나로 만들어줘.
> 룰: ○○○ / 가로 폭 820px / 캐릭터 테마 컬러(var(--accent))를 포인트 색으로.
> 들어갈 항목: (항목 나열) / 자동 계산: (계산식) / 수정 불가 칸: (항목)
> (가이드 전문 붙여넣기)

기본 제공 `coc7.html` 도 좋은 예시예요. 기능 표를 JS 로 그리는 방법, 자동 계산, 읽기 전용 칸, 성장 체크 점 표시가 모두 들어 있어요.
