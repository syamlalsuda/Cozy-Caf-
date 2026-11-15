# Cozy Café · Little Moments

A browser café game with four visual stages, recipe preparation, timed orders and XP progression. Runs as a static HTML/CSS/JavaScript site; no server or database is required.

## Production

Run `npm run check` to validate the JavaScript and build production files into `build/`. Vercel reads `vercel.json` and runs this build automatically. Import the GitHub repository into Vercel; no environment variables are required.

The production build strips the temporary level selector and its handlers. Players unlock Level 2 at 100 XP, Level 3 at 200 XP and Level 4 at 300 XP.

## Development

`dist/` contains the editable game and artwork. Its temporary level review controls remain available for design reviews. Never deploy `dist/` directly to Vercel: deploy `build/` using the configured build command.

Progress is stored in browser localStorage. A new domain starts separate saved progress. Player names and progress are not sent to a server.
