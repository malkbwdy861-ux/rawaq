-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'FILE');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('GUIDE', 'PRICING', 'COMPARISON', 'MAINTENANCE', 'GENERAL');

-- CreateEnum
CREATE TYPE "PageKey" AS ENUM ('HOME', 'ABOUT', 'CONTACT', 'PRICES');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVersion" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "shortDescription" TEXT,
    "content" TEXT,
    "heroMediaId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolutionVersion" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "shortDescription" TEXT,
    "content" TEXT,
    "heroMediaId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolutionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialVersion" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "shortDescription" TEXT,
    "content" TEXT,
    "advantages" JSONB,
    "limitations" JSONB,
    "maintenanceNotes" TEXT,
    "recommendedUses" JSONB,
    "heroMediaId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "shortDescription" TEXT,
    "content" TEXT,
    "challenge" TEXT,
    "solutionSummary" TEXT,
    "technicalDetails" TEXT,
    "completedAt" TIMESTAMP(3),
    "city" TEXT,
    "district" TEXT,
    "coverMediaId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleVersion" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "excerpt" TEXT,
    "content" JSONB,
    "heroMediaId" TEXT,
    "articleType" "ArticleType",
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQVersion" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "key" "PageKey" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "draftVersionId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "data" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "openGraphTitle" TEXT,
    "openGraphDescription" TEXT,
    "openGraphImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersionGallery" (
    "id" TEXT NOT NULL,
    "projectVersionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "caption" TEXT,

    CONSTRAINT "ProjectVersionGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDescription" TEXT,
    "logoMediaId" TEXT,
    "primaryPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "businessHours" TEXT,
    "socialLinks" JSONB,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "defaultOpenGraphImageId" TEXT,
    "defaultCtaText" TEXT,
    "defaultWhatsappText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "destinationPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVersionSolution" (
    "serviceVersionId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,

    CONSTRAINT "ServiceVersionSolution_pkey" PRIMARY KEY ("serviceVersionId","solutionId")
);

-- CreateTable
CREATE TABLE "ServiceVersionMaterial" (
    "serviceVersionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "ServiceVersionMaterial_pkey" PRIMARY KEY ("serviceVersionId","materialId")
);

-- CreateTable
CREATE TABLE "ServiceVersionProject" (
    "serviceVersionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ServiceVersionProject_pkey" PRIMARY KEY ("serviceVersionId","projectId")
);

-- CreateTable
CREATE TABLE "ServiceVersionArticle" (
    "serviceVersionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "ServiceVersionArticle_pkey" PRIMARY KEY ("serviceVersionId","articleId")
);

-- CreateTable
CREATE TABLE "ServiceVersionFAQ" (
    "serviceVersionId" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,

    CONSTRAINT "ServiceVersionFAQ_pkey" PRIMARY KEY ("serviceVersionId","faqId")
);

-- CreateTable
CREATE TABLE "SolutionVersionService" (
    "solutionVersionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "SolutionVersionService_pkey" PRIMARY KEY ("solutionVersionId","serviceId")
);

-- CreateTable
CREATE TABLE "SolutionVersionMaterial" (
    "solutionVersionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "SolutionVersionMaterial_pkey" PRIMARY KEY ("solutionVersionId","materialId")
);

-- CreateTable
CREATE TABLE "SolutionVersionProject" (
    "solutionVersionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "SolutionVersionProject_pkey" PRIMARY KEY ("solutionVersionId","projectId")
);

-- CreateTable
CREATE TABLE "SolutionVersionArticle" (
    "solutionVersionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "SolutionVersionArticle_pkey" PRIMARY KEY ("solutionVersionId","articleId")
);

-- CreateTable
CREATE TABLE "SolutionVersionFAQ" (
    "solutionVersionId" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,

    CONSTRAINT "SolutionVersionFAQ_pkey" PRIMARY KEY ("solutionVersionId","faqId")
);

-- CreateTable
CREATE TABLE "MaterialVersionService" (
    "materialVersionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "MaterialVersionService_pkey" PRIMARY KEY ("materialVersionId","serviceId")
);

