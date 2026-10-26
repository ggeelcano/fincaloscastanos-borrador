/* Finca Los Castaños — mejoras sept 2026 (G&G Elcano) */
(function () {
  // 1) Humo de café subiendo del grano flotante (efecto especial pedido)
  function addSteam(el) {
    if (!el || el.querySelector('.gg-steam-wrap')) return;
    var wrap = document.createElement('span');
    wrap.className = 'gg-steam-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.className = 'gg-steam';
      wrap.appendChild(s);
    }
    el.style.overflow = 'visible';
    el.style.position = el.style.position || 'relative';
    el.appendChild(wrap);
  }
  function initSteam() {
    // Sin humo en ningun sitio: la taza de los titulares desde el 8-sep y el
    // grano flotante desde el 20-oct (peticion de Elena). addSteam se conserva.
  }

  // 2) Noticias editables: se cargan desde noticias.json (el cliente edita solo ese archivo)
  function initNews() {
    var box = document.getElementById('gg-news');
    if (!box) return;
    var lang = box.getAttribute('data-lang') || 'es';
    var src = box.getAttribute('data-src') || 'noticias.json';
    fetch(src).then(function (r) { return r.json(); }).then(function (data) {
      var items = (data && data.items) || [];
      var frag = document.createDocumentFragment();
      items.forEach(function (item) {
        var loc = item[lang] || item.es || {};
        var card = document.createElement('article');
        card.className = 'gg-news-card';
        var img = '';
        if (item.imagen) {
          img = '<img src="' + box.getAttribute('data-root') + item.imagen + '" alt="" loading="lazy">';
        }
        card.innerHTML = img +
          '<div class="gg-news-body">' +
          '<span class="gg-news-date">' + (loc.fecha || '') + '</span>' +
          '<h3>' + (loc.titulo || '') + '</h3>' +
          '<p>' + (loc.texto || '') + '</p>' +
          '</div>';
        frag.appendChild(card);
      });
      box.innerHTML = '';
      box.appendChild(frag);
    }).catch(function () {
      box.innerHTML = '<p style="text-align:center">—</p>';
    });
  }

  // 3) Respaldo para navegadores sin :has() — marcar la seccion de la
  //    ilustracion para poder pintarla de arena desde el CSS.
  function initIlustracion() {
    var img = document.querySelector('img[src*="hero-illustration"]');
    if (!img) return;
    var sec = img.closest('section');
    if (sec) sec.classList.add('gg-ilustracion');
  }

  // 4) Fundido por scroll entre la montana del hero y los granos: al bajar,
  //    los granos aparecen sobre la montana casi invisibles y van ganando
  //    opacidad y color hasta quedar a maxima intensidad.
  // (21-sep) Ruta del azulejo de granos segun la densidad de pantalla (alto
  // 1150 para moviles retina, 800 para el resto). sufijo: '' entero, '-roto'
  // con el borde de abajo recortado por los granos.
  function ggTile(imgBanda, sufijo) {
    var base = (imgBanda.getAttribute('src') || '').split('custom/')[0];
    var alto = (window.devicePixelRatio || 1) > 1.3 ? 1150 : 800;
    return base + 'custom/granos-2026-tile' + sufijo + '-' + alto + '.webp';
  }

  // (26-oct) Elena: "quitar completamente la cascara de la primera pagina". La banda
  // .gg-beans-band ya no esta en el html de las portadas, asi que esta funcion no hace
  // nada (se conserva por si hay que volver). La portada se reconoce ahora por su foto.
  function fotoPortada() { return document.querySelector('main img[src*="hero-2026"]'); }

  function initBeansFade() {
    var band = document.querySelector('.gg-beans-band');
    if (!band) return;
    var hero = band.previousElementSibling;
    if (!hero || hero.tagName !== 'SECTION') return;
    var fotoHero = hero.querySelector('img[src*="hero."], img[src*="hero-2026"]');
    var fondo = fotoHero && fotoHero.parentElement;
    // (20-oct) la foto va dentro de <picture> (corte vertical para movil): el fondo es su padre
    if (fondo && fondo.tagName === 'PICTURE') fondo = fondo.parentElement;
    var granos = band.querySelector('img');
    if (!fondo || !granos) return;

    // El degradado a negro del final del hero marcaba el corte de secciones
    var negro = fondo.querySelector('.bottom-0.bg-gradient-to-b');
    if (negro) negro.classList.add('gg-hero-fade-out');

    // (21-sep) Elena quiere la banda como su panoramica antigua: granos
    // pequenos y tira muy larga ("pegar tres"). La foto va ahora como AZULEJO
    // (custom/granos-2026-tile-*, la foto + su espejo) que el css repite en
    // horizontal. La banda lleva el azulejo con el borde de abajo roto y esta
    // capa del hero el azulejo entero volteado; mismo alto en las dos, asi el
    // grano sale del mismo tamano y la union es continua.
    if (!band.querySelector('.gg-tile')) {
      var azulejo = document.createElement('div');
      azulejo.className = 'gg-tile coffee-fade-in';
      azulejo.style.backgroundImage = 'url(' + ggTile(granos, '-roto') + ')';
      band.appendChild(azulejo);
      granos.classList.add('gg-oculta');
    }

    // (1-oct tarde) TRANSICION foto -> cascara SIN SCROLL. Josu: "quiero que la
    // transicion al cafe sea suave, no de golpe". Antes la capa de granos crecia con el
    // scroll y con dos vueltas de rueda tapaba media foto. Ahora es un fundido FIJO:
    //  - la portada (clase gg-hero-zona, css bloque 30) mide una pantalla + la zona de
    //    fundido; el texto sigue centrado en la primera pantalla y la foto continua debajo;
    //  - en esa zona va el azulejo alto (granos-2026-alto-*: las filas REALES de la foto
    //    de cascara que siguen por encima de la banda, sin espejo ni tramos) con un
    //    degradado largo (mascara en el css) que llega a opaco justo donde empieza la
    //    banda: sin raya en la union;
    //  - arriba del todo no se ve ningun grano: la zona empieza en el borde de la pantalla
    //    y los granos van saliendo al bajar, al ritmo de la pagina. No hay nada que salte.
    //  - Medidas en pixeles ENTEROS (con 34svh y 132 % salian decimales y rayas de 1 px).
    hero.classList.add('gg-hero-zona');
    var capa = fondo.querySelector('.gg-granos-fade');
    var base = (granos.getAttribute('src') || '').split('custom/')[0];
    var dpr2 = (window.devicePixelRatio || 1) > 1.3;
    if (!capa) {
      capa = document.createElement('div');
      capa.className = 'gg-granos-fade';
      capa.setAttribute('aria-hidden', 'true');
      var imgAlto = 'url(' + base + 'custom/granos-2026-alto-' + (dpr2 ? 1725 : 1200) + '.webp)';
      // espejo arriba, donde el degradado casi no deja ver nada; alto real debajo
      ['gg-tile gg-tile-espejo', 'gg-tile gg-tile-alto'].forEach(function (cls) {
        var d = document.createElement('div');
        d.className = cls;
        d.style.backgroundImage = imgAlto;
        capa.appendChild(d);
      });
      fondo.appendChild(capa);
    }
    // (13-oct) Josu: "quiero que aqui haya transicion, que poco a poco se vaya
    // fusionando con los granos mientras bajo". Segunda capa con los mismos granos
    // y un degradado mas corto arriba (css bloque 38): su opacidad sube de 0 a 1
    // con el scroll, asi la plantacion se va llenando de granos al bajar. El
    // recorrido es casi una pantalla (el 1-oct, con dos vueltas de rueda tapaba
    // media foto). La capa fija de abajo no cambia: la union con la banda sigue igual.
    var mezcla = fondo.querySelector('.gg-granos-mezcla');
    if (!mezcla) {
      mezcla = capa.cloneNode(true);
      mezcla.classList.add('gg-granos-mezcla');
      // sin el azulejo en espejo: a opacidad alta se veia como una franja horizontal
      var esp = mezcla.querySelector('.gg-tile-espejo');
      if (esp) esp.remove();
      fondo.appendChild(mezcla);
    }
    var tilesAlto = fondo.querySelectorAll('.gg-tile-alto');
    var tilesEspejo = fondo.querySelectorAll('.gg-tile-espejo');
    var tileBanda = band.querySelector('.gg-tile');
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // con el fundido por scroll, la capa fija se queda solo pegada a la banda (css
    // bloque 38): al empezar a bajar se ve verde. Sin animacion, el fundido fijo de siempre.
    if (!quieto) hero.classList.add('gg-mezcla-on');
    var ultimo = -1;
    function mezclar() {
      var r = capa.getBoundingClientRect(), vh = window.innerHeight || 800;
      // 0 cuando la zona asoma por abajo (95 % de la pantalla), 1 cuando su borde
      // de arriba llega al 15 %: unos 0,8 de pantalla de scroll
      var p = quieto ? 0 : Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.8)));
      p = p * p * (3 - 2 * p);   // arranca y termina suave
      p = Math.round(p * 1000) / 1000;
      if (p !== ultimo) { mezcla.style.setProperty('opacity', p, 'important'); ultimo = p; }
    }
    var enCola = false;
    window.addEventListener('scroll', function () {
      if (enCola) return;
      enCola = true;
      requestAnimationFrame(function () { enCola = false; mezclar(); });
    }, { passive: true });

    function medir() {
      band.style.removeProperty('height');
      var real = Math.round(band.getBoundingClientRect().height);   // 34svh redondeado
      var T = 2 * Math.round(real * 1.32 / 2);   // alto del azulejo de la banda (par)
      var TA = T * 3 / 2;                         // azulejo alto: 3072 / 2048 = 1,5
      var filas = TA - real;                      // filas reales de granos por encima de la banda
      // zona de fundido: 1,5 veces la banda. Lo que pasa de las filas reales (la parte de
      // arriba, con el degradado por debajo del 17 %) lo cubre el azulejo en espejo.
      var zona = Math.round(real * 1.5);
      hero.style.setProperty('--gg-zona', zona + 'px');
      tilesEspejo.forEach(function (t) {
        t.style.height = Math.max(0, zona - filas) + 'px';
        t.style.backgroundSize = 'auto ' + TA + 'px';
      });
      // la banda sube 2 px sobre el final de la portada y lo tapa con el mismo contenido:
      // la union no cae en medio pixel (portatiles al 125 %) y no se ve ninguna linea
      band.style.setProperty('height', (real + 2) + 'px', 'important');
      band.style.setProperty('margin-top', '-2px', 'important');
      band.style.setProperty('z-index', '11');
      tileBanda.style.backgroundSize = 'auto ' + T + 'px';
      tileBanda.style.backgroundPosition = '50% 100%';
      tilesAlto.forEach(function (t) {
        t.style.backgroundSize = 'auto ' + TA + 'px';
        t.style.backgroundPosition = '50% calc(100% + ' + real + 'px)';
      });
    }
    var pedido = false;
    window.addEventListener('resize', function () {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(function () { pedido = false; medir(); mezclar(); });
    });
    medir();
    mezclar();
  }

  // 5) Pagina Experiencia: la columna tenia una sola foto y dos huecos
  //    enormes. Se anaden dos fotos mas siguiendo el orden del texto:
  //    la planta (cultivo) -> el secado -> la cafetera (degustacion).
  function initFotosExperiencia() {
    // (26-oct) Elena: "esta rama es fea" -> fuera las cerezas en la rama; la columna se
    // queda solo con el secado y el texto sube. Se conserva el codigo por si hay que volver.
    return;
    var img = document.querySelector('img[src*="plantation-tour"]');
    if (!img) return;
    var marco = img.parentElement;
    var col = marco && marco.parentElement;
    if (!col || col.querySelector('.gg-foto-extra')) return;

    var src = img.getAttribute('src');
    if (src.indexOf('_astro/') < 0) return;
    var base = src.split('_astro/')[0];          // '../' o '../../'
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    // (21-sep) Leo salia aqui y en la pagina del Tour: Elena pide otra foto.
    // Van las cerezas en la rama (el cultivo), y debajo sigue el secado.
    var textos = {
      es: ['Cerezas de café madurando en el cafeto'],
      de: ['Reifende Kaffeekirschen am Strauch'],
      en: ['Coffee cherries ripening on the plant']
    };
    var alt = textos[lang] || textos.en;

    col.classList.add('gg-col-fotos');
    function nuevoMarco(nombre, texto) {
      var caja = document.createElement('div');
      caja.className = marco.className + ' gg-foto-extra';
      var foto = document.createElement('img');
      foto.src = base + 'custom/' + nombre + '-900.webp';
      foto.srcset = base + 'custom/' + nombre + '-600.webp 600w, ' +
                    base + 'custom/' + nombre + '-900.webp 900w';
      foto.sizes = img.getAttribute('sizes') || '(max-width: 768px) 80vw, 28vw';
      foto.alt = texto;
      foto.loading = 'lazy';
      foto.decoding = 'async';
      foto.className = img.className;
      caja.appendChild(foto);
      return caja;
    }
    col.insertBefore(nuevoMarco('exp-cerezas', alt[0]), marco);
  }

  // 6) Historia del cafe: el texto es larguisimo y la columna de la foto,
  //    ademas de sticky, tenia una sola imagen. Se reparten cuatro fotos mas
  //    siguiendo lo que cuenta el texto (el valle, los platanos que
  //    sustituyeron al cafe, las parcelas familiares y las notas de cata).
  function initFotosHistoria() {
    var img = document.querySelector('img[src*="plantation-view"]');
    if (!img) return;
    var marco = img.parentElement;
    var col = marco && marco.parentElement;
    if (!col || col.querySelector('.gg-foto-extra')) return;

    var src = img.getAttribute('src');
    if (src.indexOf('_astro/') < 0) return;
    var base = src.split('_astro/')[0];
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    // (21-sep) la flor del cafeto, muestra de Elena, abre la columna.
    // (26-oct) Elena: fuera la flor ("es ilegal"); en su lugar la casa de la finca
    // (la foto 33 de la galeria, que sale de alli; ampliada x4 en ronda-26oct/).
    var textos = {
      es: ['La casa de la finca entre palmeras', 'Cultivos del Valle de Agaete', 'Plataneras en el valle',
           'Cerezas de café recién recogidas'],
      de: ['Das Haus der Finca zwischen Palmen', 'Anbau im Valle de Agaete', 'Bananenstauden im Tal',
           'Frisch geerntete Kaffeekirschen'],
      en: ['The finca house among palm trees', 'Crops in the Valle de Agaete', 'Banana plants in the valley',
           'Freshly picked coffee cherries']
    };
    var alt = textos[lang] || textos.en;

    col.classList.add('gg-col-historia');
    function nuevoMarco(nombre, texto) {
      var caja = document.createElement('div');
      caja.className = marco.className + ' gg-foto-extra';
      var foto = document.createElement('img');
      foto.src = base + 'custom/' + nombre + '-900.webp';
      foto.srcset = base + 'custom/' + nombre + '-600.webp 600w, ' +
                    base + 'custom/' + nombre + '-900.webp 900w';
      foto.sizes = img.getAttribute('sizes') || '(max-width: 768px) 100vw, 50vw';
      foto.alt = texto;
      foto.loading = 'lazy';
      foto.decoding = 'async';
      foto.className = img.className;
      caja.appendChild(foto);
      return caja;
    }
    ['exp-casa', 'exp-valle', 'exp-platanos', 'exp-mano']
      .forEach(function (nombre, i) { col.appendChild(nuevoMarco(nombre, alt[i])); });
  }

  function idioma() { return (document.documentElement.lang || 'en').slice(0, 2); }

  // 7) Fuera la galeria de la portada: sus 12 fotos ya estan en "Photo
  //    Gallery", que queda como galeria unica.
  function initSinGaleriaHome() {
    if (!fotoPortada()) return;   // solo la portada
    // La galeria es la unica seccion de la portada con una rejilla de 12 fotos.
    // (Antes se buscaba por el alt "Finca Los Casta..." y eso escondia la
    // seccion "Visitas con encanto", cuya foto del equipo lleva ese mismo alt.)
    var sec = [].slice.call(document.querySelectorAll('main section')).filter(function (s) {
      return s.querySelectorAll('.grid img').length >= 8;
    })[0];
    if (sec) sec.classList.add('gg-oculta');
  }

  // 8) Dejar dicho que el idioma de la visita se acuerda al reservar.
  function initNotaIdioma() {
    var textos = {
      es: 'Dinos el idioma que prefieres al hacer la reserva: lo acordamos de antemano para asignarte el guía.',
      de: 'Bitte geben Sie die gewünschte Sprache bei der Buchung an – wir stimmen sie vorab ab.',
      en: 'Please tell us your preferred language when booking – we arrange it in advance.'
    };
    var nota = textos[idioma()] || textos.en;

    // a) en la respuesta de la FAQ sobre idiomas
    var faq = [].slice.call(document.querySelectorAll('details'))
      .filter(function (d) { return /idioma|language|sprache/i.test(d.textContent); })[0];
    if (faq && !faq.querySelector('.gg-nota-idioma')) {
      var cuerpo = faq.querySelector('div');
      if (cuerpo) {
        var s = document.createElement('strong');
        s.className = 'gg-nota-idioma';
        s.textContent = nota;
        cuerpo.appendChild(s);
      }
    }

    // b) junto a la lista de idiomas de la pagina de reserva
    var lista = [].slice.call(document.querySelectorAll('li, p, span'))
      .filter(function (e) {
        return /ES\s*·\s*EN/.test(e.textContent) && e.children.length === 0;
      })[0];
    if (lista) {
      var caja = lista.closest('li') || lista.parentElement;
      if (caja && !caja.parentElement.querySelector('.gg-nota-idioma')) {
        var p = document.createElement('p');
        // esta va sobre la foto del hero: hace falta texto claro con sombra
        p.className = 'gg-nota-idioma gg-nota-idioma--claro';
        p.textContent = nota;
        caja.parentElement.appendChild(p);
      }
    }
  }

  // 9) Contacto: el mapa salia muy alejado y sin forma de acercarlo. Se
  //    centra en la finca con zoom util y se anade un boton "como llegar".
  function initMapa() {
    var marco = document.querySelector('.privacy-map-wrapper') ||
                document.querySelector('[class*="map-wrapper"]');
    if (!marco || marco.querySelector('.gg-como-llegar')) return;

    var destino = 'Finca+Los+Casta%C3%B1os,+Camino+de+Los+Romeros,+35489+Agaete,+Las+Palmas';
    var lang = idioma();
    var textos = { es: 'Cómo llegar', de: 'Anfahrt', en: 'Get directions' };

    // el embed del cliente venia con un zoom fijo demasiado abierto
    function acercar() {
      var f = marco.querySelector('iframe[src*="maps"]');
      if (!f || f.dataset.ggZoom) return;
      f.dataset.ggZoom = '1';
      f.src = 'https://www.google.com/maps?q=' + destino + '&z=15&hl=' + lang + '&output=embed';
      f.setAttribute('allowfullscreen', '');
    }
    acercar();
    // el iframe ya existe y le cambian el src al pulsar "ver mapa": hay que
    // vigilar tambien los atributos, no solo los nodos nuevos
    new MutationObserver(acercar).observe(marco, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['src']
    });

    var a = document.createElement('a');
    a.className = 'gg-como-llegar';
    a.href = 'https://www.google.com/maps/dir/?api=1&destination=' + destino;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = (textos[lang] || textos.en) + ' →';
    marco.parentElement.appendChild(a);
  }

  // 10) Version clara (beige) UNICA desde el 20-oct: fuera la verde y el
  //     interruptor. La clase gg-claro va fija en <html> de cada pagina; aqui
  //     solo se repone por si acaso y se borra la eleccion vieja guardada.
  function initTema() {
    document.documentElement.classList.add('gg-claro');
    try { localStorage.removeItem('gg-tema'); } catch (e) {}
    // la unica cursiva que se conserva en B: el subtitulo del hero de la portada
    var sub = fotoPortada() &&   // solo en la portada
              document.querySelector('main > section:first-of-type p.font-serif');
    if (sub) sub.classList.add('gg-cursiva-ok');

    // el menu movil no marca la pagina actual: se marca aqui comparando rutas
    var aqui = location.pathname.replace(/index\.html$/, '');
    [].forEach.call(document.querySelectorAll('#mobile-menu a.mobile-link'), function (a) {
      var ruta = a.pathname.replace(/index\.html$/, '');
      if (ruta === aqui) a.classList.add('gg-activo');
    });
  }

  // 11) Final de la portada (17-sep, Elena): cerrar la pagina con una banda de
  //     granos con el borde recortado por el contorno de los granos, como la
  //     de arriba pero SIN degradado. Se usa la misma foto recortada, volteada
  //     para que el borde roto quede arriba. Pendiente: foto de granos TOSTADOS
  //     del cliente; cuando llegue se hace su azulejo (panorama-cascara.mjs).
  function initBeansFoot() {
    var band = fotoPortada();
    var main = document.querySelector('main');
    if (!band || !main || main.querySelector('.gg-beans-foot')) return;
    var sec = document.createElement('section');
    sec.className = 'gg-beans-foot';
    sec.setAttribute('aria-hidden', 'true');
    // (21-sep tarde) granos TOSTADOS de la muestra que mando Elena, con borde roto
    // (volteado por css: el borde queda arriba). (3-oct, Josu: "como antes pero que
    // no se note tan artificial") el azulejo de 510 px se repetia cada pocos cm; ahora
    // es una tira de 3480 px con el mismo trozo en 8 posiciones cosidas sin que se
    // note (tostado-largo.mjs) y su borde roto (borde-granos.mjs). (4-oct: se probo un
    // borde "derramado", borde-derramado.mjs, y Josu prefirio esta version.) 4-oct, "que
    // no haya huecos vacios": borde-pie.mjs, granos enteros pegados, sin muescas.
    // 5-oct, Josu: "mas limpio, no como copia pega"; la version con borde de granos de la foto
    // grande (borde-pie-grande.mjs) le parecio peor (granos grandes, borde irregular). Ahora
    // borde RECTO, sin recortar granos (tostado-recto.mjs: dos fotos de la misma sesion, granos
    // de ~45 px, tira de ~3500 px de pantalla sin repetir) con la linea beige de la web y una
    // sombra interior (css bloque 33). 720 filas para pantallas densas, 420 para las normales.
    // 7-oct, Elena (WhatsApp 6-oct 20:46, raya verde ondulada + foto de ejemplo): "los granos como en el
    // ejemplo, incluso hay una sombra al fondo". Granos tostados fotografiados sobre BLANCO (Unsplash
    // XO_8kk_8x2s, pie-blanco.mjs) con el blanco pasado a transparente: el borde de arriba son los granos
    // enteros con su silueta y su sombra real sobre el color de la web, sin recortar ninguno. El pie recto
    // del 5-oct (tostado-recto-*, css bloque 33) queda en los archivos por si hay que volver.
    var base = (band.getAttribute('src') || '').split('custom/')[0];
    // 7-oct (2), Josu: 'respeta la linea que han marcado'. Ya no es un azulejo: UNA imagen con la proporcion
    // de la franja de su captura, cuyo borde de granos sigue la raya verde de Elena (pie-natural.mjs: tramos
    // de la foto elegidos por su borde natural, ningun grano cortado). Ocupa el ancho de la pantalla.
    sec.className += ' gg-pie-natural';
    var img = document.createElement('div');
    img.className = 'gg-tile';
    sec.appendChild(img);
    main.appendChild(sec);
    var filas = sec.getBoundingClientRect().height * (window.devicePixelRatio || 1);
    // 7-oct (3), Elena: 'pegar tres asi juntos en una tira, para que quede mas larga; si no, parece que esta
    // con zoom'. Tira con la raya tres veces (pie-tira3-*, granos distintos en cada copia); en movil solo la
    // copia del medio, que es lo que se ve.
    sec.classList.add('gg-pie-tira');
    var anchoPx = window.innerWidth * (window.devicePixelRatio || 1);
    var nombreTira = window.innerWidth < 700 ? 'pie-tira3-movil-1800' : 'pie-tira3-' + (anchoPx > 2400 ? 3600 : anchoPx > 1600 ? 2400 : 1600);
    img.style.backgroundImage = 'url(' + base + 'custom/' + nombreTira + '.webp)';
  }

  // 12) 17-sep, Elena: (a) los rotulos "Tour de cafe" / "Eventos" junto a las
  //     ventanas de foto, como botones verdes; (b) huellas de conejo de fondo
  //     en esa seccion, que quedaba vacia a los lados.
  // Rastro del conejo: puntos de paso segun la maqueta + un lazo, curva suave por ellos y
  // un salto (dos patas traseras largas delante, dos delanteras pequenas detras) cada PASO px.
  function dibujarHuellas(sec, svg) {
    var o = sec.getBoundingClientRect();
    var R = function (e) {
      var q = e.getBoundingClientRect();
      return { l: q.left - o.left, t: q.top - o.top, r: q.right - o.left, b: q.bottom - o.top,
               cx: (q.left + q.right) / 2 - o.left, cy: (q.top + q.bottom) / 2 - o.top };
    };
    var btns = sec.querySelectorAll('.gg-card-btn > span'), wins = sec.querySelectorAll('.gg-card-win');
    if (btns.length < 2 || wins.length < 2) return;
    var b1 = R(btns[0]), b2 = R(btns[1]), w1 = R(wins[0]);
    var W = o.width, H = o.height, movil = W < 600;
    var esc = movil ? 0.7 : 0.85, PASO = movil ? 40 : 50, rad = movil ? 42 : 55;
    var p = [], lazo;
    if (b2.t < b1.b) {
      // ordenador, en fila: sale del boton del tour hacia la derecha, lazo en el hueco de debajo
      var mid = (b1.r + R(wins[1]).l) / 2;
      p.push([b1.r + 16, b1.cy], [mid - 12, b1.cy + 34]);
      lazo = [mid, b1.b + 14 + rad];
      p.push.apply(p, circulo(lazo, rad));
      p.push([lazo[0] - rad - 50, H - 34], [w1.r - 60, H - 30], [w1.l + 40, H - 28], [-30, H - 40]);
    } else if (!movil) {
      // tablet: como el dibujo de Elena. Derecha desde el boton del tour, baja por la derecha
      // del boton de eventos y hace el lazo debajo
      var x = Math.min(W - 60, b2.r + Math.max(60, (W - b2.r) / 2));
      p.push([b1.r + 16, b1.cy], [b1.r + (W - b1.r) * 0.45, b1.cy + 40], [x, (b1.b + b2.t) / 2 + 20], [x - 10, b2.cy]);
      lazo = [Math.min(W - rad - 20, x - 20), b2.b + 16 + rad];
      p.push.apply(p, circulo(lazo, rad));
      p.push([lazo[0] - rad - 60, H - 34], [b2.l - 40, H - 30], [-30, H - 40]);
    } else {
      // movil: las tarjetas ocupan todo el ancho; el rastro entra por la derecha en el hueco
      // de debajo de la segunda tarjeta, hace el lazo y sale por la izquierda
      var fondo = R(btns[1].closest('a') || btns[1]).b;
      rad = 34;
      lazo = [W * 0.62, fondo + 12 + rad];
      p.push([W + 30, fondo + 20], [W * 0.62 + rad + 30, fondo + 16]);
      p.push.apply(p, circulo(lazo, rad));
      p.push([W * 0.62 - rad - 40, H - 22], [-30, H - 26]);
    }
    // curva Catmull-Rom abierta por los puntos, muestreada fina para medir longitudes
    var fino = [];
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      for (var k = 0; k < 24; k++) {
        var u = k / 24, u2 = u * u, u3 = u2 * u;
        fino.push([0, 1].map(function (c) {
          return 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 +
                 (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3);
        }));
      }
    }
    fino.push(p[p.length - 1]);
    var g = '', recorrido = 0, sig = 10;
    for (var j = 1; j < fino.length; j++) {
      var a = fino[j - 1], c2 = fino[j], d = Math.hypot(c2[0] - a[0], c2[1] - a[1]);
      recorrido += d;
      if (recorrido < sig) continue;
      sig += PASO;
      if (c2[0] < -10 || c2[1] < -10 || c2[0] > W + 10 || c2[1] > H + 10) continue;
      var ang = Math.atan2(c2[1] - a[1], c2[0] - a[0]) * 180 / Math.PI;
      g += '<g transform="translate(' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ') rotate(' + ang.toFixed(1) +
           ') scale(' + esc + ')"><ellipse cx="14" cy="-9" rx="11" ry="4.2"/><ellipse cx="14" cy="9" rx="11" ry="4.2"/>' +
           '<circle cx="-12" cy="-3" r="3.6"/><circle cx="-26" cy="4" r="3.6"/></g>';
    }
    svg.setAttribute('viewBox', '0 0 ' + Math.round(W) + ' ' + Math.round(H));
    svg.innerHTML = g;
  }
  // lazo: vuelta entera en el sentido de las agujas del reloj empezando por arriba (se cruza al salir)
  function circulo(c, r) {
    var out = [];
    for (var a = -90; a <= 270; a += 45) {
      out.push([c[0] + r * Math.cos(a * Math.PI / 180), c[1] + r * Math.sin(a * Math.PI / 180)]);
    }
    return out;
  }

  function initTarjetasYHuellas() {
    var wins = document.querySelectorAll('.gg-card-win');
    if (!wins.length) return;
    var sec = wins[0].closest('section');
    [].forEach.call(wins, function (w) {
      var a = w.closest('a');
      if (a) a.classList.add('gg-card-btn');
    });
    if (sec && !sec.querySelector('.gg-huellas')) {
      sec.classList.add('gg-sec-huellas');
      // (26-oct) Elena: "las huellas del conejito se pueden hacer formando un bucle" (dibujo en
      // rojo: salen del boton del tour, van a la derecha, bajan y hacen un lazo abajo). Antes
      // era una imagen fija estirada a la seccion (huellas-conejo.svg) y el rastro no se leia.
      // Ahora el rastro se calcula con las posiciones reales de fotos y botones (ordenador:
      // en fila; tablet y movil: una debajo de otra) y se redibuja al cambiar el tamano.
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'gg-huellas');
      svg.setAttribute('aria-hidden', 'true');
      sec.insertBefore(svg, sec.firstChild);
      var dibujar = function () { dibujarHuellas(sec, svg); };
      dibujar();
      if (window.ResizeObserver) new ResizeObserver(function () {
        clearTimeout(sec._ggHuellas); sec._ggHuellas = setTimeout(dibujar, 120);
      }).observe(sec);
      [].forEach.call(sec.querySelectorAll('img'), function (im) {
        if (!im.complete) im.addEventListener('load', dibujar, { once: true });
      });
    }
  }

  // 13) 26-oct, Elena: en ordenador faltaba el "papel pintado" en Experiencia (historia del
  //     cafe con la mano de cerezas, "Fertile soils" / "From coffee cherry to gourmet product"
  //     y las preguntas frecuentes): "hay que hacerlo igual que" en The Coffee Tour de la
  //     portada, que es el dibujo de ramas pattern-06 repetido (css bloque 41).
  function initPapelExperiencia() {
    if (!document.querySelector('main img[src*="plantation-view"]')) return;   // solo Experiencia
    var secciones = [];
    ['plantation-view', 'finca-landscape', 'finca-plants'].forEach(function (nombre) {
      var img = document.querySelector('main img[src*="' + nombre + '"]');
      if (img && img.closest('section')) secciones.push(img.closest('section'));
    });
    var faq = document.querySelector('main section details');
    if (faq) secciones.push(faq.closest('section'));
    secciones.forEach(function (s) { s.classList.add('gg-papel'); });
  }

  function init() {
    initTema(); initBeansFoot(); initTarjetasYHuellas();
    initSteam(); initNews(); initIlustracion(); initBeansFade();
    initFotosExperiencia(); initFotosHistoria();
    initSinGaleriaHome(); initNotaIdioma(); initMapa(); initPapelExperiencia();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
  document.addEventListener('astro:page-load', init);
})();
