import type { ContentStatus } from "@prisma/client";

export type CmsStatus = ContentStatus;

export type CmsStatusFilter = CmsStatus | "ALL" | "UNPUBLISHED_CHANGES";

export type CmsActionKind = "saveDraft" | "publish" | "archive";

export type CmsFieldErrors = Record<string, string[]>;

export type CmsActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: CmsFieldErrors;
  formError?: string;
};

export type CmsListItemStatus = {
  status: CmsStatus;
  hasPublishedVersion?: boolean;
  hasDraftVersion?: boolean;
  isArchived?: boolean;
};

export type CmsPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
};

export type CmsRelationOption = {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
  status?: CmsStatus;
};
