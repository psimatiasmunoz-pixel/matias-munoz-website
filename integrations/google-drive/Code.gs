function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'drive webhook activo'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var rootFolderName = body.rootFolderName || 'web psicologica';
    var patientFolderName = body.patientFolderName || 'sin_nombre';
    var payload = body.payload || {};

    var rootFolder = getOrCreateFolder_(DriveApp.getRootFolder(), rootFolderName);
    var patientFolder = getOrCreateFolder_(rootFolder, patientFolderName);
    var fileName = payload.session_id + '.pdf';
    var html = buildPdfHtml_(payload);
    var pdfBlob = Utilities.newBlob(html, MimeType.HTML, payload.session_id + '.html')
      .getAs(MimeType.PDF)
      .setName(fileName);

    upsertPdfFile_(patientFolder, fileName, pdfBlob);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'synced',
        message: 'drive pdf updated',
        path: rootFolderName + '/' + patientFolderName + '/' + fileName
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder_(parent, folderName) {
  var folders = parent.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parent.createFolder(folderName);
}

function upsertPdfFile_(folder, fileName, blob) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    files.next().setTrashed(true);
  }
  folder.createFile(blob);
}

function buildPdfHtml_(payload) {
  var patientName = safeValue_(payload.patient_name || (payload.patient_data && payload.patient_data.name) || 'Paciente sin nombre');
  var title = safeValue_(payload.test_code || 'test').toUpperCase();
  var appliedAt = safeValue_(payload.applied_at || '');
  var summary = safeValue_(payload.summary || 'Sin resumen automatico');
  var patientData = toPrettyJson_(payload.patient_data || {});
  var resultData = toPrettyJson_(payload.result_data || {});
  var rawData = toPrettyJson_(payload.raw_data || {});

  return [
    '<!DOCTYPE html>',
    '<html lang="es"><head><meta charset="utf-8">',
    '<style>',
    'body{font-family:Arial,Helvetica,sans-serif;color:#13212b;padding:28px;line-height:1.45}',
    '.header{border-bottom:2px solid #d6e3ea;padding-bottom:16px;margin-bottom:18px}',
    '.eyebrow{font-size:12px;font-weight:700;color:#4d7284;letter-spacing:.08em;text-transform:uppercase}',
    'h1{font-size:28px;margin:6px 0 0}',
    '.meta{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.card{border:1px solid #d6e3ea;border-radius:12px;padding:14px 16px;background:#f8fbfc;margin-bottom:14px}',
    '.label{font-size:11px;font-weight:700;color:#5d7c8a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}',
    '.value{font-size:14px;color:#13212b;white-space:pre-wrap;word-break:break-word}',
    'pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:#0f1d26;color:#eff7fb;padding:14px;border-radius:10px;overflow:hidden}',
    '</style></head><body>',
    '<div class="header">',
    '<div class="eyebrow">Suite psicometrica</div>',
    '<h1>Resultado ' + escapeHtml_(title) + '</h1>',
    '</div>',
    '<div class="meta">',
    '<div class="card"><div class="label">Paciente</div><div class="value">' + escapeHtml_(patientName) + '</div></div>',
    '<div class="card"><div class="label">Fecha de aplicacion</div><div class="value">' + escapeHtml_(appliedAt) + '</div></div>',
    '</div>',
    '<div class="card"><div class="label">Resumen</div><div class="value">' + escapeHtml_(summary) + '</div></div>',
    '<div class="card"><div class="label">Datos del paciente</div><pre>' + escapeHtml_(patientData) + '</pre></div>',
    '<div class="card"><div class="label">Resultados</div><pre>' + escapeHtml_(resultData) + '</pre></div>',
    '<div class="card"><div class="label">Datos crudos</div><pre>' + escapeHtml_(rawData) + '</pre></div>',
    '</body></html>'
  ].join('');
}

function toPrettyJson_(value) {
  return JSON.stringify(value || {}, null, 2);
}

function safeValue_(value) {
  return String(value == null ? '' : value);
}

function escapeHtml_(value) {
  return safeValue_(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
