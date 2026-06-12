# Nova Web — Proxy Serverless

Proxy para el chatbot de IA de Nova Web. Oculta la API key de Anthropic del navegador.

---

## Estructura del proyecto

```
novaweb-proxy/
├── api/
│   └── chat.js       ← función serverless (el proxy)
├── vercel.json       ← configuración de Vercel
├── package.json
└── .gitignore
```

---

## Despliegue en Vercel (5 minutos, gratis)

### Paso 1 — Sube el código a GitHub

1. Ve a https://github.com/new y crea un repositorio nuevo (puedes llamarlo `novaweb-proxy`)
2. En tu ordenador, abre una terminal en la carpeta `novaweb-proxy/` y ejecuta:

```bash
git init
git add .
git commit -m "Initial proxy"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/novaweb-proxy.git
git push -u origin main
```

### Paso 2 — Crea el proyecto en Vercel

1. Ve a https://vercel.com y regístrate/inicia sesión (puedes usar tu cuenta de GitHub)
2. Pulsa **"Add New Project"**
3. Importa el repositorio `novaweb-proxy` que acabas de crear
4. No hace falta cambiar nada. Pulsa **"Deploy"**
5. Vercel te dará una URL como `https://novaweb-proxy-xyz.vercel.app`

### Paso 3 — Añade la API key de Anthropic

1. En tu proyecto de Vercel, ve a **Settings → Environment Variables**
2. Añade esta variable:

| Name                  | Value                        |
|-----------------------|------------------------------|
| `ANTHROPIC_API_KEY`   | `sk-ant-api03-...` (tu key)  |

> Obtén tu API key en: https://console.anthropic.com/settings/keys

3. Haz un **Redeploy** para que la variable se aplique:
   - Ve a la pestaña **Deployments** → pulsa los tres puntos del último despliegue → **Redeploy**

### Paso 4 — (Opcional pero recomendado) Limita el origen

Para que solo tu web pueda usar el proxy, añade también esta variable de entorno:

| Name               | Value                        |
|--------------------|------------------------------|
| `ALLOWED_ORIGIN`   | `https://tudominio.com`      |

---

## Paso 5 — Conecta la web al proxy

Abre `novaweb.html` y busca esta línea (aproximadamente línea 1043):

```js
const PROXY_URL = 'https://TU-PROYECTO.vercel.app/api/chat';
```

Reemplaza `TU-PROYECTO.vercel.app` por la URL real de tu proyecto en Vercel.

---

## Configurar el formulario de contacto (Formspree)

El formulario de contacto usa Formspree para enviar emails sin backend:

1. Ve a https://formspree.io y crea una cuenta con `novawebia@outlook.com`
2. Crea un nuevo formulario ("New Form")
3. Copia el endpoint que te dan: `https://formspree.io/f/xabcdefg`
4. En `novaweb.html`, busca:
   ```html
   action="https://formspree.io/f/novawebia@outlook.com"
   ```
   Y reemplázalo por tu endpoint real:
   ```html
   action="https://formspree.io/f/xabcdefg"
   ```

---

## Verificar que funciona

Una vez desplegado, prueba el proxy con curl:

```bash
curl -X POST https://TU-PROYECTO.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola, ¿qué servicios ofrecéis?"}]}'
```

Deberías recibir una respuesta JSON con el campo `content`.

---

## Notas de seguridad

- La `ANTHROPIC_API_KEY` **nunca** aparece en el navegador ni en el código HTML.
- El proxy limita el historial a 40 mensajes para evitar abusos.
- Si alguien intenta usar tu proxy desde otro dominio, configura `ALLOWED_ORIGIN` con tu dominio.
- Las funciones Edge de Vercel tienen un límite generoso en el plan gratuito (100k req/mes).
