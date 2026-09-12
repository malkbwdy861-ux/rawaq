# UI Reset Implementation Plan

## Audit outcome

The focused audit identified missing public chrome, non-responsive dashboard navigation, one-size-fits-all page widths, repeated collection markup, unstructured editors, raw token usage, weak active and pending states, and public pages that expose CMS concepts or repeat generic card grids. The reset preserves routes, server actions, validation, versions, SEO metadata, and database models.

## Delivery phases

1. **Foundation:** strengthen `DESIGN.md`; introduce semantic tokens, width modes, typography, focus, motion, and shared button behavior.
2. **Dashboard shell:** add grouped icon navigation, active state, mobile drawer, top bar, and task-specific content widths.
3. **Dashboard references:** redesign Overview, Services Collection, and Service Editor as the operational archetypes.
4. **Dashboard propagation:** apply collection and editor patterns to related modules without changing server actions or schemas.
5. **Specialized tools:** give Media, Redirects, Pages, and Settings task-specific layouts.
6. **Public shell:** add skip navigation, responsive primary navigation, brand slot, contact hierarchy, and footer.
7. **Public references:** refine Home, Service Detail, and Guide Detail as marketing, conversion, and reading archetypes.
8. **Public propagation:** apply shared low-level primitives while preserving distinct Service, Solution, Material, Project, and Guide compositions.
9. **Quality pass:** verify mobile and ultrawide behavior, RTL and bidi isolation, keyboard use, focus, reduced motion, empty/loading/error states, lint, type checking, and production build.

## Acceptance gate

An archetype passes only when its primary action, hierarchy, scan path, width, state, and mobile transformation are obvious without relying on decoration. No screen passes solely because it compiles or uses the palette.
