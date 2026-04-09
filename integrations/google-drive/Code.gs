function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var rootFolderName = body.rootFolderName || 'web psicologica';
    var patientFolderName = body.patientFolderName || 'sin_nombre';
    var payload = body.payload || {};

    var rootFolder = getOrCreateFolder_(DriveApp.getRootFolder(), rootFolderName);
    var patientFolder = getOrCreateFolder_(rootFolder, patientFolderName);
    var fileName = payload.session_id + '.json';
    var json = JSON.stringify(payload, null, 2);

    upsertFile_(patientFolder, fileName, json, MimeType.PLAIN_TEXT);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'synced',
        message: 'drive file updated',
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

function upsertFile_(folder, fileName, contents, mimeType) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    files.next().setContent(contents);
    return;
  }
  folder.createFile(fileName, contents, mimeType);
}
