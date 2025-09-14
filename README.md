
# Bus Seating Chart Maker

A privacy-focused, offline-friendly web app to design and print bus seating charts. No build tools or server required.

## Features
- Bench layout: 2 benches per row, 3 seats per side (A/B/C), configurable rows
- Roster: upload CSV (ID, Last, First, Grade) or add manually
- Assign seats by click or drag-and-drop (from Unassigned onto seat)
- Themes per bench (Animals, Space, Vehicles, Fruits, Colors, Nature, and more)
- Grade color: Each seat shows a colored badge and cell background for the student's grade (works in print and web)
- Grade normalization: Accepts grade formats like `1`, `1st`, `01`, `K`, `KG`, `PK`, etc.
- Print guidance: Print button tooltip explains how to enable "Print backgrounds" if colors do not show
- Modular code: All logic split into modules for maintainability
- Print Chart (landscape; split into two pages by halves), Print Name Tags, Print Bench Icons (large 2x2; 4 per page)

## Quick Start
1. Open `index.html` in your browser (double-click works on Windows)
2. Set number of rows and choose a theme
3. Upload a CSV or add students manually
4. Assign students by selecting and clicking a seat or drag from Unassigned onto a seat
5. Print: seating chart (landscape, split for duplex), name tags, or bench icon sheets (4 per page; large icons; cut guides)

## Folder Structure
- `index.html` — main UI
- `src/` — modular JS files (app.js, seatingChart.js, dragdrop.js, etc.)
- `styles.css` — custom styles (including print view)
- `assets/` — images or future assets

## Notes
- All data is stored in-memory for privacy; no persistent storage unless you export JSON
- You can copy the project folder to any computer and open `index.html`
- No server or build tools required
- CSV format: `Student ID,Last Name,First Name,Grade`
- Name Tags include seat and bench info with theme icons
- Bench Icons print as 4 equal quadrants, 1 icon per quadrant (4 per page), with large icon and bench number only
- Print colors: If colors do not show, enable "Print backgrounds" or "Background graphics" in your browser's print dialog (see tooltip)

## Deploy to GitHub Pages
This is a static site, so GitHub Pages can host it directly from the repository.

Steps:
1. Push to GitHub (done). Repository: `EricFitch/Bus-Seating-Chart-Maker`.
2. In GitHub: Settings → Pages
	- Source: Deploy from a branch
	- Branch: `master` (or `main` if you switch), Folder: `/ (root)`
	- Save
3. Wait 1–2 minutes for the build to finish.

Your site will be available at:
- User site: `https://ericfitch.github.io/Bus-Seating-Chart-Maker/`

Tip: A `.nojekyll` file is included to skip Jekyll processing on Pages.

## License
MIT
