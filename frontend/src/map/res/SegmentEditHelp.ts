export const SegmentEditHelp = `
## Gestión de habitaciones

Una habitación es una división del mapa determinada por el firmware del robot.

Las habitaciones permiten limpiar una o varias zonas predefinidas. La mayoría de los
firmwares también permiten asignarles un nombre.

Puedes conocerlas como habitaciones, aunque no tienen por qué ser habitaciones reales.
Por ejemplo, puede existir una habitación que sea simplemente la zona alrededor de
la mesa del comedor.

En la mayoría de los firmwares, el robot utiliza los datos de las habitaciones para
optimizar la navegación y seguir la ruta más eficiente.


Puedes seleccionar una habitación haciendo clic sobre ella. Dependiendo del firmware,
podrás dividirla en dos o asignarle un nombre.

Si seleccionas otra habitación, también puedes unir ambas para formar una habitación
más grande, siempre que el firmware lo permita.


Los colores de las habitaciones se determinan automáticamente mediante el sistema
de representación del mapa y no tienen ningún significado especial. Simplemente son
diferentes para poder distinguir unas de otras.

En ocasiones, los colores pueden cambiar porque uno o varios píxeles de la habitación
han cambiado.

### Problemas y preguntas frecuentes

#### No veo ninguna habitación

Solo puedes editar habitaciones si existen. Si únicamente ves un mapa azul,
el robot no tiene habitaciones definidas.

Asegúrate de haber realizado una limpieza completa y de que el robot haya regresado
a la estación por sí mismo sin ninguna interrupción.

Normalmente esto es necesario para que el robot divida el mapa en habitaciones.

Además, algunos firmwares pueden requerir que actives manualmente el guardado de
mapas persistentes antes de iniciar esa limpieza completa.

#### No puedo dividir una habitación

A veces es necesario mover ligeramente la posición de la línea de corte para que
funcione correctamente.

No es necesario colocar la línea de corte exactamente entre los píxeles de las
paredes. De hecho, hacerlo puede impedir que la división funcione correctamente.

Prueba a arrastrar la línea por todo el ancho o alto de la habitación en lugar de
colocarla solamente en una parte.

En algunas distribuciones de habitaciones también puede ser necesario dividir una
habitación varias veces y después volver a unir algunas de esas partes para obtener
el resultado deseado.

#### ¿Puedo eliminar una habitación?

No.

`;
