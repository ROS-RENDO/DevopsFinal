#!/bin/bash

# =============================================================================
# Automated Database Backup Script (for cron execution)
# Runs inside the db-backup-cron container
# - Connects directly to MySQL via network (no docker exec needed)
# - Compresses backups with gzip
# - Cleans up old backups based on retention policy
# =============================================================================

set -euo pipefail

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/devsec_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

echo "============================================"
echo "[$(date)] Starting database backup..."
echo "============================================"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Run mysqldump and compress with gzip
echo "[$(date)] Dumping database '${MYSQL_DATABASE}' from host '${MYSQL_HOST}'..."
mysqldump \
  -h "${MYSQL_HOST}" \
  -u "${MYSQL_USER}" \
  -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  --databases "${MYSQL_DATABASE}" \
  | gzip > "$BACKUP_FILE"

# Verify the backup file was created and is not empty
if [ -s "$BACKUP_FILE" ]; then
  FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "[$(date)] Backup successful: $BACKUP_FILE ($FILESIZE)"
else
  echo "[$(date)] ERROR: Backup file is empty or was not created!"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "devsec_db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print -delete | wc -l)
echo "[$(date)] Deleted $DELETED_COUNT old backup(s)."

# List current backups
echo "[$(date)] Current backups:"
ls -lh "$BACKUP_DIR"/devsec_db_*.sql.gz 2>/dev/null || echo "  (none)"

echo "============================================"
echo "[$(date)] Backup process complete!"
echo "============================================"
