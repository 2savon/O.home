/* 아보카도 TRPG 시트 SDK v1 — 시트 파일 안에 자동으로 삽입됩니다 (직접 넣을 필요 없음)
 * 시트는 격리된(sandbox) 화면에서 실행되어 홈페이지 정보에 접근할 수 없습니다.
 * 자세한 작성법 : sheets/SHEET_GUIDE.md
 */
(function (w, d) {
    'use strict';
    var S = w.AvoSheet = {
        mode: 'view', data: {}, ctx: {}, images: {},
        _init: [], _change: [], _collect: null, _ready: false
    };
    function post(m) { try { w.parent.postMessage(m, '*'); } catch (e) {} }
    function $$(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
    function isField(el) { return /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName); }

    /* ---------- 시트 작성자가 쓰는 함수 ---------- */
    S.onInit = function (fn) { S._init.push(fn); if (S._ready) fn(S.data, S.ctx, S.mode); };
    S.onChange = function (fn) { S._change.push(fn); };
    S.collect = function (fn) { S._collect = fn; };          // 직접 데이터 모으기 (선택)
    S.get = function (k) { return S.data[k]; };
    S.set = function (k, v) {                                   // 계산값 등 코드에서 바꿀 때
        S.data[k] = v;
        $$('[data-k="' + k + '"]').forEach(function (el) { put(el, v); });
        changed();
    };
    S.num = function (k) { var n = parseFloat(S.data[k]); return isNaN(n) ? 0 : n; };
    S.isEdit = function () { return S.mode === 'edit'; };

    /* ---------- 값 넣기 / 읽기 ---------- */
    function put(el, v) {
        if (v === undefined || v === null) v = '';
        if (el.type === 'checkbox') el.checked = !!v && v !== '0';
        else if (el.type === 'radio') el.checked = (String(v) === el.value);
        else if (isField(el)) el.value = v;
        else el.textContent = v;
    }
    function read(el) {
        if (el.type === 'checkbox') return el.checked ? 1 : 0;
        if (el.getAttribute('data-type') === 'number' || el.getAttribute('inputmode') === 'numeric') {
            var n = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ''));
            return isNaN(n) ? '' : n;
        }
        return el.value;
    }
    function gather() {
        $$('[data-k]').forEach(function (el) {
            if (!isField(el) || el.hasAttribute('data-calc')) return;
            if (el.type === 'radio' && !el.checked) return;
            S.data[el.getAttribute('data-k')] = read(el);
        });
        if (S._collect) { var r = S._collect(S.data); if (r && typeof r === 'object') S.data = r; }
        return S.data;
    }
    var timer = null;
    function changed() {
        S._change.forEach(function (fn) { try { fn(S.data); } catch (e) { console.error(e); } });
        if (S.mode !== 'edit') return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { post({ type: 'avo:data', data: gather() }); }, 120);
    }

    /* ---------- 이미지 ---------- */
    function paintImg(el) {
        var k = el.getAttribute('data-img'), url = S.images[k] || '';
        var fb = el.getAttribute('data-fallback'); // 'thumb' | 'full' | '' (기본 테마색)
        if (!url && fb && S.ctx.images) url = S.ctx.images[fb] || '';
        if (el.tagName === 'IMG') { el.classList.toggle('has-img', !!url); if (url) el.src = url; else el.removeAttribute('src'); return; }
        // 배경 이미지 칸 : 실제로 불러와졌을 때만 has-img (주소가 깨졌으면 기본 디자인 그대로)
        el.classList.remove('has-img');
        if (el.__defY === undefined) el.__defY = cssPosY(el);  // 시트 CSS 의 기본 세로 위치 (top = 0, center = 50 …)
        el.style.backgroundImage = url ? 'url("' + url.replace(/"/g, '%22') + '")' : '';
        el.__url = url;
        if (!url) { el.__im = null; el.style.backgroundSize = el.style.backgroundPosition = ''; var cv = el.querySelector('canvas.avo-px'); if (cv) cv.parentNode.removeChild(cv); return; }
        var im = new Image();
        im.onload = function () { if (el.__url !== url) return; el.__im = im; el.classList.add('has-img'); applyPos(el); };
        im.onerror = function () { if (el.__url !== url) return; el.__im = null; el.style.backgroundImage = ''; };
        im.src = url;
    }
    function cssPosY(el) {
        var v = String(w.getComputedStyle(el).backgroundPositionY || '').split(',')[0].trim();
        if (/top/.test(v)) return 0; if (/bottom/.test(v)) return 100; if (/%$/.test(v)) return parseFloat(v) || 0;
        return 50;
    }
    /* 이미지 보일 범위 : 시트 입력값 _pos_키 = "가로%,세로%,확대" (편집 모드의 「범위」 버튼으로 지정) */
    function posOf(el) {
        var v = String(S.data['_pos_' + el.getAttribute('data-img')] || '').split(',');
        var x = parseFloat(v[0]), y = parseFloat(v[1]), z = parseFloat(v[2]);
        return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? (el.__defY === undefined ? 50 : el.__defY) : y, z: isNaN(z) ? 1 : Math.max(1, Math.min(4, z)) };
    }
    function geo(el, p) {
        var im = el.__im, W = el.clientWidth || el.offsetWidth, H = el.clientHeight || el.offsetHeight;
        if (!im || !W || !H) return null;
        var iw = im.naturalWidth, ih = im.naturalHeight, r = Math.max(W / iw, H / ih) * p.z;
        return { W: W, H: H, iw: iw, ih: ih, r: r, dw: iw * r, dh: ih * r };
    }
    function applyPos(el) {
        var p = posOf(el), g = geo(el, p);
        if (!g) return;
        if (el.hasAttribute('data-pixel')) return pixelate(el, p, g);
        el.style.backgroundSize = Math.ceil(g.dw) + 'px ' + Math.ceil(g.dh) + 'px';
        el.style.backgroundPosition = p.x + '% ' + p.y + '%';
    }
    /* data-pixel="5" : 넣은 이미지를 픽셀아트처럼 (작게 줄였다가 각지게 확대) · 숫자 = 픽셀 한 칸 크기(px) */
    function pixelate(el, p, g) {
        var cv = el.querySelector('canvas.avo-px');
        var b = Math.max(2, parseFloat(el.getAttribute('data-pixel')) || 5);
        var cw = Math.max(1, Math.round(g.W / b)), ch = Math.max(1, Math.round(g.H / b));
        if (!cv) {
            cv = d.createElement('canvas');
            cv.className = 'avo-px';
            cv.setAttribute('aria-hidden', 'true');
            cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges;image-rendering:pixelated;';
            el.insertBefore(cv, el.firstChild);
        }
        cv.width = cw; cv.height = ch;
        var x = cv.getContext('2d');
        x.imageSmoothingEnabled = true;
        var sw = g.W / g.r, sh = g.H / g.r; // 원본에서 잘라 올 범위
        x.clearRect(0, 0, cw, ch);
        x.drawImage(el.__im, (g.iw - sw) * p.x / 100, (g.ih - sh) * p.y / 100, sw, sh, 0, 0, cw, ch);
    }
    function savePos(el, p) {
        S.data['_pos_' + el.getAttribute('data-img')] = Math.round(p.x * 10) / 10 + ',' + Math.round(p.y * 10) / 10 + ',' + Math.round(p.z * 100) / 100;
        applyPos(el); changed();
    }
    // 범위 지정 모드 : 이미지를 끌어 위치, 슬라이더 · 휠로 크기
    var posCss = false;
    /* (O.home 이식판 수정) 범위 지정용 스타일을 처음부터 넣는다 — 원본은 「범위」를 한 번 눌러야 넣어서
       그 전까지 슬라이더 · 완료 버튼 · 안내 문구가 모두 보였다 */
    function ensurePosCss() {
        if (posCss) return;
        posCss = true;
        var st = d.createElement('style');
        st.textContent = '.avo-pos-on{cursor:move!important;outline:2px dashed rgba(255,255,255,.95);outline-offset:-5px;box-shadow:inset 0 0 0 9999px rgba(0,0,0,.08)}'
        + '.avo-pos-on *:not(.avo-img-bar):not(.avo-img-bar *){pointer-events:none}'
        + '.avo-img-bar .avo-pos-z{display:none;width:90px;accent-color:#fff;vertical-align:middle}'
        + '.avo-pos-on .avo-img-bar .avo-pos-z{display:inline-block}'
        + '.avo-img-bar [data-act=done],.avo-img-bar [data-act=reset]{display:none}'
        + '.avo-pos-on .avo-img-bar [data-act=done],.avo-pos-on .avo-img-bar [data-act=reset]{display:inline-block}'
        + '.avo-pos-on .avo-img-bar [data-act=pick],.avo-pos-on .avo-img-bar [data-act=clear],.avo-pos-on .avo-img-bar [data-act=pos]{display:none}'
        + '.avo-pos-tip{display:none;padding:3px 8px;border-radius:99px;background:rgba(20,20,24,.7);color:#fff;font-size:10px;pointer-events:none}'
        + '.avo-pos-on .avo-pos-tip{display:block}';
        d.head.appendChild(st);
    }
    function posMode(el, onoff) {
        ensurePosCss();
        el.classList.toggle('avo-pos-on', onoff);
        var zr = el.querySelector('.avo-pos-z'); if (zr) zr.value = posOf(el).z;
    }
    function bindPos(el) {
        var tip = d.createElement('span');
        tip.className = 'avo-pos-tip'; tip.textContent = '드래그 = 위치 · 휠 / 슬라이더 = 크기';
        tip.style.cssText = 'position:absolute;right:8px;top:8px;left:auto;z-index:5;';
        el.appendChild(tip);
        var drag = null;
        function pt(e) { var t = e.touches && e.touches.length ? e.touches[0] : (e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e); return { x: t.clientX, y: t.clientY }; }
        function down(e) {
            if (!el.classList.contains('avo-pos-on') || (e.target.closest && e.target.closest('.avo-img-bar'))) return;
            var p = posOf(el), g = geo(el, p); if (!g) return;
            e.preventDefault();
            var q = pt(e); drag = { sx: q.x, sy: q.y, p: p, g: g };
            d.addEventListener('mousemove', move); d.addEventListener('mouseup', up);
            d.addEventListener('touchmove', move, { passive: false }); d.addEventListener('touchend', up);
        }
        function move(e) {
            if (!drag) return; e.preventDefault();
            var q = pt(e), g = drag.g, p = { x: drag.p.x, y: drag.p.y, z: drag.p.z };
            // 이미지를 끄는 방향으로 따라오도록 (남는 폭에 대한 % 를 반대로)
            if (g.dw - g.W > 1) p.x = Math.max(0, Math.min(100, drag.p.x - (q.x - drag.sx) / (g.dw - g.W) * 100));
            if (g.dh - g.H > 1) p.y = Math.max(0, Math.min(100, drag.p.y - (q.y - drag.sy) / (g.dh - g.H) * 100));
            savePos(el, p);
        }
        function up() { drag = null; d.removeEventListener('mousemove', move); d.removeEventListener('mouseup', up); d.removeEventListener('touchmove', move); d.removeEventListener('touchend', up); }
        el.addEventListener('mousedown', down);
        el.addEventListener('touchstart', down, { passive: false });
        el.addEventListener('wheel', function (e) {
            if (!el.classList.contains('avo-pos-on')) return;
            e.preventDefault();
            var p = posOf(el); p.z = Math.max(1, Math.min(4, p.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
            var zr = el.querySelector('.avo-pos-z'); if (zr) zr.value = p.z;
            savePos(el, p);
        }, { passive: false });
    }
    var picker = d.createElement('input');
    picker.type = 'file'; picker.accept = 'image/png,image/jpeg,image/gif,image/webp';
    var pickKey = null, pickEl = null;
    picker.addEventListener('change', function () {
        var f = picker.files && picker.files[0];
        if (!f || !pickKey) return;
        var r = new FileReader();
        r.onload = function () {
            post({ type: 'avo:image-file', key: pickKey, dataUrl: r.result, name: f.name, mime: f.type,
                   ratio: pickEl.getAttribute('data-ratio') || '', max: parseInt(pickEl.getAttribute('data-max'), 10) || 1200 });
            picker.value = '';
        };
        r.readAsDataURL(f);
    });
    function setupImgEdit(el) {
        var k = el.getAttribute('data-img');
        ensurePosCss();
        el.classList.add('avo-img-edit');
        var bar = d.createElement('span');
        bar.className = 'avo-img-bar';
        var canPos = el.tagName !== 'IMG';
        bar.innerHTML = '<button type="button" data-act="pick">이미지 변경</button>' + (canPos ? '<button type="button" data-act="pos">범위</button>' : '') + '<button type="button" data-act="clear">기본</button>'
            + (canPos ? '<input type="range" class="avo-pos-z" min="1" max="4" step="0.05" value="1" title="크기"><button type="button" data-act="reset">처음대로</button><button type="button" data-act="done">완료</button>' : '')
            + (el.getAttribute('data-hint') ? '<small>' + el.getAttribute('data-hint') + '</small>' : '');
        el.appendChild(bar);
        if (canPos) {
            bindPos(el);
            bar.querySelector('.avo-pos-z').addEventListener('input', function () { var p = posOf(el); p.z = +this.value; savePos(el, p); });
            ['mousedown', 'touchstart'].forEach(function (t) { bar.addEventListener(t, function (e) { e.stopPropagation(); }); });
        }
        bar.addEventListener('click', function (e) {
            var b = e.target.closest ? e.target.closest('button') : null;
            if (!b) return;
            e.preventDefault(); e.stopPropagation();
            var act = b.getAttribute('data-act');
            if (act === 'pick') { pickKey = k; pickEl = el; picker.click(); }
            else if (act === 'pos') { if (!el.__im) return; posMode(el, true); }
            else if (act === 'done') posMode(el, false);
            else if (act === 'reset') { delete S.data['_pos_' + k]; applyPos(el); changed(); posMode(el, true); }
            else { S.images[k] = ''; delete S.data['_pos_' + k]; paintImg(el); changed(); post({ type: 'avo:image-clear', key: k }); }
        });
    }

    /* ---------- 높이 알림 ---------- */
    var lastH = 0;
    function height() {
        // body 높이 기준 (documentElement 는 iframe 높이보다 작아지지 않아서, 내용이 줄어도 높이가 그대로 남는 문제 방지)
        var h = d.documentElement.scrollHeight;
        if (d.body) {
            var bs = w.getComputedStyle(d.body);
            h = Math.max(d.body.scrollHeight, Math.ceil(d.body.getBoundingClientRect().height)) + (parseFloat(bs.marginTop) || 0) + (parseFloat(bs.marginBottom) || 0);
        }
        if (Math.abs(h - lastH) > 2) { lastH = h; post({ type: 'avo:height', h: h }); }
    }

    /* ---------- 부모(홈페이지)와 통신 ---------- */
    w.addEventListener('message', function (e) {
        var m = e.data || {};
        if (m.type === 'avo:init') {
            if (S._ready) return; // 같은 데이터가 두 번 와도 한 번만 적용
            S.mode = m.mode === 'edit' ? 'edit' : 'view';
            // 저장된 값이 없으면 서버가 빈 배열([])로 보내므로 객체로 바꿔 둠 (배열이면 입력값이 저장되지 않음)
            var obj = function (v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
            S.data = obj(m.data);
            S.ctx = obj(m.ctx);
            S.images = obj(m.images);
            var root = d.documentElement;
            root.classList.add(S.mode === 'edit' ? 'is-edit' : 'is-view');
            // 캐릭터 색 : 테마 컬러 → 라벨 색 → 기본 초록 순으로 항상 지정
            root.style.setProperty('--accent', S.ctx.accent || '#6f9a4c');
            root.style.setProperty('--label', S.ctx.label || S.ctx.accent || '#6f9a4c');
            $$('[data-k]').forEach(function (el) { put(el, S.data[el.getAttribute('data-k')]); });
            $$('[data-ctx]').forEach(function (el) { put(el, S.ctx[el.getAttribute('data-ctx')] || ''); });
            $$('[data-img]').forEach(function (el) { paintImg(el); if (S.mode === 'edit') setupImgEdit(el); });
            if (S.mode === 'view') {
                $$('input, select, textarea, button').forEach(function (el) {
                    if (el.closest && el.closest('.avo-img-bar')) return;
                    el.disabled = true; el.tabIndex = -1;
                });
            }
            S._ready = true;
            S._init.forEach(function (fn) { try { fn(S.data, S.ctx, S.mode); } catch (er) { console.error(er); } });
            S._change.forEach(function (fn) { try { fn(S.data); } catch (er) { console.error(er); } });
            if (S.mode === 'edit') post({ type: 'avo:data', data: gather() });
            height();
        } else if (m.type === 'avo:image') {
            S.images[m.key] = m.url || '';
            $$('[data-img="' + m.key + '"]').forEach(paintImg);
        } else if (m.type === 'avo:get') {
            post({ type: 'avo:data', data: gather(), final: true });
        }
    });
    d.addEventListener('input', function (e) {
        var el = e.target;
        if (el && el.hasAttribute && el.hasAttribute('data-k')) { S.data[el.getAttribute('data-k')] = read(el); changed(); }
    });
    d.addEventListener('change', function (e) {
        var el = e.target;
        if (el && el.hasAttribute && el.hasAttribute('data-k')) { if (!(el.type === 'radio' && !el.checked)) S.data[el.getAttribute('data-k')] = read(el); changed(); }
    });
    function boot() {
        post({ type: 'avo:ready' });
        height();
        if (w.ResizeObserver) { var ro = new ResizeObserver(height); ro.observe(d.documentElement); if (d.body) ro.observe(d.body); }
        else setInterval(height, 500);
        w.addEventListener('load', height);
    }
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
