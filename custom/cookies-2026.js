/* Banner de cookies (13-oct-2026).
   La web solo usa cookies técnicas; lo único opcional es el mapa de Google.
   "Aceptar" deja cargar el mapa sin pedirlo otra vez (misma clave que usa la web:
   maps-consent) y "Rechazar" lo deja con su botón "Cargar mapa". La elección se
   guarda un año y se puede cambiar desde el enlace "Cookies" del pie. */
(function () {
  var KEY = 'gg-cookies';
  var MAPS = 'maps-consent';
  var UN_ANO = 365 * 24 * 3600 * 1000;
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var raiz = new URL('../', document.currentScript.src);
  var T = {
    es: { txt: 'Usamos solo las cookies necesarias para que la web y las reservas funcionen. Si acepta, también se cargará el mapa de Google, que usa sus propias cookies.',
      mas: 'Más información', si: 'Aceptar', no: 'Rechazar', pie: 'Cookies', priv: 'es/proteccion-de-datos/' },
    en: { txt: 'We only use the cookies needed for the website and bookings to work. If you accept, the Google map will also load, which uses its own cookies.',
      mas: 'More information', si: 'Accept', no: 'Reject', pie: 'Cookies', priv: 'privacy-policy/' },
    de: { txt: 'Wir verwenden nur die Cookies, die für die Website und die Buchungen nötig sind. Wenn Sie zustimmen, wird auch die Google-Karte geladen, die eigene Cookies setzt.',
      mas: 'Mehr erfahren', si: 'Akzeptieren', no: 'Ablehnen', pie: 'Cookies', priv: 'de/datenschutz/' }
  }[lang] || null;
  if (!T) return;

  function lee() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return d && Date.now() - d.t < UN_ANO ? d.v : null; } catch (e) { return null; }
  }
  function guarda(v) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() }));
      if (v === 'si') localStorage.setItem(MAPS, 'true'); else localStorage.removeItem(MAPS);
    } catch (e) {}
    if (v === 'si') document.querySelectorAll('.privacy-map-wrapper .privacy-map-btn').forEach(function (b) { b.click(); });
  }

  var css = document.createElement('style');
  css.textContent =
    '.gg-cookies{position:fixed;z-index:70;left:12px;right:12px;bottom:12px;background:#f7f2e6;color:#2f3a30;' +
    'border:1px solid #c6a96b;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:16px 18px;' +
    'font-size:15px;line-height:1.5;max-width:600px;margin:0 auto}' +
    '.gg-cookies p{margin:0 0 12px}' +
    '.gg-cookies a{color:#207657;text-decoration:underline;white-space:nowrap}' +
    '.gg-cookies-btns{display:flex;gap:10px}' +
    '.gg-cookies button{flex:1;min-height:44px;border:0;border-radius:10px;background:#207657;color:#fff;' +
    'font:inherit;font-weight:700;cursor:pointer}' +
    '.gg-cookies button:hover{background:#1a5f46}' +
    '.gg-cookies button:focus-visible{outline:2px solid #c6a96b;outline-offset:2px}' +
    '@media (min-width:768px){.gg-cookies{bottom:24px;padding:18px 22px}}';
  document.head.appendChild(css);

  function abre() {
    if (document.querySelector('.gg-cookies')) return;
    var c = document.createElement('div');
    c.className = 'gg-cookies';
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-label', 'Cookies');
    c.innerHTML = '<p>' + T.txt + ' <a href="' + raiz + T.priv + '">' + T.mas + '</a></p>' +
      '<div class="gg-cookies-btns"><button type="button" data-v="si">' + T.si + '</button>' +
      '<button type="button" data-v="no">' + T.no + '</button></div>';
    c.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      guarda(v);
      c.remove();
    });
    document.body.appendChild(c);
  }

  // Enlace "Cookies" en el pie, junto a los legales, para cambiar la elección.
  var nav = document.querySelector('footer nav');
  if (nav) {
    var modelo = nav.querySelector('a');
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = T.pie;
    if (modelo) a.className = modelo.className;
    a.addEventListener('click', function (e) { e.preventDefault(); abre(); });
    nav.appendChild(a);
  }

  if (!lee()) abre();
})();
