---
name: auth-jwt-securestore
description: Implementar o revisar autenticación JWT en apps Expo/React Native con refresh token rotativo, guardado en SecureStore. Usar cuando se toque login, logout, interceptores de red, manejo de sesión o almacenamiento de tokens.
---

# Auth JWT + SecureStore (refresh rotativo)

Esta skill aplica cuando el agente implementa o audita el flujo de autenticación de la app móvil. El backend usa **refresh token rotativo**: cada vez que se usa un refresh token, el backend emite uno nuevo y **invalida el anterior**. Esto cambia varias decisiones de diseño respecto a un refresh token fijo.

## Reglas duras

1. **Access token**: vive solo en memoria (estado de la app / contexto de auth). Nunca en `AsyncStorage`, nunca en SecureStore, nunca en variables globales persistidas a disco.
2. **Refresh token**: se guarda únicamente con `expo-secure-store` (`SecureStore.setItemAsync`), nunca con `AsyncStorage` ni en el filesystem plano.
3. **Rotación**: cada respuesta de refresh trae un refresh token nuevo. Hay que:
   - Sobrescribir inmediatamente el refresh token viejo en SecureStore con el nuevo.
   - Si el refresh falla (401/403), tratarlo como sesión inválida — no reintentar con el token viejo, no cachear un token expirado.
4. **Condición de carrera en rotación**: si dos requests disparan un refresh en paralelo, el segundo intento con el refresh token ya rotado va a fallar (porque el backend invalidó el anterior). Hay que serializar los refresh (un mutex/promise compartida) para que solo haya un refresh en vuelo a la vez y las demás requests esperen ese resultado.
5. **Interceptor de red**: en el cliente HTTP (axios/fetch wrapper), un 401 en cualquier request debe:
   - Disparar el refresh (o esperar el que ya está en curso).
   - Reintentar la request original una sola vez con el access token nuevo.
   - Si el refresh también falla, limpiar sesión y forzar logout — no dejar la app en un loop de reintentos.
6. **Logout**: debe borrar el refresh token de SecureStore (`SecureStore.deleteItemAsync`) y limpiar el access token en memoria. Si el backend soporta revocación explícita del refresh token, llamarla antes de borrar localmente.
7. **Nunca loguear tokens**: ni access ni refresh token en `console.log`, crash reporting, ni analytics.

## Qué NO hacer

- No usar `AsyncStorage` para ningún token (no está cifrado en disco).
- No guardar el JWT decodificado en un store persistente (Redux persist, Zustand persist a disco) — si hay que persistir estado de auth entre reinicios, persistir como máximo un flag `isLoggedIn`, no el token.
- No asumir que el refresh token viejo sigue sirviendo como fallback — con rotación, reusarlo es un error garantizado y en algunos backends es señal de robo de token (theft detection), lo que puede invalidar toda la familia de tokens.

## Al revisar código existente

Buscar específicamente:
- Tokens guardados con `AsyncStorage.setItem`.
- Refresh sin mutex (múltiples llamadas a `/refresh` en paralelo).
- Manejo de 401 que no distingue "access token expirado" de "sesión inválida" (loop infinito de refresh).
