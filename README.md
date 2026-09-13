# Protegiendo Huellas

Sitio web de la Fundación Protegiendo Huellas (Paipa, Boyacá, Colombia) para dar a conocer a los perros en adopción, recibir donaciones y conectar a las familias interesadas con la fundación. Incluye un panel administrativo para que el equipo mantenga el catálogo actualizado sin tocar código.

## Funcionalidades

### Sitio público

- **Catálogo de perros en adopción** con foto, edad, tamaño y estado de salud (esterilización o castración).
- **Búsqueda por nombre y filtros por tamaño**, con carga progresiva de resultados.
- **Ficha detallada** de cada perro con su historia y un acceso directo a WhatsApp con un mensaje prellenado para iniciar el proceso de adopción.
- **Favoritos** durante la visita para recordar los perros que más gustaron.
- Secciones informativas: proceso de adopción, la fundación, datos para donaciones, redes sociales y contacto.
- Diseño responsive y accesible (navegación por teclado, textos alternativos, enlaces de salto).

### Panel administrativo (`/admin`)

- Inicio de sesión con correo y contraseña.
- Agregar, editar y eliminar perros, con subida de fotografía.
- Edición rápida desde la propia landing cuando hay una sesión administrativa activa.
- Las fotos se redimensionan y comprimen automáticamente en el navegador antes de subirse.
- Cambio de contraseña de la cuenta actual.
- Roles:
  - **superadmin**: gestiona perros y puede crear nuevas cuentas administrativas.
  - **admin**: gestiona perros, pero no puede crear cuentas.

## Tecnología

- [Next.js 16](https://nextjs.org) (App Router) con React 19 y TypeScript.
- [Supabase](https://supabase.com): autenticación, base de datos Postgres y almacenamiento de imágenes.
- CSS propio, sin frameworks de estilos.

## Cómo funciona

- **Rendimiento:** la página pública se sirve desde caché y se regenera en segundo plano cada 5 minutos, por lo que las visitas no consultan la base de datos una por una. Cuando un administrador guarda un cambio desde la app, la caché se invalida al instante.
- **Disponibilidad:** si la base de datos no responde, el sitio sigue mostrando la última versión válida del catálogo.
- **Seguridad:** los permisos se aplican en la base de datos con Row Level Security. Cualquier visitante puede leer el catálogo, pero solo las cuentas registradas como administradoras pueden crear, editar o borrar perros e imágenes. Las escrituras pasan por server actions que vuelven a verificar la sesión. La clave `service_role` de Supabase se usa exclusivamente en el servidor y solo para crear cuentas administrativas.
- **Monitoreo:** `GET /api/health` responde si la base de datos es accesible.

## Desarrollo local

Requisitos: Node.js 20 o superior y un proyecto de Supabase.

```bash
npm install
cp .env.example .env.local   # completar con los datos del proyecto de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Puede exponerse al navegador; el acceso real lo controla RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor. Necesaria para crear administradores. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni subirse al repositorio. |

### Base de datos

El esquema, las políticas de seguridad, el bucket de imágenes y los datos iniciales están versionados en `supabase/migrations/` y se aplican con la CLI de Supabase (`npx supabase db push`, siempre con `--dry-run` primero).

### Primera cuenta administrativa

El script lee las credenciales desde variables del proceso, así la contraseña no queda escrita en ningún archivo:

```powershell
$env:INITIAL_ADMIN_EMAIL = "correo@ejemplo.com"
$adminSecurePassword = Read-Host "Contraseña" -AsSecureString
$adminCredential = [pscredential]::new("bootstrap", $adminSecurePassword)
$env:INITIAL_ADMIN_PASSWORD = $adminCredential.GetNetworkCredential().Password
npm run bootstrap:superadmin
Remove-Item Env:INITIAL_ADMIN_EMAIL, Env:INITIAL_ADMIN_PASSWORD
Remove-Variable adminSecurePassword, adminCredential
```

Puede ejecutarse de nuevo para asegurar el rol `superadmin`.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Entorno de desarrollo. |
| `npm run build` | Compilación de producción. |
| `npm start` | Sirve la compilación de producción. |
| `npm run lint` | Revisión con ESLint. |
| `npm run bootstrap:superadmin` | Crea o actualiza la primera cuenta superadmin. |
| `npm run optimize:images` | Recomprime a WebP las fotos subidas antes de la optimización automática. Sin `-- --apply` solo muestra el ahorro. |
| `npm run verify:supabase` | Prueba permisos, CRUD y almacenamiento con registros temporales que elimina al terminar (requiere `VERIFY_ADMIN_EMAIL` y `VERIFY_ADMIN_PASSWORD`). |

## Estructura

- `src/app/page.tsx`: landing pública.
- `src/app/admin`: login y panel administrativo.
- `src/app/api`: creación de administradores y health check.
- `src/components`: componentes de la landing, incluido el catálogo.
- `src/lib/dogs.ts`: lectura cacheada del catálogo.
- `src/lib/dog-actions.ts` y `src/lib/dog-editor.ts`: escrituras de perros e imágenes.
- `src/lib/supabase`: clientes de Supabase para navegador, servidor y service role.
- `supabase/migrations`: esquema, seguridad y datos iniciales.
- `src/app/globals.css`: estilos.

El archivo `index.html` de la raíz es la maqueta original y se conserva como referencia visual.
