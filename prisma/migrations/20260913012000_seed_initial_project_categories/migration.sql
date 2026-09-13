-- Create only the project categories needed by the existing project portfolio.
-- Slugs match normalizeCmsSlug(name) output used by the application.
INSERT INTO "ProjectCategory" ("id", "name", "slug", "iconKey", "description", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('cprojcatvilla0000000001', 'مظلات فلل', 'مظلات-فلل', 'home', NULL, true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cprojcatpark00000000001', 'مظلات مواقف', 'مظلات-مواقف', 'car', NULL, true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cprojcatschool000000001', 'مظلات مدارس', 'مظلات-مدارس', 'school', NULL, true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cprojcatoutdoor00000001', 'مظلات جلسات خارجية', 'مظلات-جلسات-خارجية', 'trees', NULL, true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cprojcatcommer000000001', 'مظلات تجارية', 'مظلات-تجارية', 'building', NULL, true, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

WITH assignments("projectId", "categorySlug") AS (
  VALUES
    ('cmtz4eqh70000in749580hvmw', 'مظلات-فلل'),
    ('cmtz4gnxa0005in741whthh40', 'مظلات-مواقف'),
    ('cmtz4hyir000ain7456yn2dwz', 'مظلات-جلسات-خارجية'),
    ('cmtz4ji3d000fin745cb6g47j', 'مظلات-مدارس'),
    ('cmtz4m1rw000min74t6roevzh', 'مظلات-تجارية'),
    ('cmtz4nhae000rin74dg53wsnp', 'مظلات-جلسات-خارجية')
)
UPDATE "ProjectVersion" AS pv
SET "categoryId" = pc."id"
FROM assignments AS a
JOIN "Project" AS p ON p."id" = a."projectId"
JOIN "ProjectCategory" AS pc ON pc."slug" = a."categorySlug"
WHERE pv."id" IN (p."draftVersionId", p."publishedVersionId")
  AND pv."categoryId" IS DISTINCT FROM pc."id";
