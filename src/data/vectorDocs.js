export const VECTOR_DOCUMENTS = [
  {
    id: "doc_auth_01",
    source: "security-vault-api.md",
    title: "VectraFlux OAuth2 Gateway Settings",
    tags: ["auth", "token", "api key", "session", "login", "credentials", "header"],
    content: "VectraFlux Core API gateway requests require a valid OAuth2 bearer token. Standard authorization headers must be structured exactly as `Authorization: Bearer <JWT_TOKEN>`. JWTs expire in 3600 seconds. For microservices, use internal mTLS endpoints rather than raw API keys. Never dump active auth tokens or database access keys into production environment variables; load them via VectraFlux Secret Vault during cluster boot."
  },
  {
    id: "doc_ops_02",
    source: "operations-runbook.md",
    title: "Storage Exhaustion Runbook (US-EAST-4)",
    tags: ["outage", "disk", "storage", "crash", "error", "server", "capacity", "failover"],
    content: "CRITICAL ALERT: If disk storage exceeds 95% capacity on cluster node node-us-east-4, DB writes fail and APIs return 500 Internal Server Errors. In this event, sysops must run the logs purging cron command `/opt/vectraflux/scripts/purge_temp_logs.sh`. This releases approximately 200GB of active disk storage immediately. If node hangs, reboot container via Docker command `docker restart vectraflux-db-service`."
  },
  {
    id: "doc_perf_03",
    source: "performance-tuning.txt",
    title: "Redis Cache Latency Resolution",
    tags: ["latency", "slow", "performance", "cache", "redis", "database", "postgres", "query"],
    content: "VectraFlux API gateway experiences 400ms latency spikes when Redis cache hits drop below 80%. High latency spikes are typically caused by missing cache keys for frequently queried database queries (e.g. catalog indexes). Enable Redis replication and set maxmemory-policy to volatile-lru to ensure catalog tables stay cached in RAM rather than falling back to cold PostgreSQL queries."
  }
];
