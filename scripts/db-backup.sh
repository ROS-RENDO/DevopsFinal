#!/bin/bash

# Database backup script
mkdir -p backups

TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="backups/devsec_db_${TIMESTAMP}.sql"

echo "Backing up database to $BACKUP_FILE..."

# Execute mysqldump inside the running db container
docker compose exec db sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases' > "$BACKUP_FILE"

echo "Backup complete!"
