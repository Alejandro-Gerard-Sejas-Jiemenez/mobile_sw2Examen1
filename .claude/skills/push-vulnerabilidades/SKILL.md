---
name: push-vulnerabilidades
description: Auditar o corregir vulnerabilidades en el manejo de notificaciones push (Expo Notifications / FCM / APNs) en la app móvil — registro de tokens, payloads, deep links disparados por notificación. Usar al tocar código de notificaciones o al pedir un análisis de seguridad de push.
---

# Vulnerabilidades en notificaciones push

Checklist para auditar (o evitar al implementar) el flujo de push notifications, típicamente con `expo-notifications` sobre FCM/APNs.

## Registro y manejo del push token

- **Push token sin autenticar al registrarlo**: el endpoint que recibe el `ExpoPushToken`/FCM token del dispositivo y lo asocia a un usuario debe requerir sesión autenticada. Si cualquiera puede registrar un token contra cualquier `userId`, un atacante puede recibir las notificaciones destinadas a otra cuenta.
- **Token no invalidado en logout**: al cerrar sesión, hay que desasociar el push token del usuario en el backend (o al menos dejar de mandarle notificaciones de esa cuenta) — si no, el siguiente usuario del mismo dispositivo puede seguir recibiendo pushes del anterior.
- **Un solo token para múltiples cuentas en el mismo dispositivo**: revisar qué pasa si el usuario cambia de cuenta sin desinstalar la app — el token viejo no debe quedar "colgado" de la cuenta anterior.

## Contenido del payload

- **Datos sensibles en el payload de la notificación**: el contenido de un push (título, body, `data`) suele quedar visible en la pantalla de bloqueo y en el centro de notificaciones del OS, y puede pasar por servidores de Apple/Google. No debe llevar PII sensible, tokens, montos exactos, contenido de mensajes privados, etc. — usar un payload genérico ("Tenés un mensaje nuevo") y que la app busque el detalle real autenticada, ya en foreground.
- **Payload usado directamente sin validar**: si el campo `data` de la notificación se usa para navegar (deep link) o para actualizar estado local, tratarlo como input no confiable — un push malicioso o falsificado (si el endpoint de envío no está bien protegido) podría inyectar un deep link a una ruta interna no pensada para eso.

## Deep links y navegación disparada por push

- **Navegación sin validar el destino**: si al tocar la notificación la app navega según `data.screen` o `data.url`, validar que sea una ruta conocida de la app (whitelist), no un `open()` genérico de una URL arbitraria — evita que un push controle navegación a WebViews externas o esquemas peligrosos.
- **Acciones con efecto (no solo navegación) disparadas por el payload**: si un push puede, por ejemplo, marcar algo como leído o disparar una acción de negocio directamente desde el `data` sin pasar por una confirmación o sin re-autenticar, evaluar si eso es explotable si el canal de envío no está bien controlado en el backend.

## Permisos

- **Permiso de notificaciones pedido sin contexto**: no es una vulnerabilidad de seguridad per se, pero vale mencionar si se pide `requestPermissionsAsync()` apenas abre la app sin explicar por qué — mala práctica de UX que además ensucia la tasa de aceptación.

## Al reportar hallazgos

Igual que en [[api-vulnerabilidades]]: ubicación exacta, qué se expone o qué falta validar, y un escenario concreto (qué podría hacer alguien con acceso al canal de envío de push, o con un dispositivo compartido/reciclado).
