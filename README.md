# CampusNest Website

Website and backend for a student accommodation marketplace connecting students with hostels, PGs and flats.

## Files

- `index.html` - page structure and content
- `styles.css` - responsive design and layout
- `script.js` - sample listings, filters, interest buttons and API form submission
- `server.js` - Node.js backend that serves the website and saves leads
- `data/students.json` - saved student inquiries, created automatically
- `data/owners.json` - saved owner/property inquiries, created automatically
- `render.yaml` - deployment config for Render

## Edit First

1. Replace `CampusNest` with your real brand name.
2. Replace phone number `+919999999999` with your number.
3. Replace sample listings in `script.js` with real hostel, PG and flat data.
4. Run the backend before testing the forms.

## Run Locally

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

## Deploy On Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vibhorxpandey/campusnest-website)

1. Push this folder to a GitHub repository.
2. Open Render and create a new Web Service from the repository.
3. Render will use `render.yaml`.
4. Start command is `npm start`.

Important: JSON files are okay for testing, but for a real business use MongoDB, Firebase, Supabase or PostgreSQL so leads stay safe after redeploys.
