# Verification — remote database performance, version 1.2.0

Validated locally on 6 November 2026 using isolated MySQL 5.5.62-0ubuntu0.14.04.1. No connection to the user’s actual hosted database was used.

| Check | Result |
|---|---|
| TypeScript and production/PWA build | Passed |
| Core and HTTPS proxy tests | 13 passed |
| Integration against MySQL 5.5.62 | 14 passed |
| Pool reuse and transaction drain | Twelve parallel reads used at most two connections; a transaction lease was not released before rollback |
| Snapshot revision checks | Unchanged tables omitted; medicine update returned only medicines; privileged settings and admin data remained restricted |
| Browser with imported snapshot | 247 medicines, 146 residents, 1,484 dispenses; no runtime errors |
| Initial clinical requests | Two bootstrap calls; audit and administrative collections omitted until needed |
| Dispense and audit pagination | 50 displayed rows each; next page works; full totals 1,484 and 1,675 |
| Unchanged snapshot response | 520 JSON characters versus 1,683,377 on the initial core/history/audit response in the same local fixture (character counts, not compressed network bytes) |
| Login again after session end | Passed |
| Hyperdrive Worker and MySQL55 HTTPS-proxy Worker | Dry-run bundles passed; not deployed |

The unchanged-response figures demonstrate reduced transfer, not measured latency on FreeSQLDatabase. Network latency, provider load and limits remain outside these local tests. Clinical bootstrap requests use a bounded Node pool, with two connections by default, and do not overlap in the client. The direct CLI connection factory remains separate so import/export jobs can close their own connections normally. Worker Hyperdrive connections remain request-scoped.

The deliberate audit-write failure test emits ER_NO_SUCH_TABLE and succeeds only if stock and the dispense record roll back. Concurrent dispensing, idempotent retries, scheduled doses, lookup changes, password updates, backups, session revocation and atomic imports all remain covered. Plaintext user passwords remain stored as requested and are excluded from ordinary browser responses.

No schema or data import is required for this update. Browser printing covers the displayed table page; existing exports process the full filtered loaded collection. The legacy App still emits a bundle-size warning. The snapshot lacks doctors; its row counts do not prove a complete live Firebase export.

## Earlier version 1.1 validation

The earlier compatibility release also passed 12 integration tests on MySQL 8.0.46 and verified 3,759 imported records, with exact payload and textual password equality. That engine was not re-run for version 1.2.0. The current compatibility changes retain both schema paths.

Not performed: physical Windows execution, live hosted-database performance measurements, public deployment or end-to-end public HTTPS proxy operation. Hyperdrive’s documented known MySQL versions start at 5.7; the MySQL55 path uses a continuously running HTTPS Express backend.

Source baseline: c9576695098f4eea2e861fe1601e8d35081e1878. GitHub access for this repository is read-only; delivery is by ZIP and included patch, with no remote branch changes.
