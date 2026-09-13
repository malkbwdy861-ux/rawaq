DO $$
DECLARE
  item RECORD;
  page_id TEXT;
  draft_id TEXT;
  published_id TEXT;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      (
        'PROJECTS',
        'المشاريع',
        'مشاريع ودراسات حالة منشورة من أعمال جده شيدنج.',
        '{"hero":{"pageTitle":"مشاريع نفذناها على أرض الواقع","eyebrow":"مشاريعنا","shortDescription":"نماذج من أعمالنا في المظلات والتظليل الخارجي في جدة.","mediaId":"","imageAlt":""},"intro":{"title":"أعمال حقيقية تعكس جودة التنفيذ","description":"استعرض مجموعة من مشاريعنا المنفذة في جدة، من مظلات المواقف والمدارس إلى الجلسات الخارجية والمظلات السكنية والتجارية. نركز في كل مشروع على جودة الخامات، دقة التنفيذ، ملاءمة التصميم للموقع وتحقيق أفضل استفادة من المساحة."}}'::jsonb
      ),
      (
        'SERVICES',
        'الخدمات',
        'خدمات التظليل والإنشاءات الخارجية المتاحة للمنازل والمواقع التجارية.',
        '{"hero":{"pageTitle":"خدمات تظليل وتنفيذ تناسب احتياجك","eyebrow":"خدماتنا","shortDescription":"تنفيذ احترافي للمظلات وحلول التظليل للمنازل والمنشآت والمساحات المختلفة.","mediaId":"","imageAlt":""},"intro":{"title":"خدمات متكاملة من التصميم حتى التنفيذ","description":"نقدم مجموعة متكاملة من خدمات المظلات والتظليل الخارجي في جدة، بدءاً من فهم احتياج الموقع واختيار الحل المناسب وحتى التوريد والتركيب والتشطيب، مع الاهتمام بجودة المواد ودقة التنفيذ."}}'::jsonb
      ),
      (
        'SOLUTIONS',
        'الحلول',
        'تصفح حلول جده شيدنج المنشورة لاحتياجات التظليل والاستخدامات الخارجية.',
        '{"hero":{"pageTitle":"حلول تظليل مصممة حسب احتياج الموقع","eyebrow":"حلولنا","shortDescription":"نساعدك في اختيار الحل المناسب حسب استخدام المساحة وطبيعة المشروع.","mediaId":"","imageAlt":""},"intro":{"title":"الحل المناسب يبدأ من فهم الموقع","description":"نقسم حلولنا حسب طبيعة الاستخدام والموقع لمساعدة العميل على الوصول إلى الخيار الأنسب، سواء للمواقف أو المدارس أو المساحات الخارجية أو المنازل أو المنشآت التجارية."}}'::jsonb
      )
    ) AS defaults(key, seo_title, seo_description, data)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM "Page" WHERE "key" = item.key::"PageKey") THEN
      page_id := 'c' || substr(md5(random()::text), 1, 24);
      draft_id := 'c' || substr(md5(random()::text), 1, 24);
      published_id := 'c' || substr(md5(random()::text), 1, 24);

      INSERT INTO "Page" ("id", "key", "status", "createdAt", "updatedAt")
      VALUES (page_id, item.key::"PageKey", 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

      INSERT INTO "PageVersion" ("id", "pageId", "data", "seoTitle", "seoDescription", "noIndex", "createdAt", "updatedAt")
      VALUES
        (draft_id, page_id, item.data, item.seo_title, item.seo_description, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (published_id, page_id, item.data, item.seo_title, item.seo_description, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

      UPDATE "Page"
      SET "draftVersionId" = draft_id,
          "publishedVersionId" = published_id,
          "publishedAt" = CURRENT_TIMESTAMP,
          "status" = 'PUBLISHED',
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = page_id;
    END IF;
  END LOOP;
END $$;
