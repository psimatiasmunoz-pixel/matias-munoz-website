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

  async function syncToDrive(envelope) {
    const driveWebhookUrl = getDriveWebhookUrl();
    if (!driveWebhookUrl) {
      return {
        status: 'skipped',
        message: 'drive webhook not configured',
        path: envelope.drive_target_path
      };
    }

    const response = await fetch(driveWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rootFolderName: envelope.drive_root_folder,
        patientFolderName: envelope.patient_slug,
        payload: envelope
      })
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
      supabaseUrl + '/rest/v1/' + SUPABASE_TABLE + '?on_conflict=session_id',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': 'Bearer ' + supabaseAnonKey,
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify([envelope])
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error('Supabase error: ' + response.status + ' ' + text);
    }

    return response.json();
  }

  async function saveRecord(payload, options) {
    const settings = options || {};
    const envelope = buildEnvelope(payload);
    let driveResult = {
      status: 'skipped',
      message: 'drive webhook not configured',
      path: envelope.drive_target_path
    };

    try {
      driveResult = await syncToDrive(envelope);
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

    const supabaseRows = await saveToSupabase(envelope);

    if (!settings.silent) {
      if (driveResult.status === 'error') {
        toast('Guardado en Supabase, pero la sync a Drive fallo.', 'warn');
      } else if (driveResult.status === 'synced') {
        toast('Resultados guardados en Supabase y enviados a Drive.', 'success');
      } else {
        toast('Resultados guardados en Supabase.', 'success');
      }
    }

    return {
      rows: supabaseRows,
      envelope: envelope,
      drive: driveResult
    };
  }

  window.PsychPersistence = {
    getSessionId: getSessionId,
    saveRecord: saveRecord,
    toast: toast,
    config: {
      supabaseUrl: getSupabaseUrl(),
      supabaseTable: SUPABASE_TABLE,
      driveWebhookConfigured: Boolean(getDriveWebhookUrl()),
      driveRootFolder: getDriveRootFolder()
    }
  };
}());