-- CreateTable
CREATE TABLE "MaterialVersionSolution" (
    "materialVersionId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,

    CONSTRAINT "MaterialVersionSolution_pkey" PRIMARY KEY ("materialVersionId","solutionId")
);

-- CreateTable
CREATE TABLE "MaterialVersionProject" (
    "materialVersionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "MaterialVersionProject_pkey" PRIMARY KEY ("materialVersionId","projectId")
);

-- CreateTable
CREATE TABLE "MaterialVersionArticle" (
    "materialVersionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "MaterialVersionArticle_pkey" PRIMARY KEY ("materialVersionId","articleId")
);

-- CreateTable
CREATE TABLE "MaterialVersionFAQ" (
    "materialVersionId" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,

    CONSTRAINT "MaterialVersionFAQ_pkey" PRIMARY KEY ("materialVersionId","faqId")
);

-- CreateTable
CREATE TABLE "ProjectVersionService" (
    "projectVersionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ProjectVersionService_pkey" PRIMARY KEY ("projectVersionId","serviceId")
);

-- CreateTable
CREATE TABLE "ProjectVersionSolution" (
    "projectVersionId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,

    CONSTRAINT "ProjectVersionSolution_pkey" PRIMARY KEY ("projectVersionId","solutionId")
);

-- CreateTable
CREATE TABLE "ProjectVersionMaterial" (
    "projectVersionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "ProjectVersionMaterial_pkey" PRIMARY KEY ("projectVersionId","materialId")
);

-- CreateTable
CREATE TABLE "ProjectVersionArticle" (
    "projectVersionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "ProjectVersionArticle_pkey" PRIMARY KEY ("projectVersionId","articleId")
);

-- CreateTable
CREATE TABLE "ArticleVersionService" (
    "articleVersionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ArticleVersionService_pkey" PRIMARY KEY ("articleVersionId","serviceId")
);

-- CreateTable
CREATE TABLE "ArticleVersionSolution" (
    "articleVersionId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,

    CONSTRAINT "ArticleVersionSolution_pkey" PRIMARY KEY ("articleVersionId","solutionId")
);

-- CreateTable
CREATE TABLE "ArticleVersionMaterial" (
    "articleVersionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,

    CONSTRAINT "ArticleVersionMaterial_pkey" PRIMARY KEY ("articleVersionId","materialId")
);

-- CreateTable
CREATE TABLE "ArticleVersionProject" (
    "articleVersionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ArticleVersionProject_pkey" PRIMARY KEY ("articleVersionId","projectId")
);

-- CreateTable
CREATE TABLE "ArticleVersionFAQ" (
    "articleVersionId" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,

    CONSTRAINT "ArticleVersionFAQ_pkey" PRIMARY KEY ("articleVersionId","faqId")
);

