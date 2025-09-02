## AI-PSM – AI-Powered Study Platform

### Project Overview

AI-PSM is a full‑stack learning platform that helps learners practice and review using AI‑assisted quiz generation and a contextual study assistant. It includes a user-facing app and an admin portal with RBAC.

---

## Features

- **AI Quiz Generation**: Topic/level-based MCQs generated on demand
- **AI Study Assistant**: Conversational help and explanations
- **RBAC**: Role-based access for Users, Admins (scoped routes and UI)
- **Study Materials**: Upload, manage, and consume materials
- **Analytics & Progress**: Attempts, scores, and activity overview
- **Notifications**: User/admin system notifications

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Google Generative AI SDK (Gemini)
- **Auth**: JWT (with refresh patterns where applicable)

---

## Architecture

- Monorepo with `Frontend/` (user app), `Admin/Frontend/`, `Backend/` and `Admin/Backend/`
- REST APIs from `Backend/` and `Admin/Backend/`
- Token-based auth; protected routes on both clients

---

## Local Development

1. Backend

```
cd Backend
npm install
npm run dev
```

2. Frontend

```
cd Frontend
npm install
npm run dev
```

3. Admin Backend

```
cd Admin/Backend
npm install
npm run dev
```

4. Admin Frontend

```
cd Admin/Frontend
npm install
npm run dev
```

Configure environment variables with your own values (do not commit `.env` files):

- Backend/Admin Backend: `PORT`, `MONGODB_URI`, `JWT_SECRET`, optional `GOOGLE_AI_API_KEY`/`GEMINI_API_KEY`
- Frontend/Admin Frontend: `VITE_API_URL` pointing to respective backend URLs

---

## Deployment Notes

- Set all secrets in your hosting provider’s dashboard (never in source).
- Restrict CORS to your deployed frontend origins.
- Use separate environments for user and admin services.

---

## RBAC Overview (Challenges & Solutions)

- **Challenge**: Separate privileges for users vs. admins across two apps and APIs.
- **Solution**: JWTs include role claims; middleware checks role/permission before controller logic. Admin UI hides or disables actions based on role. Backends enforce server-side checks to prevent privilege escalation.

---

## AI Integration (Challenges & Solutions)

- **Challenge**: Handling model availability, timeouts, and variable output formats.
- **Solution**: Centralized AI client with timeouts/retries; schema/shape validation of AI responses; graceful fallbacks and user-facing errors. Rate-limit safeguards and logging around AI calls.

---

## Security Practices

- Secrets only via environment variables; `.env` files are ignored and not checked in.
- Input validation on all write endpoints; sanitization and file-type checks for uploads.
- CORS restricted by environment; cookies/headers handled securely in production.
- Server logs avoid printing secret values.

---

## Scripts

- Backends: `dev`, `start` (see respective `package.json` files)
- Frontends: `dev`, `build`, `preview`

---

## Project Structure (high level)

```
Backend/               # User backend API
Admin/Backend/         # Admin backend API
Frontend/              # User web app
Admin/Frontend/        # Admin web app
```

---

## Contributing

- Open an issue describing the change.
- Submit a PR with a clear summary and testing notes.

---

## License

This project is provided as‑is for educational and portfolio purposes. Add your preferred license here if sharing publicly.
