(function () {
  const DEFAULT_SUPABASE_URL = 'https://dgdjqsjixcqlyfvjaliu.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_0IvHQ07oUY3Idj_GRpO8pw__gDXAs95';
  const SUPABASE_TABLE = 'psychological_test_results';
  const DEFAULT_ROOT_DRIVE_FOLDER = 'web psicologica';
  const TOAST_STYLE_ID = 'psyPersistenceToastStyle';
  const TOAST_WRAP_ID = 'psyPersistenceToastWrap';

  function getSupabaseUrl() {
    return window.__PSY_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  }

  function getSupabaseAnonKey() {
    return window.__PSY_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  }

  function getDriveWebhookUrl() {
    return window.__PSY_DRIVE_WEBHOOK_URL || '';
  }

  function getDriveRootFolder() {
    return window.__PSY_DRIVE_ROOT_FOLDER || DEFAULT_ROOT_DRIVE_FOLDER;
  }

  function isSupabaseEnabled() {
    return window.__PSY_ENABLE_SUPABASE !== false;
  }

  function slugify(value) {
    return String(value || 'sin_nombre')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80) || 'sin_nombre';
  }

  function safeText(value, fallback) {
    const text = String(value || '').trim();
    return text || (fallback || '');
  }

  function ensureToastUi() {
    if (!document.getElementById(TOAST_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = TOAST_STYLE_ID;
      style.textContent = [
        '.psy-toast-wrap{position:fixed;left:18px;bottom:18px;z-index:10001;display:grid;gap:10px;max-width:min(380px,calc(100vw - 36px))}',
        '.psy-toast{padding:12px 14px;border-radius:16px;background:#10222f;color:#f7fbfb;border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.2);font:500 13px/1.45 Inter,system-ui,sans-serif}',
        '.psy-toast.success{background:#113227}',
        '.psy-toast.warn{background:#452f11}',
        '.psy-toast.error{background:#4b1f28}'
      ].join('');
      document.head.appendChild(style);
    }

    let wrap = document.getElementById(TOAST_WRAP_ID);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = TOAST_WRAP_ID;
      wrap.className = 'psy-toast-wrap';
      document.body.appendChild(wrap);
    }

    return wrap;
  }

  function toast(message, variant) {
    const wrap = ensureToastUi();
    const node = document.createElement('div');
    node.className = 'psy-toast' + (variant ? ' ' + variant : '');
    node.textContent = message;
    wrap.appendChild(node);
    window.setTimeout(function () {
      node.remove();
      if (!wrap.children.length) {
        wrap.remove();
      }
    }, 3200);
  }

  function getSessionId(testCode) {
    const key = 'psy_test_session:' + testCode + ':' + window.location.pathname;
    let value = window.sessionStorage.getItem(key);
    if (!value) {
      value = [testCode, Date.now(), Math.random().toString(36).slice(2, 10)].join('_');
      window.sessionStorage.setItem(key, value);
    }
    return value;
  }

  function buildEnvelope(payload) {
    const patientName = safeText(
      payload.patient && (payload.patient.name || payload.patient.nameOrCode || payload.patient.code),
      'Paciente sin nombre'
    );
    const patientSlug = slugify(patientName);
    const appliedAt = payload.appliedAt || new Date().toISOString();
    const rootDriveFolder = getDriveRootFolder();

    return {
      session_id: payload.sessionId || getSessionId(payload.testCode),
      test_code: payload.testCode,
      patient_name: patientName,
      patient_slug: patientSlug,
      applied_at: appliedAt,
      site_origin: window.location.origin,
      status: payload.status || 'completed',
      summary: safeText(payload.summary, ''),
      patient_data: payload.patient || {},
      raw_data: payload.rawData || {},
      result_data: payload.resultData || {},
      drive_root_folder: rootDriveFolder,
      drive_sync_status: 'pending',
      drive_sync_message: 'drive webhook not configured',
      drive_target_path: rootDriveFolder + '/' + patientSlug
    };
  }

  async function syncToDrive(envelope, reportHtml) {
    const driveWebhookUrl = getDriveWebhookUrl();
    if (!driveWebhookUrl) {
      return {
        status: 'skipped',
        message: 'drive webhook not configured',
        path: envelope.drive_target_path
      };
    }

    const requestBody = {
      rootFolderName: envelope.drive_root_folder,
      patientFolderName: envelope.patient_slug,
      reportHtml: reportHtml || '',
      payload: envelope
    };

    // Google Apps Script web apps commonly reject browser preflight requests.
    // Send a simple opaque POST so the request can still reach doPost from GitHub Pages.
    if (/script\.google\.com\/macros\/s\//i.test(driveWebhookUrl)) {
      await fetch(driveWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(requestBody)
      });

      return {
        status: 'submitted',
        message: 'drive request submitted from browser',
        path: envelope.drive_target_path
      };
    }

    const response = await fetch(driveWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error('Drive webhook error: ' + response.status + ' ' + text);
    }

    const data = await response.json().catch(function () { return {}; });
    return {
      status: data.status || 'synced',
      message: data.message || 'drive synced',
      path: data.path || envelope.drive_target_path
    };
  }

  async function saveToSupabase(envelope) {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    const response = await fetch(
      supabaseUrl + '/rest/v1/' + SUPABASE_TABLE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': 'Bearer ' + supabaseAnonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify([envelope])
      }
    );

    if (response.ok) {
      return { mode: 'inserted' };
    }

    if (response.status !== 409) {
      const text = await response.text();
      throw new Error('Supabase error: ' + response.status + ' ' + text);
    }

    const patchResponse = await fetch(
      supabaseUrl + '/rest/v1/' + SUPABASE_TABLE + '?session_id=eq.' + encodeURIComponent(envelope.session_id),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': 'Bearer ' + supabaseAnonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(envelope)
      }
    );

    if (!patchResponse.ok) {
      const patchText = await patchResponse.text();
      throw new Error('Supabase error: ' + patchResponse.status + ' ' + patchText);
    }

    return { mode: 'updated' };
  }

  async function saveRecord(payload, options) {
    const settings = options || {};
    const envelope = buildEnvelope(payload);
    const supabaseEnabled = isSupabaseEnabled();
    let driveResult = {
      status: 'skipped',
      message: 'drive webhook not configured',
      path: envelope.drive_target_path
    };
    let supabaseRows = null;
    let supabaseError = null;

    try {
      driveResult = await syncToDrive(envelope, payload.reportHtml || '');
    } catch (error) {
      driveResult = {
        status: 'error',
        message: error.message,
        path: envelope.drive_target_path
      };
    }

    envelope.drive_sync_status = driveResult.status;
    envelope.drive_sync_message = driveResult.message;
    envelope.drive_target_path = driveResult.path || envelope.drive_target_path;

    if (supabaseEnabled) {
      try {
        supabaseRows = await saveToSupabase(envelope);
      } catch (error) {
        supabaseError = error;
      }
    }

    const driveSaved = driveResult.status === 'synced' || driveResult.status === 'submitted';
    const supabaseSaved = Boolean(supabaseRows);
    const anySaved = driveSaved || supabaseSaved;

    if (!settings.silent) {
      if (driveSaved && !supabaseEnabled) {
        if (driveResult.status === 'submitted') {
          toast('Resultados enviados a Drive para procesamiento. Supabase queda pendiente.', 'success');
        } else {
          toast('Resultados enviados a Drive. Supabase queda pendiente.', 'success');
        }
      } else if (driveSaved && supabaseError) {
        if (driveResult.status === 'submitted') {
          toast('Resultados enviados a Drive para procesamiento. Supabase sigue pendiente.', 'warn');
        } else {
          toast('Resultados enviados a Drive. Supabase sigue pendiente.', 'warn');
        }
      } else if (driveResult.status === 'error' && supabaseSaved) {
        toast('Guardado en Supabase, pero la sync a Drive fallo.', 'warn');
      } else if (driveSaved && supabaseSaved) {
        if (driveResult.status === 'submitted') {
          toast('Resultados guardados en Supabase y enviados a Drive para procesamiento.', 'success');
        } else {
          toast('Resultados guardados en Supabase y enviados a Drive.', 'success');
        }
      } else if (supabaseSaved) {
        toast('Resultados guardados en Supabase.', 'success');
      } else if (driveResult.status === 'error') {
        toast('No se pudo guardar el resultado ni en Drive ni en Supabase.', 'error');
      } else {
        toast('No hay un destino de guardado configurado.', 'warn');
      }
    }

    if (!anySaved) {
      const parts = [];
      if (driveResult.status === 'error') {
        parts.push(driveResult.message);
      }
      if (supabaseError) {
        parts.push(supabaseError.message);
      }
      if (!supabaseEnabled && driveResult.status !== 'synced') {
        parts.push('supabase disabled');
      }
      throw new Error(parts.join(' | ') || 'No persistence target succeeded');
    }

    return {
      rows: supabaseRows,
      envelope: envelope,
      drive: driveResult,
      supabase: {
        enabled: supabaseEnabled,
        saved: supabaseSaved,
        error: supabaseError ? supabaseError.message : null
      }
    };
  }

  window.PsychPersistence = {
    getSessionId: getSessionId,
    saveRecord: saveRecord,
    toast: toast,
    config: {
      supabaseUrl: getSupabaseUrl(),
      supabaseTable: SUPABASE_TABLE,
      supabaseEnabled: isSupabaseEnabled(),
      driveWebhookConfigured: Boolean(getDriveWebhookUrl()),
      driveRootFolder: getDriveRootFolder()
    }
  };
}());
