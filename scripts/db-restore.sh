#!/bin/bash

# Database restore script
BACKUPS_DIR="backups"

echo "Available backups:"
ls -1 "$BACKUPS_DIR"/*.sql 2>/dev/null | awk -F'/' '{print NR ") " $NF}'

if [ -z "$(ls -A $BACKUPS_DIR/*.sql 2>/dev/null)" ]; then
    echo "No SQL backup files found in $BACKUPS_DIR/"
    exit 1
fi

read -p "Enter the number of the backup to restore (or type the full file name): " SELECTION

if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
    # Selected by number
    BACKUP_FILE=$(ls -1 "$BACKUPS_DIR"/*.sql 2>/dev/null | sed -n "${SELECTION}p")
else
    # Selected by name
    BACKUP_FILE="$BACKUPS_DIR/$SELECTION"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' does not exist."
    exit 1
fi

echo "Restoring database from $BACKUP_FILE..."

# Execute mysql restore inside the running db container
# We pipe the contents of the local file into the docker exec command
cat "$BACKUP_FILE" | docker compose exec -T db sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD"'

echo "Restore complete!"
