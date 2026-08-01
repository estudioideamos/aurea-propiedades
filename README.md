# Áurea Propiedades

Sitio inmobiliario premium para una única inmobiliaria, con catálogo, filtros, fichas completas, galerías navegables, formularios de contacto, accesos de WhatsApp y panel privado.

## Desarrollo local

```bash
npm install
npm run dev
```

## Validación

```bash
npm run build
```

## GitHub Pages

El workflow `.github/workflows/pages.yml` exporta automáticamente la experiencia pública, las páginas internas y las 16 fichas de propiedades cada vez que se actualiza `main`.

```bash
npm run build:pages
```

La gestión autenticada del panel se mantiene en el despliegue administrable, ya que GitHub Pages es un hosting estático.