# KeyboardSwap agent guide

**Full project context:** read `PROJECT.md` before non-trivial changes.

**Cursor rules:** `.cursor/rules/` — architecture, Next.js patterns, Supabase/RLS, and UI conventions.

## Edit discipline

- Minimal scope: extend existing code; do not rewrite working code outside the task.
- Preserve admin approval workflow, listing statuses, and RLS policies.
- Match existing patterns in `app/`, `components/`, and `lib/` before adding abstractions.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
