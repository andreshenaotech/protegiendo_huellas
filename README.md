# Protegiendo Huellas

Landing page de la Fundación Protegiendo Huellas migrada a Next.js con App Router, React y TypeScript.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

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
