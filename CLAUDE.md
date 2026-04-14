# gather

Context for [Claude Code](https://code.claude.com/) in this repository.

@AGENTS.md

## Stack

- Next.js 16 — this fork differs from older Next.js; read `node_modules/next/dist/docs/` when APIs or file layout are unclear.
- React 19, TypeScript, Tailwind CSS 4
- Prisma 6 with SQLite (`prisma/schema.prisma`, `DATABASE_URL` in `.env`)
- Auth.js (Google OAuth) and optional Twilio — see `.env.example` for variable names and setup notes

## Commands

- Dev server: `npm run dev` (listens on **port 3001** by default)
- Lint: `npm run lint`
- Database: `npm run db:generate`, `npm run db:migrate`, `npm run db:studio`
