# Media Management Reference

## 1. Purpose

Defines media storage, upload, metadata, serving, deletion, and backup.

V1 uses persistent server filesystem storage.

No external object-storage provider is required.

---

## 2. Storage Model

```text
Persistent Filesystem
/data/uploads/...

PostgreSQL
Media metadata row
```

Do not store file binaries in PostgreSQL.

---

## 3. Persistent Storage

Uploads must survive:
- deployment,
- container recreation,
- application update.

Use:
- Docker/Coolify persistent volume,
- or host-mounted persistent directory.

Do not rely on ephemeral container filesystem.

---

## 4. Directory Strategy

Media is reusable across entities.

Therefore storage directories should not be tied to entity ownership such as:
```text
/uploads/projects
/uploads/services
```

Preferred neutral strategy:

```text
/data/uploads/
└── 2026/
    └── 09/
        ├── <generated-file-1>.webp
        └── <generated-file-2>.jpg
```

or an equivalent neutral date/ID-based structure.

Reason:
- the same Media can be reused by multiple entities,
- easier backup/migration,
- storage path does not imply business ownership.

---

## 5. Filename Strategy

Never use raw user filename as stored filename.

Generate:
```text
<uuid-or-secure-random-id>.<safe-extension>
```

Store original filename separately.

---

## 6. Upload Validation

Server validates:
- authentication,
- MIME type,
- size,
- extension consistency where practical,
- image decodability for images.

Do not trust browser MIME alone.

---

## 7. Allowed Types

Recommended initial:
- JPEG,
- PNG,
- WebP,
- AVIF if supported reliably.

SVG:
- disallow initially unless needed,
- or sanitize strictly before acceptance.

---

## 8. Upload Size

Set explicit max size in centralized config.

Do not allow unbounded uploads.

Avoid duplicated hardcoded limits.

---

## 9. Metadata

Store:
- originalFilename,
- storedFilename,
- storagePath,
- URL,
- MIME type,
- sizeBytes,
- width,
- height,
- altText,
- caption,
- createdAt,
- updatedAt.

---

## 10. Public URL

Separate:
```text
storagePath:
/data/uploads/2026/09/abc.webp

url:
/media/2026/09/abc.webp
```

Do not expose raw host path.

---

## 11. Serving

Prefer efficient stable public serving.

Implementation may use:
- reverse-proxy/static mapping,
- controlled Next.js route where needed.

Public media should work behind the production domain.

---

## 12. Media Reuse

CMS supports:
```text
Select Existing
or
Upload New
```

Content versions store Media references by ID.

Do not duplicate the same file for every use.

---

## 13. Alt Text

Editable.

Rules:
- meaningful description,
- no keyword stuffing,
- do not auto-fill from filename.

Decorative images may render with empty alt where appropriate.

---

## 14. Deletion

Before deletion:
1. check references,
2. warn/block if actively referenced,
3. coordinate DB record and filesystem removal.

Do not silently leave:
- orphan DB rows,
- orphan files,
- broken public references.

---

## 15. Orphan Detection

Optional maintenance can detect:
- file exists, no Media row,
- Media row exists, file missing,
- unused Media records.

Do not auto-delete suspected orphans without a safe policy.

---

## 16. Security

Protect against:
- path traversal,
- executable uploads,
- MIME spoofing,
- oversized uploads,
- double extensions,
- malicious SVGs,
- unauthorized uploads.

Upload directory must not execute uploaded code.

---

## 17. Backup

Backup both:
- PostgreSQL,
- uploads directory.

Database backup alone is insufficient.

---

## 18. Restore

Restore procedure:
1. restore DB,
2. restore uploads,
3. preserve expected paths,
4. verify Media URLs,
5. verify upload env config.

---

## 19. Environment

Recommended:
```text
UPLOAD_DIR=/data/uploads
UPLOAD_PUBLIC_BASE=/media
```

Exact production values may differ.

---

## 20. Migration to Another Server

To migrate:
- copy uploads,
- restore DB,
- preserve path structure,
- update environment only if needed.

Avoid host-specific paths in public content.

---

## 21. Future External Storage

External storage may be added later.

Do not introduce S3/R2/Cloudinary abstraction if it adds unnecessary V1 complexity.

---

## 22. AI Guardrails

Do not:
- use external storage by default,
- store binary in DB,
- store persistent media in ephemeral layer,
- tie file directory to one entity type,
- expose host filesystem paths,
- allow unauthenticated uploads,
- delete referenced media silently.
