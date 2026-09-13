UPDATE "PageVersion"
SET "data" = jsonb_set(
  "data",
  '{featuredProjects,description}',
  to_jsonb('نعرض مجموعة مختارة من المشاريع التي تعكس جودة التنفيذ واهتمامنا بالتفاصيل في مختلف أنحاء جدة.'::text)
)
WHERE "data"->'featuredProjects'->>'description' = 'عند إضافة مشاريع منشورة ستظهر هنا كدليل على جودة التنفيذ.';
