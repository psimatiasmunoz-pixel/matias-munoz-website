# Google Drive Sync

Este script crea y mantiene la estructura:

- `web psicologica/`
- `web psicologica/<paciente_slug>/`
- `web psicologica/<paciente_slug>/<session_id>.json`

## Pasos

1. Crear un proyecto de Google Apps Script.
2. Copiar `Code.gs`.
3. Desplegar como Web App.
4. Dar acceso a quien reciba el POST segun tu politica.
5. Definir la URL del Web App en `tests/assets/integrations-config.js`:

```js
window.__PSY_DRIVE_WEBHOOK_URL = 'TU_WEB_APP_URL_AQUI';
```

La suite ya carga ese archivo antes de `tests/assets/test-persistence.js`, asi que no necesitas editar cada test por separado.

## Nota

Sin esa URL, el sitio seguira guardando en Supabase, pero dejara la sincronizacion a Drive marcada como `skipped`.
