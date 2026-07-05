---
type: "query"
date: "2026-07-05T12:43:42.943144+00:00"
question: "Under the admin app, how has the writeup upload functionality been implemented?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["WriteupsManager()", "WriteupForm()", "uploadWriteupFileAction()", "removeWriteupFileAction()", "extractWriteupContent()", "Private 'writeups' Storage Bucket"]
---

# Q: Under the admin app, how has the writeup upload functionality been implemented?

## Answer

Expanded from original query via vocab: [admin, writeup, writeups, upload, media, storage, form, action, supabase, bucket]. Current code implements real writeup document upload under /admin/portfolio/[portfolioSlug]/writeups: the page binds uploadWriteupFileAction/removeWriteupFileAction into WriteupsManager; WriteupForm exposes a hidden file input for PDF/DOCX/Markdown only after a writeup exists; WriteupsManager wraps the File in FormData and calls the bound server action. Server-side uploadWriteupFileAction checks admin session + requirePortfolioManager, verifies the writeup belongs to the portfolio, validates type and 20MB size, writes to Supabase Storage bucket writeups at portfolioSlug/writeupSlug/timestamp-sanitizedName, updates lab_writeups storage metadata, removes prior file on replacement, extracts Markdown using unpdf/mammoth/turndown/TextDecoder, and returns the extracted content as a draft. Applying extracted content updates editor state; saving the writeup persists content_markdown. removeWriteupFileAction deletes the storage object and nulls metadata. Caveat: the private writeups bucket and storage policies are documented/manual; the migration comments recommended policies but does not create them.

## Outcome

- Signal: useful

## Source Nodes

- WriteupsManager()
- WriteupForm()
- uploadWriteupFileAction()
- removeWriteupFileAction()
- extractWriteupContent()
- Private 'writeups' Storage Bucket