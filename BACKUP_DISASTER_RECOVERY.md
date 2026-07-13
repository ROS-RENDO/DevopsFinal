# Backup & Disaster Recovery Strategy

This document outlines the backup and disaster recovery procedures for our application.

## 1. What is Backed Up?
We perform a complete dump of all databases stored within the `db` MySQL container. This includes the primary application database and any system schemas required for MySQL to function. The data is backed up into a standard `.sql` file using `mysqldump`.

## 2. How Often?
Automated backups are scheduled to run **daily at 02:00 AM (server time)**.
This is achieved via a dedicated `db-backup` cron container that runs alongside the application in our Docker Compose stack. It uses the `scripts/cron-job.sh` script. 

To prevent disk exhaustion, the automated script is configured to only retain backups from the last **7 days**. Older backup files are automatically deleted.

## 3. Where are Backups Stored?
Backups are saved to the `./backups/` directory on the host machine.
This directory is mounted as a volume in the `db-backup` container, ensuring that backup files persist even if the containers are removed or rebuilt. The backup files are named using the following format: `cron_db_backup_YYYY-MM-DD_HHMMSS.sql`.

## 4. How to Restore from a Backup (Disaster Recovery)
If data loss or corruption occurs, you can restore the database from an existing `.sql` backup file.

### Prerequisites
- The `db` container must be running. You can ensure it is running using `docker compose up -d db`.
- You must know the path to the backup file you wish to restore (e.g., `backups/cron_db_backup_2024-05-10_020000.sql`).

### Restore Walkthrough
1. **Locate your backup file**
   List the available backups by running:
   ```bash
   ls -la backups/
   ```

2. **Run the restore script**
   We provide a dedicated restore script that streams the SQL backup directly into the running database container. Run the following command from the project root:
   ```bash
   bash scripts/db-restore.sh backups/<YOUR_BACKUP_FILENAME>.sql
   ```
   *Example:*
   ```bash
   bash scripts/db-restore.sh backups/cron_db_backup_2024-05-10_020000.sql
   ```

3. **Verify Restoration**
   The script will display `Restore complete! Data has been successfully recovered.` upon successful execution. You can then check the application to ensure the state has been rolled back to the backup's snapshot.

### Manual Backup (Optional)
If you need to trigger a backup outside of the scheduled cron window (e.g., right before a major deployment), you can manually run our manual backup script:
```bash
bash scripts/db-backup.sh
```
This will instantly create a new backup file in the `./backups/` directory named `devsec_db_YYYY-MM-DD_HHMMSS.sql`.
