---
name: mobile-touch-ergonomics
description: Reglas de ergonomía táctil y layout mobile-first para pantallas de la Auditor Mobile Console — zona del pulgar, tamaño mínimo de touch targets, separación de acciones destructivas, y cuándo usar una columna vs. dos. Usar al diseñar o revisar cualquier pantalla, componente interactivo o botón nuevo en src/app/.
---

# Ergonomía táctil mobile-first

Esta app se usa a una mano, muchas veces en movimiento y con luz solar directa (un auditor de campo, no alguien sentado en un escritorio). Estas reglas existen para ese contexto real, no como estética.

**Contexto del proyecto**: React Native + Expo Router puro, con `StyleSheet` y `src/constants/theme.ts` (`Colors`, `Spacing`, `Fonts`, `MaxContentWidth`, `BottomTabInset`). **No hay NativeWind/Tailwind** — cualquier referencia a "red-400" o "slate-950" en discusiones de diseño se traduce a un token de `theme.ts`, nunca a una clase de Tailwind que no existe en este código.

## 1. Zona del pulgar

- El **tercio inferior** de la pantalla es la zona alcanzable con el pulgar en uso a una mano. Las acciones primarias de cada pantalla viven ahí: la barra de tabs (ya la maneja `NativeTabs` en nativo, ver `src/app/(tabs)/_layout.tsx`), un botón flotante, o una barra de acción fija al fondo del detalle.
- El **tercio superior** es de solo lectura: título, breadcrumb, estado. No poner ahí el botón de acción principal de la pantalla (ej. "Generar reporte", "Marcar como leída").
- Excepción explícita y deliberada: **"Sign out"** en `src/app/(tabs)/index.tsx` está arriba a propósito — es una acción de baja frecuencia y sin costo real si se toca sin querer (no borra nada). No apliques esta misma excepción a nada que sí tenga costo.
- Cuando llegue una acción tipo "detener auditoría" / kill-switch (fuera del alcance actual, ver [[severity-data-display]] para qué datos mostraría): **NO puede vivir en el borde inferior donde el pulgar apoya en reposo**. Ponela en una posición que requiera una extensión deliberada del pulgar (ej. centro-superior de una barra de acción, no el extremo).

## 2. Tamaño mínimo de touch target

- **44×44pt como piso absoluto** (iOS HIG). Para Android, apuntar a 48×48dp cuando el layout lo permita; 44 sigue siendo el mínimo no negociable.
- Esto aplica al **área tocable**, no al ícono/texto visible — un ícono de 20px puede tener un `hitSlop` o padding que lo lleve a 44×44 sin agrandar visualmente el ícono.
- Revisar especialmente: filas de lista completas como target (mejor que un ícono chiquito al costado), botones de "Sign out"/acciones de header, y cualquier ítem dentro de un `FlatList` con `renderItem` (como `AuditRow` en `(tabs)/index.tsx`).
- **Qué falla esta regla hoy en el código**: el `Pressable` de "Sign out" en `(tabs)/index.tsx` envuelve solo el texto sin padding explícito — probablemente por debajo de 44×44. Ajustar con `hitSlop` o `padding` al implementar la Historia 3 en adelante.

## 3. Separación entre acciones destructivas y no-destructivas

- Una acción destructiva o irreversible (cerrar sesión sin guardar cambios pendientes, descartar un reporte en preview, detener una auditoría) **nunca** va pegada/adyacente a la acción principal no-destructiva de la misma pantalla.
- Reglas concretas:
  - Espaciado mínimo de `Spacing.four` (24, ver `theme.ts`) entre un botón destructivo y cualquier botón no-destructivo en la misma fila/columna.
  - La acción destructiva NO usa el color `tint` (reservado para la acción primaria/afirmativa, ver `Colors.light.tint`/`Colors.dark.tint`). Usa `danger`.
  - Si la acción es irreversible y de alto impacto (no "sign out"), requiere una confirmación explícita (modal o segundo tap), no un solo tap.
- **Por qué importa más en móvil que en web**: en web un click errado se deshace con un botón "atrás" o Ctrl+Z; en móvil, con el pulgar y en movimiento, un toque de más ejecuta la acción — no hay "deshacer" implícito.

## 4. Una columna vs. dos

- **Viewport de teléfono (~390-430px de ancho, que es el caso real de esta app — no diseñamos primero para tablet/web)**: layout de **una sola columna**, apilado vertical. Nada de grillas asimétricas tipo bento — no entran.
- Patrón correcto: pila de cards de distinta altura (número grande arriba, después contenido de detalle, después lista) — es literalmente lo que ya hace el panel de monitoreo (`AuditRow` en `(tabs)/index.tsx`): nombre, status, test batteries, métricas, todo apilado en un card.
- **Excepción a una columna**: pares de métricas cortas (número + label), tipo "1508 requests" / "43 pages scanned" — eso sí puede ir en 2 columnas dentro del mismo card, porque son datos cortos y del mismo tipo. No uses 2 columnas para bloques de contenido de distinta naturaleza (ej. nunca un chart al lado de una lista de texto en una pantalla de 390px).
- `MaxContentWidth` (800, en `theme.ts`) sigue existiendo para cuando la app corre en `web` — ahí sí hay espacio horizontal real y una segunda columna puede tener sentido. La regla de "una columna" es específicamente para el ancho de teléfono; no la apliques ciegamente al target `web` si en algún momento se le da más atención a ese layout.

## 5. Uso a una mano, en movimiento, con brillo alto

- Contraste alto siempre — nunca texto secundario sobre fondo secundario (evitar `textSecondary` sobre `backgroundElement` si el resultado da bajo contraste; verificar visualmente, no asumir).
- No dependas de gestos sutiles (swipe fino, long-press sin affordance visible) para acciones primarias — son poco fiables con el usuario en movimiento. Long-press está bien como acción *secundaria* (ver [[severity-data-display]] para copiar hashes), nunca como único camino a una acción primaria.
- No uses estados "hover" como única señal de interactividad — no existen en touch. Todo elemento tocable necesita una señal visible en reposo (no solo al presionar) de que es tocable: fondo diferenciado (`backgroundElement`/`backgroundSelected`), no solo texto azul.

## Al revisar una pantalla nueva

Preguntar, en este orden:
1. ¿La acción principal de esta pantalla está en el tercio inferior o requiere estirar la mano?
2. ¿Cada elemento tocable mide al menos 44×44pt de área tocable real (no solo visual)?
3. ¿Hay alguna acción destructiva a menos de `Spacing.four` de una no-destructiva, o sin confirmación?
4. ¿El layout asume más de una columna en el ancho de teléfono para contenido que no es "número + label corto"?
