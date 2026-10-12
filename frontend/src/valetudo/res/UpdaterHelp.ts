export const UpdaterHelp = `
## Actualizador

El actualizador de X40-Control es una función de comodidad diseñada para facilitar
el mantenimiento del sistema.

Como está diseñado teniendo en cuenta la privacidad, tendrás que pulsar manualmente
un botón para buscar nuevas versiones.

No se realizan comprobaciones diarias, por lo que no se envían solicitudes diarias
a servidores externos.

De forma predeterminada, el actualizador consulta la API de GitHub. Esto significa
que no se recopilan datos sobre ti.

**Nota: el actualizador siempre intentará actualizarte a la siguiente versión
cronológica disponible. Si tienes varias versiones de retraso, tendrás que realizar
varias actualizaciones consecutivas.**

Como el actualizador es únicamente una función de comodidad, puede haber situaciones
en las que no funcione.

En esos casos tendrás que realizar una actualización manual, que normalmente requiere
acceso SSH al robot.

En algunas ocasiones, un cambio de configuración puede permitir utilizar el
actualizador.

En otros casos, el modelo de robot puede no ser compatible con el actualizador
porque no dispone de suficiente almacenamiento.

Esto no es un error: simplemente es una limitación del robot.

También debes tener en cuenta que el actualizador no actualiza el firmware del robot.

Solo actualiza el binario de X40-Control.
`;
