# OWCards

Editor web de tarjetas y carruseles para redes sociales. Funciona en el navegador, tanto en móvil como en PC.

Esta carpeta está preparada para GitHub Pages: no necesita instalar dependencias ni ejecutar una compilación. Las fuentes y sus licencias están incluidas en **fonts/**.

## Publicar por primera vez

1. En GitHub, crea un repositorio llamado **owcards** en tu cuenta. Para usar GitHub Pages con GitHub Free, el repositorio debe ser **público**. No necesitas añadir otro README: ya está incluido.
2. Extrae el ZIP de esta entrega. En el repositorio, elige **Add file → Upload files** y sube el contenido extraído: los archivos y la carpeta **fonts**. No subas el ZIP sin extraer.
3. Comprueba que **index.html está directamente en la raíz del repositorio**, junto a app.js y los demás archivos. No debe quedar dentro de otra carpeta OWCards o dist.
4. Guarda los cambios en la rama **main** con **Commit changes**.
5. Comprueba que exista el archivo **.nojekyll** en esa raíz. Si la subida desde el navegador lo omite, usa **Add file → Create new file**, escribe **.nojekyll** como nombre, añade una línea en blanco si el editor lo requiere y guarda el archivo. No necesita contenido.
6. Abre **Settings → Pages**. En **Build and deployment**, selecciona **Deploy from a branch**, la rama **main** y la carpeta **/ (root)**. Pulsa **Save**.
7. Espera a que termine la publicación. En la misma sección, **Visit site** abrirá la dirección asignada por GitHub. Si el repositorio se llama owcards, normalmente será **https://TU-USUARIO.github.io/owcards/**. La primera publicación puede tardar hasta 10 minutos.

Los nombres de las opciones de GitHub pueden aparecer en inglés. Esta entrega no incluye contraseñas, la configuración del alojamiento anterior, el historial de ese alojamiento ni tus tarjetas personales.

## Llevar tus tarjetas a la dirección nueva

1. Antes de cambiar de dirección, entra en la web anterior y usa **Proyecto → Guardar proyecto editable**.
2. Abre la web de GitHub Pages y usa **Proyecto → Abrir proyecto editable** para seleccionar el archivo guardado.
3. Revisa que aparezcan las tarjetas y sus fotos. Los siguientes cambios se guardarán en ese navegador para la dirección nueva.

El guardado del navegador no se traslada automáticamente entre direcciones ni se sincroniza entre dispositivos. La lista de tarjetas recientes y la biblioteca de diseños propios también pertenecen al navegador y a la dirección donde los guardaste. Para trasladar una tarjeta reciente, recupérala primero y guarda su proyecto. Para trasladar un diseño propio, aplícalo a una tarjeta, guarda el proyecto y vuelve a guardar el diseño reutilizable en la dirección nueva.

## Actualizar la web

Sube los archivos actualizados al mismo repositorio, conservando la estructura y la carpeta fonts. Guarda los cambios en main. GitHub Pages publicará la nueva versión automáticamente; el estado aparece en **Actions** y en **Settings → Pages**. Si todavía ves la anterior, espera a que termine y recarga la página.

Las actualizaciones del código no incluyen las tarjetas de cada usuario: estas permanecen en el almacenamiento de su navegador. Conserva una copia editable de tus proyectos importantes.

## Comprobación después de publicar

- Abrir la web en PC y móvil; comprobar las fuentes.
- Importar un proyecto editable de prueba.
- Añadir y reemplazar fotos, recortar y arrastrar su encuadre; probar el bloqueo.
- Editar texto; probar la ×, Deshacer y Rehacer.
- Usar Ver completa y elegir un fondo de relleno.
- Exportar una tarjeta PNG y un carrusel ZIP.
- Recargar y comprobar que el proyecto sigue guardado.

## Estructura

- **index.html**: página de entrada.
- **Archivos .js y .css**: funciones y estilos del editor.
- **fonts/**: tipografías incluidas y sus licencias.
- **.nojekyll**: indica que los archivos deben servirse directamente.
- **.gitignore**: evita añadir archivos de trabajo y copias personales por accidente.

No añadas proyectos editables personales al repositorio público. Los archivos que subas al repositorio y los que publiques en Pages serán accesibles según sus permisos de publicación.

## Documentación oficial

- Crear el sitio: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Configurar la publicación: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Preparado el 3 de noviembre de 2026.