-- CreateIndex
CREATE INDEX "Media_storedFilename_idx" ON "Media"("storedFilename");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Service_publishedVersionId_key" ON "Service"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_draftVersionId_key" ON "Service"("draftVersionId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_publishedAt_idx" ON "Service"("publishedAt");

-- CreateIndex
CREATE INDEX "ServiceVersion_serviceId_idx" ON "ServiceVersion"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceVersion_slug_idx" ON "ServiceVersion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_publishedVersionId_key" ON "Solution"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_draftVersionId_key" ON "Solution"("draftVersionId");

-- CreateIndex
CREATE INDEX "Solution_status_idx" ON "Solution"("status");

-- CreateIndex
CREATE INDEX "Solution_publishedAt_idx" ON "Solution"("publishedAt");

-- CreateIndex
CREATE INDEX "SolutionVersion_solutionId_idx" ON "SolutionVersion"("solutionId");

-- CreateIndex
CREATE INDEX "SolutionVersion_slug_idx" ON "SolutionVersion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Material_publishedVersionId_key" ON "Material"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_draftVersionId_key" ON "Material"("draftVersionId");

-- CreateIndex
CREATE INDEX "Material_status_idx" ON "Material"("status");

-- CreateIndex
CREATE INDEX "Material_publishedAt_idx" ON "Material"("publishedAt");

-- CreateIndex
CREATE INDEX "MaterialVersion_materialId_idx" ON "MaterialVersion"("materialId");

-- CreateIndex
CREATE INDEX "MaterialVersion_slug_idx" ON "MaterialVersion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publishedVersionId_key" ON "Project"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_draftVersionId_key" ON "Project"("draftVersionId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_publishedAt_idx" ON "Project"("publishedAt");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_idx" ON "ProjectVersion"("projectId");

-- CreateIndex
CREATE INDEX "ProjectVersion_slug_idx" ON "ProjectVersion"("slug");

-- CreateIndex
CREATE INDEX "ProjectVersion_city_idx" ON "ProjectVersion"("city");

-- CreateIndex
CREATE INDEX "ProjectVersion_district_idx" ON "ProjectVersion"("district");

-- CreateIndex
CREATE UNIQUE INDEX "Article_publishedVersionId_key" ON "Article"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_draftVersionId_key" ON "Article"("draftVersionId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "ArticleVersion_articleId_idx" ON "ArticleVersion"("articleId");

-- CreateIndex
CREATE INDEX "ArticleVersion_slug_idx" ON "ArticleVersion"("slug");

-- CreateIndex
CREATE INDEX "ArticleVersion_articleType_idx" ON "ArticleVersion"("articleType");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_publishedVersionId_key" ON "FAQ"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_draftVersionId_key" ON "FAQ"("draftVersionId");

-- CreateIndex
CREATE INDEX "FAQ_status_idx" ON "FAQ"("status");

-- CreateIndex
CREATE INDEX "FAQ_publishedAt_idx" ON "FAQ"("publishedAt");

-- CreateIndex
CREATE INDEX "FAQVersion_faqId_idx" ON "FAQVersion"("faqId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_key_key" ON "Page"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Page_publishedVersionId_key" ON "Page"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_draftVersionId_key" ON "Page"("draftVersionId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX "Page_publishedAt_idx" ON "Page"("publishedAt");

-- CreateIndex
CREATE INDEX "PageVersion_pageId_idx" ON "PageVersion"("pageId");

-- CreateIndex
CREATE INDEX "ProjectVersionGallery_projectVersionId_idx" ON "ProjectVersionGallery"("projectVersionId");

-- CreateIndex
CREATE INDEX "ProjectVersionGallery_mediaId_idx" ON "ProjectVersionGallery"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersionGallery_projectVersionId_mediaId_key" ON "ProjectVersionGallery"("projectVersionId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_sourcePath_key" ON "Redirect"("sourcePath");

-- CreateIndex
CREATE INDEX "ServiceVersionSolution_solutionId_idx" ON "ServiceVersionSolution"("solutionId");

-- CreateIndex
CREATE INDEX "ServiceVersionMaterial_materialId_idx" ON "ServiceVersionMaterial"("materialId");

-- CreateIndex
CREATE INDEX "ServiceVersionProject_projectId_idx" ON "ServiceVersionProject"("projectId");

-- CreateIndex
CREATE INDEX "ServiceVersionArticle_articleId_idx" ON "ServiceVersionArticle"("articleId");

-- CreateIndex
CREATE INDEX "ServiceVersionFAQ_faqId_idx" ON "ServiceVersionFAQ"("faqId");

-- CreateIndex
CREATE INDEX "SolutionVersionService_serviceId_idx" ON "SolutionVersionService"("serviceId");

-- CreateIndex
CREATE INDEX "SolutionVersionMaterial_materialId_idx" ON "SolutionVersionMaterial"("materialId");

-- CreateIndex
CREATE INDEX "SolutionVersionProject_projectId_idx" ON "SolutionVersionProject"("projectId");

-- CreateIndex
CREATE INDEX "SolutionVersionArticle_articleId_idx" ON "SolutionVersionArticle"("articleId");

-- CreateIndex
CREATE INDEX "SolutionVersionFAQ_faqId_idx" ON "SolutionVersionFAQ"("faqId");

-- CreateIndex
CREATE INDEX "MaterialVersionService_serviceId_idx" ON "MaterialVersionService"("serviceId");

-- CreateIndex
CREATE INDEX "MaterialVersionSolution_solutionId_idx" ON "MaterialVersionSolution"("solutionId");

-- CreateIndex
CREATE INDEX "MaterialVersionProject_projectId_idx" ON "MaterialVersionProject"("projectId");

-- CreateIndex
CREATE INDEX "MaterialVersionArticle_articleId_idx" ON "MaterialVersionArticle"("articleId");

-- CreateIndex
CREATE INDEX "MaterialVersionFAQ_faqId_idx" ON "MaterialVersionFAQ"("faqId");

-- CreateIndex
CREATE INDEX "ProjectVersionService_serviceId_idx" ON "ProjectVersionService"("serviceId");

-- CreateIndex
CREATE INDEX "ProjectVersionSolution_solutionId_idx" ON "ProjectVersionSolution"("solutionId");

-- CreateIndex
CREATE INDEX "ProjectVersionMaterial_materialId_idx" ON "ProjectVersionMaterial"("materialId");

-- CreateIndex
CREATE INDEX "ProjectVersionArticle_articleId_idx" ON "ProjectVersionArticle"("articleId");

-- CreateIndex
CREATE INDEX "ArticleVersionService_serviceId_idx" ON "ArticleVersionService"("serviceId");

-- CreateIndex
CREATE INDEX "ArticleVersionSolution_solutionId_idx" ON "ArticleVersionSolution"("solutionId");

-- CreateIndex
CREATE INDEX "ArticleVersionMaterial_materialId_idx" ON "ArticleVersionMaterial"("materialId");

-- CreateIndex
CREATE INDEX "ArticleVersionProject_projectId_idx" ON "ArticleVersionProject"("projectId");

-- CreateIndex
CREATE INDEX "ArticleVersionFAQ_faqId_idx" ON "ArticleVersionFAQ"("faqId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "ServiceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "ServiceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersion" ADD CONSTRAINT "ServiceVersion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersion" ADD CONSTRAINT "ServiceVersion_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersion" ADD CONSTRAINT "ServiceVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "SolutionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "SolutionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersion" ADD CONSTRAINT "SolutionVersion_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersion" ADD CONSTRAINT "SolutionVersion_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersion" ADD CONSTRAINT "SolutionVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "MaterialVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "MaterialVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersion" ADD CONSTRAINT "MaterialVersion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersion" ADD CONSTRAINT "MaterialVersion_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersion" ADD CONSTRAINT "MaterialVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "ProjectVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "ProjectVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "ArticleVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "ArticleVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "FAQVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "FAQVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQVersion" ADD CONSTRAINT "FAQVersion_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "PageVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_draftVersionId_fkey" FOREIGN KEY ("draftVersionId") REFERENCES "PageVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_openGraphImageId_fkey" FOREIGN KEY ("openGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionGallery" ADD CONSTRAINT "ProjectVersionGallery_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionGallery" ADD CONSTRAINT "ProjectVersionGallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_logoMediaId_fkey" FOREIGN KEY ("logoMediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_defaultOpenGraphImageId_fkey" FOREIGN KEY ("defaultOpenGraphImageId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionSolution" ADD CONSTRAINT "ServiceVersionSolution_serviceVersionId_fkey" FOREIGN KEY ("serviceVersionId") REFERENCES "ServiceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionSolution" ADD CONSTRAINT "ServiceVersionSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionMaterial" ADD CONSTRAINT "ServiceVersionMaterial_serviceVersionId_fkey" FOREIGN KEY ("serviceVersionId") REFERENCES "ServiceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionMaterial" ADD CONSTRAINT "ServiceVersionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionProject" ADD CONSTRAINT "ServiceVersionProject_serviceVersionId_fkey" FOREIGN KEY ("serviceVersionId") REFERENCES "ServiceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionProject" ADD CONSTRAINT "ServiceVersionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionArticle" ADD CONSTRAINT "ServiceVersionArticle_serviceVersionId_fkey" FOREIGN KEY ("serviceVersionId") REFERENCES "ServiceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionArticle" ADD CONSTRAINT "ServiceVersionArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionFAQ" ADD CONSTRAINT "ServiceVersionFAQ_serviceVersionId_fkey" FOREIGN KEY ("serviceVersionId") REFERENCES "ServiceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVersionFAQ" ADD CONSTRAINT "ServiceVersionFAQ_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionService" ADD CONSTRAINT "SolutionVersionService_solutionVersionId_fkey" FOREIGN KEY ("solutionVersionId") REFERENCES "SolutionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionService" ADD CONSTRAINT "SolutionVersionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionMaterial" ADD CONSTRAINT "SolutionVersionMaterial_solutionVersionId_fkey" FOREIGN KEY ("solutionVersionId") REFERENCES "SolutionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionMaterial" ADD CONSTRAINT "SolutionVersionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionProject" ADD CONSTRAINT "SolutionVersionProject_solutionVersionId_fkey" FOREIGN KEY ("solutionVersionId") REFERENCES "SolutionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionProject" ADD CONSTRAINT "SolutionVersionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionArticle" ADD CONSTRAINT "SolutionVersionArticle_solutionVersionId_fkey" FOREIGN KEY ("solutionVersionId") REFERENCES "SolutionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionArticle" ADD CONSTRAINT "SolutionVersionArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionFAQ" ADD CONSTRAINT "SolutionVersionFAQ_solutionVersionId_fkey" FOREIGN KEY ("solutionVersionId") REFERENCES "SolutionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionVersionFAQ" ADD CONSTRAINT "SolutionVersionFAQ_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionService" ADD CONSTRAINT "MaterialVersionService_materialVersionId_fkey" FOREIGN KEY ("materialVersionId") REFERENCES "MaterialVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionService" ADD CONSTRAINT "MaterialVersionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionSolution" ADD CONSTRAINT "MaterialVersionSolution_materialVersionId_fkey" FOREIGN KEY ("materialVersionId") REFERENCES "MaterialVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionSolution" ADD CONSTRAINT "MaterialVersionSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionProject" ADD CONSTRAINT "MaterialVersionProject_materialVersionId_fkey" FOREIGN KEY ("materialVersionId") REFERENCES "MaterialVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionProject" ADD CONSTRAINT "MaterialVersionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionArticle" ADD CONSTRAINT "MaterialVersionArticle_materialVersionId_fkey" FOREIGN KEY ("materialVersionId") REFERENCES "MaterialVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionArticle" ADD CONSTRAINT "MaterialVersionArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionFAQ" ADD CONSTRAINT "MaterialVersionFAQ_materialVersionId_fkey" FOREIGN KEY ("materialVersionId") REFERENCES "MaterialVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialVersionFAQ" ADD CONSTRAINT "MaterialVersionFAQ_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionService" ADD CONSTRAINT "ProjectVersionService_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionService" ADD CONSTRAINT "ProjectVersionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionSolution" ADD CONSTRAINT "ProjectVersionSolution_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionSolution" ADD CONSTRAINT "ProjectVersionSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionMaterial" ADD CONSTRAINT "ProjectVersionMaterial_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionMaterial" ADD CONSTRAINT "ProjectVersionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionArticle" ADD CONSTRAINT "ProjectVersionArticle_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersionArticle" ADD CONSTRAINT "ProjectVersionArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionService" ADD CONSTRAINT "ArticleVersionService_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionService" ADD CONSTRAINT "ArticleVersionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionSolution" ADD CONSTRAINT "ArticleVersionSolution_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionSolution" ADD CONSTRAINT "ArticleVersionSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionMaterial" ADD CONSTRAINT "ArticleVersionMaterial_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionMaterial" ADD CONSTRAINT "ArticleVersionMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionProject" ADD CONSTRAINT "ArticleVersionProject_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionProject" ADD CONSTRAINT "ArticleVersionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionFAQ" ADD CONSTRAINT "ArticleVersionFAQ_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersionFAQ" ADD CONSTRAINT "ArticleVersionFAQ_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

