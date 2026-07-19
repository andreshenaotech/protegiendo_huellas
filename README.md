# Protegiendo Huellas

Landing page de la Fundación Protegiendo Huellas migrada a Next.js con App Router, React y TypeScript.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Aislamiento obligatorio de cuentas

Este proyecto comparte el equipo con otras cuentas de GitHub y Supabase. El
aislamiento se realiza a nivel de repositorio y mediante un perfil nombrado de
Supabase. Ninguna persona o agente de IA debe sustituir esta configuración por
credenciales globales.

### Fuente de verdad

| Servicio | Configuración autorizada |
| --- | --- |
| GitHub | Cuenta `andreshenaotech` |
| Repositorio | `git@github.com:andreshenaotech/protegiendo_huellas.git` |
| Autor de commits | `andres <andreshenao.tech@gmail.com>` |
| SSH en este equipo | `C:/Users/crypt/.ssh/id_ed25519_huellas` |
| Supabase | Proyecto `protegiendo_huellas` |
| Supabase project ref | `irwdfcacgpznmvjofszq` |
| Supabase URL | `https://irwdfcacgpznmvjofszq.supabase.co` |
| Entorno de plataforma CLI | `SUPABASE_PROFILE=supabase` |
| Nombre identificativo del token | `protegiendo-huellas` (no selecciona una cuenta) |

Si cualquier comando muestra otro propietario de GitHub, otro remoto, otro
project ref o proyectos distintos, se debe **detener la operación**. No se debe
intentar corregir, enlazar, migrar o publicar hasta volver a verificar la cuenta.

### Reglas para personas y agentes de IA

1. Leer esta sección antes de ejecutar `git push`, comandos remotos de Supabase,
   SQL, migraciones o cambios de autenticación.
2. No ejecutar `git config --global` para este proyecto. La identidad y la clave
   SSH se configuran únicamente con `--local`.
3. No eliminar, renombrar ni sobrescribir otras claves dentro de `~/.ssh`. No
   modificar `~/.ssh/config` sin autorización expresa del usuario.
4. No utilizar una sesión global de `gh`, Supabase CLI, MCP o cualquier conector
   solo porque ya esté autenticada. Primero debe verificarse que corresponde a
   la fuente de verdad de esta sección.
5. Todos los comandos de Supabase CLI que accedan a la plataforma deben
   ejecutarse con la variable de proceso `SUPABASE_PROFILE=supabase`. No usar
   `--profile protegiendo-huellas`: ese flag selecciona un entorno/API, no una
   cuenta de usuario.
6. No ejecutar `supabase db push`, migraciones, SQL remoto, generación de tipos
   enlazada ni cambios de Auth/Storage hasta confirmar el project ref exacto.
7. No leer, imprimir, registrar ni pegar en un chat el contenido de `.env.local`.
   Nunca colocar valores reales en `.env.example`.
8. Nunca usar una clave `service_role`/`secret` con el prefijo `NEXT_PUBLIC_` ni
   desde componentes del navegador. Esas claves omiten RLS y son exclusivamente
   de servidor.

### GitHub: configuración aislada

La configuración que fuerza la identidad correcta vive en `.git/config`, no en
la configuración global del equipo:

```powershell
git config --local user.name "andres"
git config --local user.email "andreshenao.tech@gmail.com"
git config --local core.sshCommand "ssh -i C:/Users/crypt/.ssh/id_ed25519_huellas -o IdentitiesOnly=yes"
git remote set-url origin git@github.com:andreshenaotech/protegiendo_huellas.git
```

Antes de cada primer push realizado por una nueva persona o agente, verificar:

```powershell
git config --local --get user.name
git config --local --get user.email
git config --local --get core.sshCommand
git remote get-url origin
git ls-remote origin
```

Los resultados deben coincidir con la tabla **Fuente de verdad**. `git push`
utilizará automáticamente `id_ed25519_huellas` por medio de `core.sshCommand`,
sin depender de la clave SSH predeterminada ni de otra cuenta de GitHub.

### Supabase: sesión y proyecto aislados

La CLI está instalada y fijada como dependencia del proyecto. Se debe ejecutar
con `npx supabase` para usar esa versión y no una instalación global.

Supabase CLI mantiene una sola sesión de cuenta activa por usuario del sistema.
El flag `--profile` **no** crea sesiones de cuenta separadas: selecciona el
entorno de plataforma (`supabase`, staging, local o un archivo personalizado).
El nombre `protegiendo-huellas` identifica el token creado en el Dashboard, pero
no funciona como selector de cuenta.

