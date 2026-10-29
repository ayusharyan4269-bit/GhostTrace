from typing import Dict, Any, List

SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "midnight_process",
        "title": "The Midnight Process",
        "subtitle": "A background daemon terminates abruptly at 02:14 AM across repeated cycles",
        "description": "Fictional scenario: System daemon 'spectral-daemon' repeatedly starts, logs state checkpoint errors, fails on missing lockfile, and triggers SIGKILL at 02:14:05.",
        "log_content": """[2026-10-28 02:14:01] INFO  systemd[1]: Starting GhostTrace Telemetry Daemon (spectral-daemon.service)...
[2026-10-28 02:14:02] INFO  spectral-daemon[4102]: Initializing memory map at 0x7ffd98b00000 (size: 64MB)
[2026-10-28 02:14:02] DEBUG spectral-daemon[4102]: Probing attached trace sockets on /run/ghosttrace/sock
[2026-10-28 02:14:03] WARN  spectral-daemon[4102]: Descriptor #4 returned EAGAIN; queue backlog reached 92%
[2026-10-28 02:14:04] ERROR spectral-daemon[4102]: Failed to acquire lockfile /var/lock/spectral.lock: Permission denied (errno 13)
[2026-10-28 02:14:04] CRITICAL spectral-daemon[4102]: Corrupted memory state detected in worker slab #2
[2026-10-28 02:14:05] FATAL spectral-daemon[4102]: Panic: worker thread 3 received SIGKILL. Memory dump triggered.
[2026-10-28 02:14:05] ERROR systemd[1]: spectral-daemon.service: Main process exited, code=killed, status=9/KILL
[2026-10-28 02:14:05] WARN  systemd[1]: spectral-daemon.service: Unit entered failed state.
[2026-10-28 02:14:10] INFO  systemd[1]: spectral-daemon.service: Scheduled restart job, restart counter is at 4.
[2026-10-28 02:14:11] INFO  systemd[1]: Stopped GhostTrace Telemetry Daemon.
[2026-10-28 02:14:12] INFO  systemd[1]: Starting GhostTrace Telemetry Daemon (spectral-daemon.service)...
[2026-10-28 02:14:13] ERROR spectral-daemon[4128]: Lockfile /var/lock/spectral.lock still held by orphaned PID 4102
[2026-10-28 02:14:14] FATAL spectral-daemon[4128]: Process unable to reconcile orphaned state. Exiting with code 1."""
    },
    {
        "id": "forgotten_server",
        "title": "The Forgotten Server",
        "subtitle": "An isolated host logs anomalous connection requests, expired certs, and 503 cascaded drops",
        "description": "Fictional scenario: A staging server left online in an unmonitored subnet receives mysterious probes, certificate handshake drops, and database connection timeouts.",
        "log_content": """2026-10-28T01:45:10.231Z [ingress] INFO 192.168.42.105:52314 "GET /api/v1/heartbeat HTTP/1.1" 200 48 "Go-http-client/1.1"
2026-10-28T01:48:32.412Z [ingress] WARN 10.0.0.1:44921 "POST /shadow/invoke HTTP/1.1" 404 112 "Unknown-Agent/0.9"
2026-10-28T01:52:01.002Z [auth] ERROR Certificate verification failed for peer node-ghost-09: certificate has expired on 2026-09-30
2026-10-28T01:52:02.115Z [cluster] WARN Peer node-ghost-09 disconnected from mesh topology
2026-10-28T01:55:40.890Z [db-pool] ERROR pool-worker-01: connection to postgres-replica.internal:5432 timed out (ECONNREFUSED)
2026-10-28T01:55:41.102Z [db-pool] WARN Retrying database connection in 5000ms (attempt 1/5)
2026-10-28T01:55:46.331Z [db-pool] ERROR pool-worker-01: connection to postgres-replica.internal:5432 timed out (ECONNREFUSED)
2026-10-28T01:56:00.010Z [ingress] ERROR HTTP 503 Service Unavailable: upstream database cluster unreachable
2026-10-28T01:56:12.774Z [kernel] WARN Out of memory: Kill process 1892 (node) score 850 or sacrifice child
2026-10-28T01:56:13.001Z [kernel] CRITICAL Killed process 1892 (node) total-vm:2048512kB, anon-rss:1845120kB"""
    },
    {
        "id": "last_commit",
        "title": "The Last Commit",
        "subtitle": "Late-night terminal session struggling with broken builds, unresolved merge conflict, and victory",
        "description": "Fictional scenario: A developer works at 03:00 AM attempting to fix a stubborn type error and memory leak, repeatedly debugging before landing a clean build and commit.",
        "log_content": """$ git status
On branch feat/ghost-memory-engine
Changes not staged for commit:
  modified: src/engine/allocator.ts
  modified: src/workers/collector.ts

$ npm run build
> ghosttrace-app@1.0.0 build
> tsc -b && vite build
src/engine/allocator.ts(42,15): error TS2322: Type 'null' is not assignable to type 'BufferPool'.
src/workers/collector.ts(118,7): error TS2554: Expected 2 arguments, but got 1.
npm ERR! Lifecycle script `build` failed with error: code 2

$ git diff src/engine/allocator.ts
$ sed -i 's/BufferPool | null/BufferPool/g' src/engine/allocator.ts
$ npm test
FAIL tests/allocator.test.ts
  ✕ should safely release orphaned buffers (12ms)
    AssertionError: expected 0 to equal 4
      at Object.<anonymous> (tests/allocator.test.ts:48:19)

$ echo "Checking destructor logic..."
Checking destructor logic...
$ python3 -c "print('Testing garbage collector cycle')"
Testing garbage collector cycle
$ git checkout -- src/engine/allocator.ts
$ git pull origin feat/ghost-memory-engine
Auto-merging src/workers/collector.ts
CONFLICT (content): Merge conflict in src/workers/collector.ts
Automatic merge failed; fix conflicts and then commit the result.

$ cat src/workers/collector.ts | grep -E "(<<<<<<<|=======|>>>>>>>)"
<<<<<<< HEAD
=======
>>>>>>> origin/feat/ghost-memory-engine

$ npx prettier --write src/workers/collector.ts
src/workers/collector.ts 45ms
$ npm test
PASS tests/allocator.test.ts (1.24s)
PASS tests/collector.test.ts (0.88s)
Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total

$ git add .
$ git commit -m "fix(engine): resolve orphaned buffer leak and reconcile worker merge conflict"
[feat/ghost-memory-engine a89c104] fix(engine): resolve orphaned buffer leak and reconcile worker merge conflict
 2 files changed, 48 insertions(+), 12 deletions(-)

$ git push origin feat/ghost-memory-engine
To github.com:developer/ghosttrace.git
   1d49e82..a89c104  feat/ghost-memory-engine -> feat/ghost-memory-engine
$ echo "Done at 03:42 AM. All quiet."
Done at 03:42 AM. All quiet."""
    }
]


def get_scenario_by_id(scenario_id: str) -> Dict[str, Any] | None:
    for s in SCENARIOS:
        if s["id"] == scenario_id:
            return s
    return None
