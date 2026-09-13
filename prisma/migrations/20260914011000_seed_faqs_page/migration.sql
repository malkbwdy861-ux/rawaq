DO $$
DECLARE
  page_id TEXT;
  draft_id TEXT;
  published_id TEXT;
  page_data JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Page" WHERE "key" = 'FAQS'::"PageKey") THEN
    page_id := 'c' || substr(md5(random()::text), 1, 24);
    draft_id := 'c' || substr(md5(random()::text), 1, 24);
    published_id := 'c' || substr(md5(random()::text), 1, 24);

    SELECT jsonb_build_object(
      'hero', jsonb_build_object(
        'title', 'الأسئلة الشائعة',
        'description', 'إجابات واضحة عن أكثر الأسئلة شيوعاً حول خدمات المظلات والتظليل وآلية التنفيذ.'
      ),
      'faqSection', jsonb_build_object(
        'selectedFaqIds', COALESCE(jsonb_agg(f."id" ORDER BY COALESCE(v."sortOrder", 0), f."createdAt", f."id") FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb)
      )
    )
    INTO page_data
    FROM "FAQ" f
    LEFT JOIN "FAQVersion" v ON v."id" = f."publishedVersionId"
    WHERE f."status" = 'PUBLISHED' AND f."publishedVersionId" IS NOT NULL;

    INSERT INTO "Page" ("id", "key", "status", "createdAt", "updatedAt")
    VALUES (page_id, 'FAQS'::"PageKey", 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    INSERT INTO "PageVersion" ("id", "pageId", "data", "seoTitle", "seoDescription", "noIndex", "createdAt", "updatedAt")
    VALUES
      (draft_id, page_id, page_data, 'الأسئلة الشائعة', 'إجابات عن الأسئلة الشائعة حول خدمات المظلات والتظليل والتنفيذ في جدة.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (published_id, page_id, page_data, 'الأسئلة الشائعة', 'إجابات عن الأسئلة الشائعة حول خدمات المظلات والتظليل والتنفيذ في جدة.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    UPDATE "Page"
    SET "draftVersionId" = draft_id,
        "publishedVersionId" = published_id,
        "publishedAt" = CURRENT_TIMESTAMP,
        "status" = 'PUBLISHED',
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = page_id;
  END IF;
END $$;
