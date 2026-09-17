import assert from "node:assert/strict";
import test from "node:test";

import { removePageReference, sanitizePageReferences } from "../src/modules/cms/references.ts";
import { retainExistingSelectedIds } from "../src/modules/cms/reference-values.ts";

const existing = {
  service: new Set(["service-a"]),
  solution: new Set(["solution-a"]),
  material: new Set(["material-a"]),
  project: new Set(["project-a", "project-c"]),
  article: new Set(["article-a"]),
  faq: new Set(["faq-a"]),
  media: new Set(["media-a"]),
};

test("repairs every page entity selection without changing order or sibling data", () => {
  const data = {
    featuredServices: { title: "Services", selectedServiceIds: ["missing", "service-a", "service-a"] },
    featuredSolutions: { selectedSolutionIds: ["solution-a", "missing"] },
    featuredProjects: { selectedProjectIds: ["project-a", "missing", "project-c"] },
    selectedPricingArticleIds: ["missing", "article-a"],
    faqSection: { title: "FAQ", selectedFaqIds: ["faq-a", "missing"] },
  };

  assert.deepEqual(sanitizePageReferences(data, existing), {
    featuredServices: { title: "Services", selectedServiceIds: ["service-a"] },
    featuredSolutions: { selectedSolutionIds: ["solution-a"] },
    featuredProjects: { selectedProjectIds: ["project-a", "project-c"] },
    selectedPricingArticleIds: ["article-a"],
    faqSection: { title: "FAQ", selectedFaqIds: ["faq-a"] },
  });
});

test("repairs nested media references and preserves unrelated strings", () => {
  const data = { hero: { mediaId: "missing", title: "missing" }, steps: [{ mediaId: "media-a" }], finalCta: { backgroundMediaId: "missing" } };
  assert.deepEqual(sanitizePageReferences(data, existing), { hero: { mediaId: "", title: "missing" }, steps: [{ mediaId: "media-a" }], finalCta: { backgroundMediaId: "" } });
});

test("delete cleanup removes only the requested reference", () => {
  const data = { featuredProjects: { selectedProjectIds: ["project-a", "project-b", "project-c"] }, untouched: ["project-b"] };
  assert.deepEqual(removePageReference(data, "project", "project-b"), { featuredProjects: { selectedProjectIds: ["project-a", "project-c"] }, untouched: ["project-b"] });
});

test("selectors ignore missing IDs for counts and submitted values", () => {
  assert.deepEqual(retainExistingSelectedIds(["project-a", "missing", "project-c", "project-a"], ["project-a", "project-c"]), ["project-a", "project-c"]);
});
