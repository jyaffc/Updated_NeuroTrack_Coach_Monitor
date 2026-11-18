# NeuroTrack Coach Dashboard

Coach-facing BE428 prototype for cumulative head-impact exposure monitoring in collegiate soccer.

This app is built as a polished demo and MVP front end for a wearable prototype workflow using an ESP32 + BNO055 IMU. It is intentionally non-diagnostic and framed as a decision-support tool for coaches during and after sessions.

## What it does

- Upload-first homepage with drag-and-drop intake for CSV, JSON, and other session files
- Coach-facing analysis summary showing surfaced athletes, higher-confidence events, and parser readiness
- Live-style session dashboard with ranked athlete monitoring, exposure trend, alerts, and action area
- Athlete detail pages with event timeline, direction mix, and cumulative load trend
- Session summary page for presentation-ready recap and export

## Headband device

The ESP32 sketch and the Python receiver that produce the data live in [`device/`](device/README.md), with wiring, Arduino IDE settings, and calibration steps.

## Uploading headband data

The intake page reads the CSV written by `head_impact_receiver.py` as is, plus any coach export with player and intensity columns.

- Recognized headband columns: `datetime`, `esp32_timestamp_ms`, `accel_magnitude_g`, `accel_magnitude_ms2`, `direction_x`, `direction_y`, `direction_z`
- Recognized coach columns: `playerName`, `playerId`, `jerseyNumber`, `sessionId`, `timestamp`, `eventIntensity` (g), `magnitude_ms2`, `eventDirection`, `eventType`, `confidenceScore`, `status`
- Samples from the same athlete less than 100 ms apart are merged into one impact (the receiver logs every 10 ms sample above threshold, so one hit can span several rows)
- With no player column, every impact is assigned to one "Headband wearer"
- Impact side comes from `eventDirection` when present, otherwise from `direction_x/y/z` using head axes +X right, +Y forward, +Z up. The side is opposite to the acceleration (a hit to the forehead pushes the head backward)
- Impacts at about 4 g are flagged: the BNO055 caps its accelerometer at +/-4 g in fusion (NDOF) mode, so the true peak may be higher

Files with usable impacts are saved in the browser (localStorage, nothing is sent to a server) and become the session shown on the dashboard, athlete pages, and session summary. Each new upload is compared with the earlier ones, so athlete baselines build up over sessions. The Data menu on the dashboard switches between uploaded sessions and the demo teams, and "Clear uploads" removes them.

## Product framing

- Not a concussion diagnosis product
- Built for cumulative exposure tracking and coach review
- Uses cautious language such as `Monitor` and `Review Recommended`

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- Lucide React

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run build
```

## Main routes

- `/` upload-first landing and intake experience
- `/dashboard` coach dashboard
- `/athletes/[playerId]` athlete detail
- `/session-summary` session recap

## Project structure

- `app/page.tsx` upload-first homepage
- `app/dashboard/page.tsx` dashboard route
- `app/athletes/[playerId]/page.tsx` athlete detail route
- `app/session-summary/page.tsx` session summary route
- `components/neurotrack/analysis-dropzone.tsx` drag-and-drop file intake UI
- `components/neurotrack/dashboard-view.tsx` main coach dashboard composition
- `components/neurotrack/athlete-detail-view.tsx` athlete detail experience
- `components/neurotrack/session-summary-view.tsx` summary experience
- `lib/neurotrack-data.ts` mock session, athlete, and event data
- `lib/session-upload-analysis.ts` client-side upload parsing and intake analysis
- `lib/uploaded-session.ts` stores uploaded sessions in the browser and builds dashboard, athlete, and summary data from them
- `components/neurotrack/data-routes.tsx` picks uploaded or demo data for the athlete and summary pages

## Deployment

This project is configured to deploy cleanly on Vercel.

Production URL:

- [https://orbita-nine-eta.vercel.app](https://orbita-nine-eta.vercel.app)
