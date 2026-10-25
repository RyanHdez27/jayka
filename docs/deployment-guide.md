# Final Deployment & Technical Manual

## 1. Database Migration to Production
To switch from local Docker PostgreSQL to Supabase:
1. Update the `.env` file in the backend:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST=db.your-project.supabase.co`
   - `DB_PORT=5432`
   - `DB_DATABASE=postgres`
   - `DB_USERNAME=postgres`
   - `DB_PASSWORD=your-secure-password`
2. Run `php artisan migrate --seed` on the production server to initialize the schema and base data.

## 2. Image Management
Currently, images are hosted via external URLs (Unsplash). For production:
- **Recommendation:** Use **Supabase Storage**.
- **Implementation:** Create buckets for `services`, `projects`, and `posts`. Update the `image_url` in the database to point to the Supabase public URL.

## 3. Maintenance
- **Backups:** Supabase handles automatic daily backups of the PostgreSQL database.
- **Logs:** Application logs are located in `backend/storage/logs/laravel.log`. In production, consider using a tool like Sentry or Papertrail.

## 4. ERD Summary (Final)
- **User** (Admin) $\rightarrow$ Manages everything.
- **Service** $\rightarrow$ Has many **Projects**.
- **Category** $\rightarrow$ Has many **Posts**.
- **Post** $\rightarrow$ Written by **User**, belongs to **Category**.
- **Lead** $\rightarrow$ Independent entity captured from contact form.
