# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for "Praxis für Osteopathie und Kinesiologie Madeleine Wabner" - a German healthcare practice in Borsdorf, Germany. The site is written in German.

## Hosting

- Hosted on AWS S3
- Delivered via CloudFormation

## Design Principles

- **Einfache Struktur**: Simple, easily editable structure
- **Keine externen Abhängigkeiten**: No external dependencies - all assets are local
- **Minimales JavaScript**: JavaScript only where absolutely necessary
- **Barrierefreiheit**: Accessibility-focused, simple layout

## Tech Stack

- Static HTML (XHTML 1.0 Strict)
- CSS (minified in main.css, with additional styles in css/)
- jQuery 1.7.2 (local copy) for interactive elements
- OpenLayers/OpenStreetMap (local copies) for map integration on the Praxis page
- prettyPhoto (local copy) for image galleries

## Development

No build system - edit HTML/CSS files directly.

**Lokale Vorschau mit Maven/Tomcat:**
```bash
mvn tomcat7:run
```
Dann erreichbar unter: http://localhost:8080/praxis-wabner/

**Deployment:** Upload to S3.

## Site Structure

- `index.html` / `index2.html` - Homepage
- `osteopathie.html` - Osteopathy services
- `kinesiologie.html` - Kinesiology services
- `about_me.html` - About the practitioner
- `praxis.html` - Practice location with interactive map
- `kosten.html` - Pricing information
- `impressum.html` - Legal notice (Impressum)
- `dsvgo.html` - Privacy policy (DSGVO)

## Key Conventions

- Content is in German with HTML entities for umlauts (e.g., `&uuml;` for ü)
- CSS loads asynchronously via localStorage caching (see inline script in `<head>`)
- Schema.org microdata is used for structured data (Organization, Person, PostalAddress)
- The sidebar with contact information is duplicated across pages