La otra cuenta conectada mediante MCP/conector debe permanecer intacta. Para
este repositorio se usa la sesión CLI de `andreshenaotech` y se impide operar
sobre otro proyecto mediante la comprobación obligatoria del project ref.

El inicio de sesión correcto se realiza en una terminal interactiva:

```powershell
$env:SUPABASE_PROFILE = "supabase"
npx supabase login --name protegiendo-huellas --output-format text --agent no
Remove-Item Env:SUPABASE_PROFILE -ErrorAction SilentlyContinue
```

El login cambia únicamente la sesión local de Supabase CLI; no modifica ni
elimina proyectos de ninguna cuenta. No usa la clave `anon`, la clave
`service_role` ni `.env.local`. Si otra herramienta necesita mantener dos
sesiones CLI simultáneas, debe inyectar un `SUPABASE_ACCESS_TOKEN` específico
desde un gestor seguro de secretos, nunca desde el repositorio o `.env.local`.

Antes de enlazar o realizar cualquier operación remota:

```powershell
$expectedProjectRef = "irwdfcacgpznmvjofszq"
$linkedProjectRef = (Get-Content supabase/.temp/project-ref -Raw).Trim()

if ($linkedProjectRef -ne $expectedProjectRef) {
  throw "Proyecto Supabase incorrecto: $linkedProjectRef"
}

$env:SUPABASE_PROFILE = "supabase"
npx supabase projects list --output-format text --agent no
npx supabase migration list --linked --output-format text --agent no
```

La lista debe contener el proyecto `protegiendo_huellas` con ref
`irwdfcacgpznmvjofszq` marcado como `LINKED`. Si aparecen otros proyectos o el
ref esperado no aparece, detenerse sin ejecutar SQL ni migraciones. El
directorio `supabase/.temp` es local y está ignorado por Git.

Antes de aplicar migraciones, comprobar el plan sin escrituras:

```powershell
$env:SUPABASE_PROFILE = "supabase"
npx supabase db push --dry-run --linked --output-format text --agent no
```

Solo después de validar la salida del dry-run se puede ejecutar el push real:

```powershell
$env:SUPABASE_PROFILE = "supabase"
npx supabase db push --linked --output-format text --agent no
Remove-Item Env:SUPABASE_PROFILE -ErrorAction SilentlyContinue
```

No se debe usar un conector Supabase o MCP previamente autenticado si no permite
seleccionar y verificar explícitamente este project ref. En caso de duda, usar
la sesión CLI documentada aquí y limitarse primero a una consulta de lectura.

### Variables de entorno

Crear el archivo local a partir de la plantilla:

```powershell
Copy-Item .env.example .env.local
```

La aplicación cliente necesita únicamente:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://irwdfcacgpznmvjofszq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave pública del proyecto>
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave pública heredada y puede exponerse al
navegador; el acceso real a los datos debe protegerse con permisos y políticas
RLS. Para código nuevo, Supabase recomienda migrar a una clave `publishable`.

`.env.local` está ignorado por Git. Antes de un commit o push se debe comprobar:

```powershell
git check-ignore -v .env.local supabase/.temp/project-ref
git diff --cached
```

No agregar `SUPABASE_ACCESS_TOKEN`, la contraseña de Postgres ni claves
`service_role`/`secret` salvo que una función exclusivamente de servidor las
necesite de forma explícita. Los secretos reales deben permanecer fuera del
repositorio y nunca deben copiarse a `.env.example`.

Referencias: [Supabase CLI login](https://supabase.com/docs/reference/cli/supabase-login)
y [API keys de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## Comandos

- `npm run dev`: inicia el entorno de desarrollo.
- `npm run lint`: revisa el código con ESLint.
- `npm run build`: genera la compilación de producción.
- `npm start`: sirve la compilación de producción.

## Estructura principal

- `src/app/page.tsx`: composición de la landing.
- `src/components/dog-catalog.tsx`: búsqueda, filtros, favoritos y modal.
- `src/data/dogs.ts`: datos actuales de los perros.
- `src/app/globals.css`: sistema visual y estilos responsive.
- `public/dog.png`: imagen provisional reutilizada del HTML original.

El archivo `index.html` original se conserva en la raíz como referencia visual durante las siguientes iteraciones.
