export const MapManagementHelp = `
## Gestión de mapas

Esta página permite realizar tareas relacionadas con los mapas. Las funciones
disponibles dependen del modelo del robot y de su firmware.<br/>
Si no aparece alguna opción en esta página, probablemente tu robot no sea compatible
con ella.

Algunos robots requieren activar manualmente los mapas persistentes antes de poder
realizar la mayoría de las tareas relacionadas con mapas.

Otros ni siquiera permiten desactivar los mapas persistentes.

También existen algunos robots antiguos que no disponen de mapas persistentes.

Algunos robots requieren realizar una limpieza completa, incluyendo el regreso
automático a la estación, para poder guardar un mapa nuevo.

Otros pueden permitir opcionalmente realizar un mapeo rápido mediante un proceso
de mapeo, o incluso pueden requerirlo antes de poder utilizar determinadas funciones.

### Terminología

Ten en cuenta que todos estos conceptos requieren compatibilidad por parte del
firmware del robot.

No todas las funciones están disponibles en todos los robots.

#### Habitaciones

Una habitación es una división del mapa determinada por el firmware del robot.

Las habitaciones permiten limpiar una o varias zonas predefinidas. La mayoría de
los firmwares también permiten asignarles un nombre.

Puedes conocerlas como habitaciones, aunque no tienen por qué ser habitaciones reales.
Por ejemplo, puede existir una habitación que sea simplemente la zona alrededor
de la mesa del comedor.

En la mayoría de los firmwares, el robot utiliza los datos de las habitaciones para
optimizar la navegación y seguir la ruta más eficiente.

#### Zonas

Las zonas son rectángulos que puedes dibujar sobre el mapa para enviar el robot
a una ubicación determinada.

Dependiendo del firmware del robot, puede aceptar una sola zona o varias zonas
como destino.
`;
