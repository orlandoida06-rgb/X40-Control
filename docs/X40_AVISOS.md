# X40 — Mapa maestro de avisos y errores

> Generado automáticamente desde `backend/lib/robots/dreame/DreameValetudoRobot.js`.
>
> Este documento describe los códigos que Valetudo reconoce del robot Dreame.

## Estados

- 🟢 OGG confirmado
- 🟡 OGG existe, pendiente de verificar contenido
- ⚪ Sin OGG localizado
- 🔵 El propio robot ya dispone de aviso de voz
- 🟠 Pendiente de integrar con TuAsistente

**Códigos encontrados:** 93

| ID | Mensaje | Persistencia | Nivel | Subsistema | GLADOS | Estado |
|---:|---|---|---|---|---|---|
| 0 | No error | — | — | — | — | ⚪ pendiente |
| 1 | Wheel lost floor contact | transient | error | core | — | ⚪ pendiente |
| 2 | Cliff sensor dirty or robot on the verge of falling | permanent | error | sensors | — | ⚪ pendiente |
| 3 | Stuck front bumper | permanent | error | sensors | — | ⚪ pendiente |
| 4 | Tilted robot | transient | warning | sensors | — | ⚪ pendiente |
| 5 | Stuck front bumper | permanent | error | sensors | — | ⚪ pendiente |
| 6 | Wheel lost floor contact | transient | error | core | — | ⚪ pendiente |
| 7 | — | unknown | unknown | core | — | ⚪ pendiente |
| 8 | Dustbin missing | transient | warning | attachments | — | ⚪ pendiente |
| 9 | Water tank missing | transient | warning | attachments | — | ⚪ pendiente |
| 10 | Water tank empty | transient | warning | attachments | — | ⚪ pendiente |
| 11 | Dustbin full | transient | warning | attachments | — | ⚪ pendiente |
| 12 | Main brush jammed | permanent | error | motors | — | ⚪ pendiente |
| 13 | Side brush jammed | permanent | error | motors | — | ⚪ pendiente |
| 14 | Filter jammed | transient | warning | attachments | — | ⚪ pendiente |
| 15 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 16 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 17 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 18 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 19 | Charging station without power | transient | warning | power | — | ⚪ pendiente |
| 20 | Low battery | transient | info | power | — | ⚪ pendiente |
| 21 | Charging error | permanent | warning | power | — | ⚪ pendiente |
| 23 | — | unknown | unknown | core | — | ⚪ pendiente |
| 24 | Camera dirty | permanent | warning | sensors | — | ⚪ pendiente |
| 25 | — | unknown | unknown | core | — | ⚪ pendiente |
| 26 | Camera dirty | permanent | warning | sensors | — | ⚪ pendiente |
| 27 | Sensor dirty | permanent | warning | sensors | — | ⚪ pendiente |
| 28 | Charging station without power | transient | warning | power | — | ⚪ pendiente |
| 29 | Battery temperature out of operating range | transient | error | power | — | ⚪ pendiente |
| 30 | Fan speed abnormal | permanent | catastrophic | motors | — | ⚪ pendiente |
| 31 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 32 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 33 | Accelerometer sensor error | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 34 | Gyroscope sensor error | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 35 | Gyroscope sensor error | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 36 | Left magnetic field sensor error | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 37 | Right magnetic field sensor error | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 38 | — | unknown | unknown | core | — | ⚪ pendiente |
| 39 | — | unknown | unknown | core | — | ⚪ pendiente |
| 40 | Camera fault | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 41 | Magnetic interference | transient | info | sensors | — | ⚪ pendiente |
| 42 | Water pump fault | permanent | catastrophic | attachments | — | ⚪ pendiente |
| 43 | RTC fault | permanent | catastrophic | core | — | ⚪ pendiente |
| 44 | — | unknown | unknown | core | — | ⚪ pendiente |
| 45 | 3.3V rail abnormal | permanent | catastrophic | core | — | ⚪ pendiente |
| 46 | — | unknown | unknown | core | — | ⚪ pendiente |
| 47 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 48 | LDS jammed | permanent | error | sensors | — | ⚪ pendiente |
| 49 | LDS bumper jammed | permanent | error | sensors | — | ⚪ pendiente |
| 50 | — | unknown | unknown | core | — | ⚪ pendiente |
| 51 | Filter jammed | transient | warning | attachments | — | ⚪ pendiente |
| 52 | — | unknown | unknown | core | — | ⚪ pendiente |
| 53 | ToF Sensor offline | permanent | catastrophic | sensors | — | ⚪ pendiente |
| 54 | Wall sensor dirty | transient | warning | sensors | — | ⚪ pendiente |
| 55 | — | unknown | unknown | core | — | ⚪ pendiente |
| 56 | — | unknown | unknown | core | — | ⚪ pendiente |
| 57 | — | unknown | unknown | core | — | ⚪ pendiente |
| 58 | — | unknown | unknown | core | — | ⚪ pendiente |
| 59 | Robot trapped by virtual restrictions | transient | warning | navigation | — | ⚪ pendiente |
| 60 | — | unknown | unknown | core | — | ⚪ pendiente |
| 61 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 62 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 63 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 64 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 65 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 66 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 67 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 69 | Lost mop pad | transient | error | attachments | — | ⚪ pendiente |
| 70 | Lost mop pad | transient | error | attachments | — | ⚪ pendiente |
| 71 | Mop motor fault | permanent | catastrophic | motors | — | ⚪ pendiente |
| 72 | Mop motor current abnormal | permanent | catastrophic | motors | — | ⚪ pendiente |
| 74 | Failed to attach mop pads | transient | error | attachments | — | ⚪ pendiente |
| 82 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| 91 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 96 | Cannot reach target | transient | warning | navigation | — | ⚪ pendiente |
| 98 | Robot stuck or trapped | transient | warning | navigation | — | ⚪ pendiente |
| -2 | Stuck inside restricted area | transient | warning | navigation | — | ⚪ pendiente |
| 101 | Auto-Empty Dock dust bag full or dust duct clogged | permanent | warning | dock | `101.ogg` | 🟡 por verificar |
| 102 | Auto-Empty Dock cover open or missing dust bag | transient | warning | dock | `102.ogg` | 🟡 por verificar |
| 103 | Auto-Empty Dock cover open or missing dust bag | transient | warning | dock | `103.ogg` | 🟡 por verificar |
| 104 | Auto-Empty Dock dust bag full or dust duct clogged | permanent | warning | dock | `104.ogg` | 🟡 por verificar |
| 105 | Mop Dock Clean Water Tank not installed | permanent | warning | dock | `105.ogg` | 🟡 por verificar |
| 106 | Mop Dock Wastewater Tank not installed or full | permanent | warning | dock | `106.ogg` | 🟡 por verificar |
| 107 | Mop Dock Clean Water Tank empty | permanent | warning | dock | `107.ogg` | 🟡 por verificar |
| 108 | Mop Dock Wastewater Tank not installed or full | permanent | warning | dock | `108.ogg` | 🟡 por verificar |
| 109 | Mop Dock Wastewater pipe clogged | permanent | error | dock | `109.ogg` | 🟡 por verificar |
| 110 | Mop Dock Wastewater pump damaged | permanent | catastrophic | dock | `110.ogg` | 🟡 por verificar |
| 111 | Mop Dock Tray not installed | permanent | warning | dock | `111.ogg` | 🟡 por verificar |
| 112 | Mop Dock Tray full of water | permanent | error | dock | `112.ogg` | 🟡 por verificar |
| 116 | Mop Dock Clean Water Tank empty | permanent | warning | dock | `116.ogg` | 🟡 por verificar |
| 117 | Cannot navigate to the dock | transient | warning | navigation | `117.ogg` | 🟡 por verificar |
| 118 | Mop Dock Wastewater Tank not installed or full | permanent | warning | dock | `118.ogg` | 🟡 por verificar |
| 119 | Mop Dock Tray full of water | permanent | error | dock | `119.ogg` | 🟡 por verificar |

## Notas

- El código `vendorErrorCode` es el identificador original del fabricante cuando está disponible.
- `ErrorStateValetudoEvent` actualmente conserva el mensaje del error para el evento.
- Los OGG de GLADOS deben verificarse individualmente antes de asociarlos automáticamente a un código.
- No se deben crear voces duplicadas cuando el firmware del robot ya reproduce el aviso correspondiente.
