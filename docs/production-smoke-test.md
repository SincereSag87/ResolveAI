# Production Smoke-Test Checklist

Run these checks after each production deployment.

## API Health

```powershell
Invoke-WebRequest https://your-vercel-domain.vercel.app/api/health
```

Expected JSON:

```json
{"status":"ok","service":"resolveai-api"}
```

## Ticket CRUD

1. Open `/tickets`.
2. Create a ticket with title, category, priority, assignee, and description.
3. Confirm the ticket appears in the queue.
4. Change its status.
5. Delete it.

## Knowledge Base CRUD And Search

1. Open `/knowledge-base`.
2. Create an article with a unique keyword in title, summary, or body.
3. Confirm the article appears and can be selected.
4. Search for the unique keyword.
5. Confirm `GET /api/knowledge-articles/search?q=KEYWORD` returns the article.
6. Change article status.
7. Delete the article if it was only test data.

## Chat Conversation With Citation

1. Create or keep a published KB article that includes a unique troubleshooting keyword.
2. Open `/chat`.
3. Start a conversation using that keyword.
4. Confirm the mock agent responds.
5. Confirm an article citation appears under the agent message.
6. Click the citation and confirm it opens `/knowledge-base?articleId=...`.

## Frontend Routing Refresh

Refresh these routes directly in the browser:

```text
/ 
/chat
/tickets
/knowledge-base
/knowledge-base?articleId=1
/analytics
/settings
```

Expected behavior: Vercel rewrites all frontend routes to `index.html`, and the React app renders the correct page.
