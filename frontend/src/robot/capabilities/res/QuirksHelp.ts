export const QuirksHelp = `
## Particularidades

Valetudo pretende ofrecer una abstracción genérica. Esto significa que intenta
unificar los comandos y conceptos específicos de cada fabricante para que no tengas
que preocuparte por qué marca de robot compras.

Sin embargo, algunas funciones pueden existir únicamente en un fabricante o incluso
en un solo modelo de robot.

Añadir estas funciones a la infraestructura principal de Valetudo no tendría sentido,
ya que la interfaz genérica acabaría convirtiéndose en una interfaz específica para
un único robot, lo que iría en contra del objetivo principal de ser independiente
del fabricante.

Aun así, limitar las funciones al mínimo común entre todos los robots tampoco siempre
es lo ideal.

Aquí es donde entran las particularidades.

**Una particularidad es un ajuste específico del fabricante, robot o firmware que
todavía no encaja en Valetudo.**

La disponibilidad de una particularidad puede cambiar en cualquier momento,
dependiendo de diferentes factores.

Si existen particularidades similares en varios fabricantes, probablemente en algún
momento se convertirán en una capacidad real con sus propios puntos de acceso REST.

Piensa en las particularidades como una especie de zona de pruebas para funciones
específicas.

Normalmente serán ajustes que cambias una vez y que probablemente no volverás
a modificar.

No intentes automatizar el cambio de estas particularidades, ya que no existe
ninguna garantía sobre su estabilidad ni sobre su disponibilidad.

Existen únicamente para esta interfaz.
`;
