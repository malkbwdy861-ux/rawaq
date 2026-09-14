# مشروع مظلات جدة

موقع عربي مبني بـ Next.js مع لوحة إدارة مخصصة لإدارة الصفحات، الخدمات، الحلول، المواد، المشاريع، المقالات، الأسئلة الشائعة، الوسائط، والتحويلات الدائمة.

## التقنية المستخدمة

- Next.js 16 مع App Router.
- React 19 و TypeScript.
- Prisma ORM مع قاعدة بيانات PostgreSQL.
- NextAuth لإدارة جلسات لوحة التحكم.
- Tailwind CSS 4 لتنسيق الواجهة.
- TipTap لتحرير المحتوى الغني داخل لوحة الإدارة.
- نظام رفع وسائط يعتمد على تخزين ملفات دائم عبر `UPLOAD_DIR` وخدمة الملفات من `UPLOAD_PUBLIC_BASE`.

## متطلبات التشغيل والنشر

- Node.js 20 أو أحدث.
- npm، لأن المشروع يحتوي على `package-lock.json`.
- قاعدة بيانات PostgreSQL متاحة من بيئة الإنتاج.
- مساحة تخزين دائمة للملفات المرفوعة، وليست مساحة مؤقتة داخل حاوية أو بيئة serverless.
- نطاق production يعمل عبر HTTPS.
- إعداد متغيرات البيئة المذكورة أدناه قبل البناء والتشغيل.

## متغيرات البيئة

انسخ `.env.example` إلى ملف البيئة المناسب في الاستضافة، ثم عدل القيم:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
AUTH_SECRET="secure-random-secret"
APP_URL="https://example.com"
UPLOAD_DIR="/persistent/storage/uploads"
UPLOAD_PUBLIC_BASE="/uploads"
```

- `DATABASE_URL`: رابط اتصال PostgreSQL المستخدم من Prisma.
- `AUTH_SECRET`: مفتاح عشوائي قوي لجلسات المصادقة.
- `APP_URL`: رابط الموقع النهائي ويستخدم في SEO والروابط العامة.
- `UPLOAD_DIR`: المسار الفعلي لتخزين الملفات المرفوعة على الخادم.
- `UPLOAD_PUBLIC_BASE`: المسار العام الذي تُخدم منه الملفات، والقيمة الحالية المتوقعة عادة هي `/uploads`.

## التشغيل المحلي

```bash
npm install
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

افتح `http://localhost:3000` بعد تشغيل الخادم المحلي.

## خطوات النشر

1. جهز قاعدة PostgreSQL production.
2. جهز تخزينًا دائمًا للوسائط واضبط `UPLOAD_DIR` عليه.
3. أضف متغيرات البيئة في منصة الاستضافة.
4. ثبت الاعتمادات:

```bash
npm ci
```

5. ولّد Prisma Client وطبق migrations:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

6. نفذ seed للبيانات الأساسية عند أول نشر فقط أو عند الحاجة:

```bash
npm run db:seed
```

7. ابن المشروع:

```bash
npm run build
```

8. شغل production server:

```bash
npm run start
```

## ملاحظات مهمة للاستضافة

- إذا تم النشر على بيئة serverless مثل Vercel، لا تعتمد على نظام الملفات المحلي للوسائط لأنه قد يكون مؤقتًا. استخدم استضافة تدعم قرصًا دائمًا، أو اربط تخزينًا دائمًا قبل فتح رفع الصور في لوحة التحكم.
- يجب أن تكون قاعدة البيانات والتخزين ضمن نفس بيئة الإنتاج أو متاحين لها عبر الشبكة.
- تأكد أن `APP_URL` يطابق النطاق النهائي بدون شرطة مائلة في النهاية.
- لا تستخدم `prisma migrate dev` في الإنتاج؛ استخدم `npx prisma migrate deploy` فقط.

## التحقق قبل الإطلاق

```bash
npm run lint
npm run type-check
npm run build
```

بعد الإطلاق، تحقق من الصفحة الرئيسية، لوحة التحكم، تسجيل الدخول، رفع صورة، ظهور الوسائط عبر `/uploads`، وخريطة الموقع `sitemap.xml`.
