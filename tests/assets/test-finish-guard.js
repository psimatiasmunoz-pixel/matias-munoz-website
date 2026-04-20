/**
 * test-finish-guard.js — Suite Psicométrica Matias Muñoz
 *
 * Módulo compartido que:
 *  1. Captura el HTML completo del informe (canvases → base64 img)
 *  2. Oculta la pantalla de resultados al evaluado
 *  3. Muestra la pantalla de agradecimiento/confirmación
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // HTML de la pantalla de agradecimiento (inyectada en cada test)
  // ------------------------------------------------------------------
  var THANKS_HTML = [
    '<div id="stepThanks" class="hidden" style="',
    '  display:none;text-align:center;padding:56px 32px;max-width:600px;margin:0 auto;',
    '">',
    '  <div style="',
    '    width:88px;height:88px;border-radius:50%;margin:0 auto 28px;',
    '    display:flex;align-items:center;justify-content:center;',
    '    background:rgba(16,163,157,0.14);border:2px solid rgba(16,163,157,0.3);',
    '    font-size:42px;animation:psyPop .45s cubic-bezier(.34,1.56,.64,1) both;',
    '  ">✅</div>',
    '  <h2 style="',
    '    font-size:1.7rem;font-weight:800;margin-bottom:14px;',
    '    background:linear-gradient(135deg,#fff,#87ece5);',
    '    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
    '  ">Evaluación registrada</h2>',
    '  <p style="color:#9898b2;font-size:1rem;line-height:1.8;max-width:44ch;margin:0 auto 28px;">',
    '    Tu evaluación ha sido registrada de forma segura. El profesional tratará tus resultados con absoluta confidencialidad.',
    '  </p>',
    '  <div style="',
    '    display:inline-flex;align-items:center;gap:10px;',
    '    padding:14px 24px;border-radius:99px;',
    '    background:rgba(16,163,157,0.12);border:1px solid rgba(16,163,157,0.24);',
    '    color:#87ece5;font-size:13px;font-weight:600;',
    '  ">',
    '    <span>🔒</span>',
    '    <span>Los resultados son de uso exclusivo del evaluador</span>',
    '  </div>',
    '  <style>',
    '    @keyframes psyPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}',
    '  </style>',
    '</div>'
  ].join('');

  // ------------------------------------------------------------------
  // Captura el HTML del informe, incluyendo canvases como imágenes base64
  // ------------------------------------------------------------------
  function captureReportHtml(container) {
    if (!container) return '';

    // Clonar el nodo para no alterar el DOM original
    var clone = container.cloneNode(true);

    // Convertir cada canvas a una imagen base64
    var origCanvases = container.querySelectorAll('canvas');
    var cloneCanvases = clone.querySelectorAll('canvas');
    origCanvases.forEach(function (canvas, i) {
      try {
        var img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        if (cloneCanvases[i] && cloneCanvases[i].parentNode) {
          cloneCanvases[i].parentNode.replaceChild(img, cloneCanvases[i]);
        }
      } catch (e) { /* canvas cross-origin, se omite */ }
    });

    // Ocultar botones de "no imprimir"
    clone.querySelectorAll('.no-print, [class*="no-print"]').forEach(function (el) {
      el.style.display = 'none';
    });

    // Recopilar todos los estilos de la página
    var styleText = 'body{margin:20px;font-family:Arial,Helvetica,sans-serif;background:#fff!important;color:#000!important;}\n';
    try {
      Array.from(document.styleSheets).forEach(function (sheet) {
        try {
          Array.from(sheet.cssRules || []).forEach(function (rule) {
            styleText += rule.cssText + '\n';
          });
        } catch (e) { /* cross-origin stylesheet */ }
      });
    } catch (e) {}

    var pageTitle = (document.querySelector('h1') || {}).textContent || 'Informe Psicométrico';

    return [
      '<!DOCTYPE html>',
      '<html lang="es">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width,initial-scale=1">',
      '  <title>' + pageTitle + ' — Informe</title>',
      '  <style>' + styleText + '</style>',
      '</head>',
      '<body>',
      clone.innerHTML,
      '</body>',
      '</html>'
    ].join('\n');
  }

  // ------------------------------------------------------------------
  // Inyecta la pantalla de agradecimiento en el DOM si no existe
  // ------------------------------------------------------------------
  function injectThanksStep() {
    if (document.getElementById('stepThanks')) return;
    var wrapper = document.querySelector('.container, .shell, main, body');
    if (!wrapper) return;
    var div = document.createElement('div');
    div.innerHTML = THANKS_HTML;
    while (div.firstChild) {
      wrapper.appendChild(div.firstChild);
    }
  }

  // API pública
  window.TestFinishGuard = {
    seal: function (containerId) {
      var container = document.getElementById(containerId);
      var html = captureReportHtml(container);

      // Asegurar que la pantalla de agradecimiento existe
      injectThanksStep();

      // Ocultar TODOS los pasos
      document.querySelectorAll('[id^="step"]').forEach(function (el) {
        if (el.id !== 'stepThanks') {
          el.classList.add('hidden');
          el.style.display = 'none';
        }
      });

      // Mostrar la pantalla de agradecimiento
      var thanks = document.getElementById('stepThanks');
      if (thanks) {
        thanks.classList.remove('hidden');
        thanks.style.display = '';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return html;
    },

    // Captura HTML de un contenedor sin alterar la vista (útil para Rorschach)
    _captureContainerHtml: function (containerEl) {
      return captureReportHtml(containerEl);
    }
  };

  // Inyectar al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectThanksStep);
  } else {
    injectThanksStep();
  }
}());
