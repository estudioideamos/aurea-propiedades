# Áurea Propiedades

Sitio inmobiliario premium para una única inmobiliaria, con catálogo, filtros, fichas completas, galerías, formularios de contacto, WhatsApp y un panel administrable separado.

## Tecnología

Next.js 16, React 19, TypeScript, Vinext/Vite, Tailwind CSS, Lucide React y Drizzle ORM.

## Desarrollo

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run build:pages
```

## Estructura

- `app/`: páginas, componentes y estilos.
- `public/`: recursos visuales.
- `db/` y `drizzle/`: modelo y migraciones.
- `worker/`: integración del entorno administrable.
- `tests/`: validación del contenido generado.
- `build/`: salida de publicación.

## Publicación

`.github/workflows/pages.yml` genera y publica la experiencia pública y las fichas al actualizar `main`. GitHub Pages es estático: la autenticación y las operaciones del panel permanecen en el despliegue administrable.

## Seguridad

Las credenciales se configuran únicamente en el entorno de despliegue. No deben incorporarse al repositorio ni a la exportación pública.

## Créditos

Diseño y desarrollo por [Estudio Ideamos](https://ideamos.com.ar/).
