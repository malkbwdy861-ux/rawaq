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
        'GUIDES',
        'الأدلة',
        'أدلة عملية منشورة حول التظليل والمواد والأسعار والصيانة.',
        '{"hero":{"pageTitle":"أدلة واضحة لاختيار ما يناسب موقعك","eyebrow":"معرفة عملية، قبل قرار التنفيذ","shortDescription":"معلومات عملية عن المواد والأسعار والصيانة والمقارنات، مرتبة لتصل إلى القرار بثقة.","mediaId":"","imageAlt":""},"intro":{"title":"محتوى يساعدك على اتخاذ قرار أوضح","description":"استكشف أدلة عملية تشرح خيارات التظليل والمواد وعوامل الأسعار ومتطلبات الصيانة، لتفهم البدائل قبل بدء التنفيذ."}}'::jsonb
      ),
      (
        'MATERIALS',
        'المواد',
        'تصفح المواد والخيارات المنشورة والمدعومة في أعمال رواق شيدز.',
        '{"hero":{"pageTitle":"مواد واضحة لاختيارات تدوم","eyebrow":"دليل المواد","shortDescription":"قارن خصائص المواد واستخداماتها وحدودها قبل اختيار ما يلائم الموقع وظروفه.","mediaId":"","imageAlt":""},"intro":{"title":"اختيار المادة يبدأ من ظروف الموقع","description":"اختيار المادة لا يعتمد على الشكل وحده. الحرارة، التعرض للشمس، الاستخدام، والصيانة المطلوبة كلها عوامل تساعد على تحديد الخيار الأنسب للموقع."}}'::jsonb
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
