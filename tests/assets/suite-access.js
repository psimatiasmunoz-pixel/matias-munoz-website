(function () {
  const script = document.currentScript;
  const isGate = script && script.dataset.suiteGate === 'true';
  const isGuard = script && script.dataset.suiteGuard === 'true';
  const suiteHome = (script && script.dataset.suiteHome) || '../';
  const landingHref = (script && script.dataset.landingHref) || '../index.html';

  const ACCESS_CODE = 'psi.matiasmunoz';
  const STORAGE_KEY = 'suite_psicometrica_access';
  const EXPIRY_MS = 6 * 60 * 60 * 1000;
  let protectionInstalled = false;

  function readSession() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function hasValidAccess() {
    const session = readSession();
    return Boolean(session && session.granted === true && Number(session.expiresAt) > Date.now());
  }

  function grantAccess() {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        granted: true,
        expiresAt: Date.now() + EXPIRY_MS
      })
    );
  }

  function clearAccess() {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  function redirectToGate() {
    document.documentElement.style.display = 'none';
    window.location.replace(suiteHome + 'index.html?denied=1');
  }

  function ensureUiStyles() {
    if (document.getElementById('suiteAccessUi')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'suiteAccessUi';
    style.textContent = [
      '.suite-toolbar{position:fixed;top:18px;right:18px;z-index:9999;display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:999px;background:rgba(9,18,30,.82);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 36px rgba(0,0,0,.28)}',
      '.suite-toolbar a,.suite-toolbar button{font:600 12px/1 Inter,system-ui,sans-serif;color:#f5fbfb;text-decoration:none;border:none;background:none;cursor:pointer}',
      '.suite-toolbar-link{padding:9px 12px;border-radius:999px;background:rgba(16,163,157,.18)}',
      '.suite-toolbar-link-alt{background:rgba(212,152,42,.18)}',
      '.suite-toolbar-btn{padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.08)}',
      '.suite-toast-wrap{position:fixed;left:18px;bottom:18px;z-index:10000;display:grid;gap:10px;max-width:min(360px,calc(100vw - 36px))}',
      '.suite-toast{padding:12px 14px;border-radius:16px;background:#10222f;color:#f7fbfb;border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.2);font:500 13px/1.45 Inter,system-ui,sans-serif}',
      '.suite-toast.warn{background:#452f11}',
      '.suite-toast.error{background:#4b1f28}',
      '@media (max-width: 720px){.suite-toolbar{top:auto;right:12px;bottom:12px;left:12px;justify-content:space-between;flex-wrap:wrap;border-radius:20px}.suite-toolbar a,.suite-toolbar button{flex:1 1 auto;text-align:center}}'
    ].join('');
    document.head.appendChild(style);
  }

  function showToast(message, variant) {
    ensureUiStyles();

    let wrap = document.getElementById('suiteToastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'suiteToastWrap';
      wrap.className = 'suite-toast-wrap';
      document.body.appendChild(wrap);
    }

    const toast = document.createElement('div');
    toast.className = 'suite-toast' + (variant ? ' ' + variant : '');
    toast.textContent = message;
    wrap.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
      if (!wrap.children.length) {
        wrap.remove();
      }
    }, 2600);
  }

  function installProtection() {
    if (protectionInstalled) {
      return;
    }
    protectionInstalled = true;

    document.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      showToast('Acceso protegido: el menú contextual está deshabilitado.', 'warn');
    });

    document.addEventListener('keydown', function (event) {
      const key = String(event.key || '').toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      const blocked =
        key === 'f12' ||
        (command && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (command && (key === 'u' || key === 's'));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        showToast('Este entorno de evaluación tiene atajos de inspección bloqueados.', 'warn');
      }
    });

    document.addEventListener('dragstart', function (event) {
      const target = event.target;
      if (target && target.tagName === 'IMG') {
        event.preventDefault();
      }
    });
  }

  function injectToolbar() {
    if (!document.body || document.getElementById('suiteToolbar')) {
      return;
    }

    ensureUiStyles();

    const toolbar = document.createElement('div');
    toolbar.id = 'suiteToolbar';
    toolbar.className = 'suite-toolbar';
    toolbar.innerHTML =
      '<a class="suite-toolbar-link" href="' + suiteHome + 'index.html">Panel de tests</a>' +
      '<a class="suite-toolbar-link suite-toolbar-link-alt" href="' + landingHref + '">Sitio principal</a>' +
      '<button class="suite-toolbar-btn" type="button" id="suiteLogoutBtn">Cerrar acceso</button>';

    document.body.appendChild(toolbar);

    const logoutBtn = document.getElementById('suiteLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        clearAccess();
        window.location.href = suiteHome + 'index.html';
      });
    }
  }

  function syncGateState() {
    const cards = document.querySelectorAll('[data-suite-card]');
    const links = document.querySelectorAll('[data-suite-link]');
    const statuses = document.querySelectorAll('[data-suite-status]');
    const lockStatus = document.getElementById('lockStatus');
    const unlocked = hasValidAccess();

    cards.forEach(function (card) {
      card.classList.toggle('is-unlocked', unlocked);
      card.classList.toggle('is-locked', !unlocked);
    });

    links.forEach(function (link) {
      link.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
      link.tabIndex = unlocked ? 0 : -1;
    });

    statuses.forEach(function (status) {
      status.textContent = unlocked ? 'Disponible' : 'Bloqueado';
    });

    if (lockStatus) {
      lockStatus.textContent = unlocked
        ? 'Acceso habilitado durante 6 horas en este navegador.'
        : 'Los instrumentos se habilitan tras ingresar el código profesional.';
    }
  }

  function bindGate() {
    ensureUiStyles();
    installProtection();

    const form = document.getElementById('accessForm');
    const input = document.getElementById('accessInput');
    const message = document.getElementById('accessMessage');
    const logout = document.getElementById('logoutAccess');
    const denied = new URLSearchParams(window.location.search).get('denied') === '1';

    function setMessage(text, variant) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.dataset.variant = variant || '';
    }

    if (denied) {
      setMessage('Necesitas ingresar el código para abrir cualquier instrumento de la suite.', 'error');
    } else if (hasValidAccess()) {
      setMessage('La sesión profesional ya está activa. Puedes abrir cualquiera de los tests.', 'ok');
    }

    syncGateState();

    document.querySelectorAll('[data-suite-link]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (!hasValidAccess()) {
          event.preventDefault();
          setMessage('Primero ingresa el código profesional para desbloquear los instrumentos.', 'error');
          showToast('Introduce el código para habilitar la suite.', 'error');
          if (input) {
            input.focus();
          }
        }
      });
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const code = input ? input.value.trim() : '';

        if (code === ACCESS_CODE) {
          grantAccess();
          syncGateState();
          setMessage('Acceso concedido. La suite quedó habilitada por 6 horas.', 'ok');
          showToast('Acceso habilitado correctamente.');
          form.reset();
          return;
        }

        setMessage('Código incorrecto. Verifica la clave profesional e inténtalo nuevamente.', 'error');
        showToast('Código incorrecto.', 'error');
        if (input) {
          input.focus();
          input.select();
        }
      });
    }

    if (logout) {
      logout.addEventListener('click', function () {
        clearAccess();
        syncGateState();
        setMessage('Sesión cerrada. Los tests volvieron a quedar bloqueados.', 'warn');
      });
    }
  }

  if (isGuard && !hasValidAccess()) {
    redirectToGate();
    return;
  }

  installProtection();

  if (isGate) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindGate, { once: true });
    } else {
      bindGate();
    }
  }

  if (isGuard) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectToolbar, { once: true });
    } else {
      injectToolbar();
    }
  }
}());
