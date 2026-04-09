# Integraciones de la suite psicometrica

## Supabase

1. Abre el SQL Editor de tu proyecto Supabase.
2. Ejecuta `integrations/supabase/psychological_test_results.sql`.
3. La suite empezara a guardar resultados en la tabla `psychological_test_results`.

## Google Drive

1. Crea un proyecto de Google Apps Script.
2. Copia `integrations/google-drive/Code.gs`.
3. Despliega el script como Web App.
4. Copia la URL generada y pegala en `tests/assets/integrations-config.js` dentro de `window.__PSY_DRIVE_WEBHOOK_URL`.

La primera vez que llegue un resultado, el script creara en Drive la carpeta `web psicologica`, una subcarpeta por paciente y un archivo JSON por sesion.
