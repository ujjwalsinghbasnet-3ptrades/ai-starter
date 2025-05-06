# Ai-starter

This is created using vercel's `ai-chatbot` starter template. Next-auth version is changed to v4 and extra configuration for providers has been added.

## Setup
##### Env
```bash
# Generate a random secret: https://generate-secret.vercel.app/32 or `openssl rand -base64 32`
AUTH_SECRET=5e6de9ad678de9d2767a572c52083fda
XAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
ANTHROPIC_API_KEY=
# Instructions to create a Vercel Blob Store here: https://vercel.com/docs/storage/vercel-blob
BLOB_READ_WRITE_TOKEN=****
POSTGRES_URL=
```

##### Note: 
There might be rooms for improvement, say for instance, data fetching as well as drizzle queries can be improved. It ws started just as a POC and main goal was to add configuration page for enabling/disabling providers/modals.
