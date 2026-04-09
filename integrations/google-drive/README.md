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

Si Supabase aun no esta listo, puedes dejar `window.__PSY_ENABLE_SUPABASE = false` y la suite trabajara solo con Drive.

Si al probar la URL `/exec` aparece el mensaje `No se encontro la funcion de la secuencia de comandos: doPost`, el despliegue activo no esta apuntando al contenido correcto de `Code.gs`. En ese caso hay que volver a pegar ese archivo y redesplegar el Web App.
