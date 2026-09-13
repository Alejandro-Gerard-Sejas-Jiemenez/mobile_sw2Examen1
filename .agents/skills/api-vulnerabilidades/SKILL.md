---
name: api-vulnerabilidades
description: Auditar o corregir vulnerabilidades en cómo la app móvil consume la API backend (HTTP, autenticación, validación, exposición de datos). Usar al revisar código de red, endpoints, manejo de errores o al pedir un análisis de seguridad de la capa API.
---

# Vulnerabilidades en el consumo de API

Checklist para auditar (o evitar al implementar) la capa de comunicación entre la app móvil y el backend. Pensada para un contexto de examen de ingeniería de software donde se evalúa seguridad de la integración cliente-servidor.

## Transporte

- **HTTPS obligatorio**: cualquier `http://` en URLs de producción es un hallazgo. En desarrollo, aislarlo con variables de entorno, nunca hardcodeado junto al de producción.
- **TLS pinning**: si la app maneja datos sensibles (financieros, salud, credenciales), evaluar si falta certificate/public-key pinning. Ausencia total no siempre es un hallazgo crítico en un examen, pero hay que mencionarlo si el flujo maneja algo sensible.
- **Certificados self-signed aceptados en release**: buscar configuraciones que desactivan la validación de certificados (`rejectUnauthorized: false`, trust-all en Android network security config) fuera de un build de debug explícito.

## Autenticación y autorización

- **Credenciales/API keys hardcodeadas** en el bundle JS (buscar strings tipo `Bearer `, `api_key`, `secret` en el código fuente, no solo en `.env`). Todo lo que termina en el bundle es público — el atacante lo extrae con un `strings` sobre el APK/IPA.
- **IDOR**: cualquier request que pase un `id` de recurso (usuario, pedido, documento) sin que el backend verifique ownership. Desde el cliente, el hallazgo típico es "cambiar el id en el path/query y ver si responde con datos de otro usuario" — vale la pena señalarlo aunque la corrección sea del lado del backend.
- **Autorización solo en el cliente**: si una pantalla o botón se oculta por rol pero el endpoint no vuelve a validar el rol server-side, es vulnerabilidad — el cliente nunca es una barrera de seguridad real.

## Validación y manejo de datos

- **Inputs sin validar antes de enviar**: no es solo UX, inputs no saneados (ej. concatenados en un query string) habilitan inyección hacia el backend.
- **Deserialización de respuestas sin validar forma/tipo**: confiar ciegamente en el shape del JSON de la API puede causar crashes o comportamiento inesperado si la API cambia o es interceptada (MITM sin pinning).
- **Errores verbosos expuestos al usuario o logueados**: stack traces del backend, mensajes de error con detalles internos (queries SQL, paths de archivos) que llegan hasta la UI o a analytics de la app.

## Exposición de datos

- **Logging de payloads completos** (requests/responses) en `console.log` o en herramientas de crash reporting (Sentry, Crashlytics) sin redactar campos sensibles (passwords, tokens, PII).
- **Caché de respuestas sensibles** en `AsyncStorage` o en caché HTTP sin cifrar (ver también [[auth-jwt-securestore]] para el caso específico de tokens).
- **Rate limiting / abuso**: la app no puede prevenir abuso por sí sola, pero un cliente que dispara requests sin debounce/throttle en flujos sensibles (login, OTP, reset de password) facilita brute-force — señalarlo como hallazgo de diseño.

## Al reportar hallazgos

Para cada uno: dónde está (archivo/línea), qué dato se expone o qué falta de validación hay, y el escenario concreto de explotación (quién lo abusa y cómo), no solo "falta seguridad aquí".
