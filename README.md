# تتبع المناديب

مشروع Next.js لصفحة مندوب واحدة تقوم بـ:
- بدء تتبع الموقع من المتصفح
- حفظ كل نقطة في جدول `agent_locations` داخل Supabase
- عرض خريطة مباشرة للموقع الحالي والمسار الكامل

## 1) تثبيت المشروع

```bash
npm install
```

## 2) إنشاء ملف البيئة

انسخ الملف:

```bash
cp .env.example .env.local
```

أو أنشئ `.env.local` وضع فيه:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ktsprfeoqnmjcnhifjpq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_hnt81H5AXrvyq1GUHENvZw_rmfVIsba
```

## 3) تشغيل المشروع محليًا

```bash
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

## 4) جدول قاعدة البيانات

نفذ هذا في Supabase SQL Editor:

```sql
create table if not exists public.agent_locations (
  id bigint generated always as identity primary key,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  tracked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.agent_locations enable row level security;

create policy "allow_insert_locations"
on public.agent_locations
for insert
to anon, authenticated
with check (true);

create policy "allow_select_locations"
on public.agent_locations
for select
to anon, authenticated
using (true);
```

## 5) الرفع إلى GitHub

```bash
git init
git add .
git commit -m "Initial agent tracking app"
```

ثم أنشئ مستودع GitHub جديد واربطه:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## 6) الربط مع Vercel

- افتح Vercel
- اختر Import Project
- اختر مستودع GitHub
- أضف متغيرات البيئة التالية:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- ثم Deploy

## ملاحظات مهمة

- يجب السماح بإذن الموقع من المتصفح.
- يفضل استخدام HTTPS عند النشر على Vercel.
- المشروع الحالي مخصص لمندوب واحد على صفحة واحدة.
