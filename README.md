# Mira - AI Agent for Live Beauty Salon
## Architecture
<img width="1532" height="769" alt="Screenshot 2025-10-25 at 4 21 57 PM" src="https://github.com/user-attachments/assets/d15a7923-0b60-4689-8779-500b2059f988" />

---

## Steps to setup:
### 1. Clone the Repository
```bash
git clone https://github.com/adityaswarupparida/mira-agent
cd mira-agent
```
### 2. Run Dependencies via Docker
Before running backend or agent, start the required services using Docker:
```bash
# PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword postgres

# Redis
docker run -d -p 6379:6379 redis

# Qdrant
docker run -d -p 6333:6333 qdrant/qdrant
```

### 3. Backend
```bash
cd backend
bun install
```

Set your Postgres connection URL in .env, then run Prisma migrations and generate the client:
```bash
bunx prisma migrate dev
bunx prisma generate
```


Finally, start the backend:
```bash
bun index.ts 
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Agent

Install dependencies in a virtual environment:
```bash
cd agent
uv sync
```

Set up environment variables by copying the example file:
```bash
cp .env.example .env.local
```

Then, fill in the required keys:
```bash
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

Before your first run, download the required models (Silero VAD, LiveKit turn detector):
```bash
uv run python src/agent.py download-files
```

Run the agent in console mode:
```bash
uv run python src/agent.py console
```