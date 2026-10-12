export const VoicepackHelp = `
## Paquetes de voz

Los paquetes de voz personalizados son algo más complicados, ya que el formato exacto
depende del robot que utilices.

La instalación de estos paquetes depende del modelo y del firmware del robot.

Si quieres instalar un paquete personalizado, necesitarás un paquete de voz en el
formato correcto para tu robot y alojado en algún servidor HTTP.

Ten en cuenta que la CDN oficial suele estar bloqueada por el firmware de los robots,
por lo que utilizar directamente la URL oficial probablemente no funcionará.

Dependiendo del modelo del robot, también necesitarás un hash del archivo del paquete
de voz.

El tipo de hash necesario depende del firmware.

Además, tendrás que especificar un código de idioma. Este valor normalmente no es
demasiado importante, salvo que utilices un código reservado.

Códigos como "EN", "CN", etc. suelen estar reservados para los paquetes de voz
integrados en el firmware.

Normalmente es posible volver al paquete de voz instalado originalmente utilizando
uno de esos códigos de paquetes de voz integrados durante la instalación.

`;
