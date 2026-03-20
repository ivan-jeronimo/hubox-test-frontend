# Hubox Frontend

Este es el frontend para la aplicación Hubox, una plataforma de registro y gestión de perfiles de usuario. La aplicación está construida con Vue 3 y Vite, y se enfoca en proporcionar una experiencia de usuario fluida y segura para el registro y la carga de documentos.

## Tecnologías Utilizadas

- **Vue 3:** El framework progresivo de JavaScript para construir interfaces de usuario.
- **Vite:** Una herramienta de compilación rápida que ofrece una experiencia de desarrollo significativamente más ágil.
- **Vue Router:** Para la gestión de rutas del lado del cliente.
- **Pinia:** Para la gestión del estado global de la aplicación (autenticación, datos de usuario).
- **Axios:** Para realizar peticiones HTTP al backend.

## Configuración del Proyecto

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- Node.js (versión 18.x o superior)
- npm (o un gestor de paquetes compatible como Yarn o pnpm)

### Instalación

1. Clona el repositorio en tu máquina local:
   ```sh
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```sh
   cd hubox-frontend
   ```
3. Instala las dependencias del proyecto:
   ```sh
   npm install
   ```

### Ejecución

Para iniciar el servidor de desarrollo de Vite, ejecuta el siguiente comando:

```sh
npm run dev
```

Esto iniciará la aplicación en modo de desarrollo y podrás acceder a ella en `http://localhost:5173` (o el puerto que Vite asigne).

## Características Clave

- **Flujo de Autenticación:**
  - Registro de nuevos usuarios.
  - Verificación de cuenta mediante un código OTP enviado por correo electrónico.
  - Inicio y cierre de sesión seguros.
- **Gestión de Perfil de Usuario:**
  - Formulario para completar y actualizar datos personales.
  - Validación de campos requeridos y formatos específicos (CURP).
- **Carga de Documentos (KYC):**
  - Subida de documentos oficiales como CURP y credencial de elector (INE).
  - Lógica para permitir el reemplazo de documentos solo si han sido rechazados.
  - Visualización del estado de los documentos (Aprobado, Pendiente, Rechazado).
- **Diseño Responsivo:**
  - La interfaz se adapta a diferentes tamaños de pantalla (móvil, tableta y escritorio) para una experiencia de usuario consistente.
