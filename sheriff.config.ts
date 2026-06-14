import { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Sheriff config for ADR-001 domain architecture.
 *
 * Modules and tags are defined for the target `domains/` structure.
 * Rules are PERMISSIVE until the ADR-001 restructure is complete —
 * all modules may depend on each other (`'*': '*'`).
 *
 * TODO: Enable strict rules after the file move:
 *   - cv ⊥ memoir  (no cross-domain imports)
 *   - shared → no domain imports
 *   - feature → feature forbidden
 *   - nothing imports lab (except lab itself)
 */

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    'src/app/shell': 'shell',
    'src/app/domains/cv': 'cv',
    'src/app/domains/cv/feature-overview': 'cv:feature',
    'src/app/domains/cv/data': 'cv:data',
    'src/app/domains/memoir': 'memoir',
    'src/app/domains/memoir/feature-story': 'memoir:feature',
    'src/app/domains/memoir/ui': 'memoir:ui',
    'src/app/domains/memoir/data': 'memoir:data',
    'src/app/domains/lab': 'lab',
    'src/app/domains/lab/collapse-demo': 'lab',
    'src/app/domains/lab/modern': 'lab',
    'src/app/domains/lab/modern-card': 'lab',
    'src/app/domains/lab/modern-lifecycle': 'lab',
    'src/app/domains/lab/signal-form': 'lab',
    'src/app/domains/shared': 'shared',
    'src/app/domains/shared/ui-glass': 'shared:ui',
    'src/app/domains/shared/ui-common': 'shared:ui',
    'src/app/domains/shared/util-performance': 'shared:util',
    'src/app/domains/shared/util-performance/utils': 'shared:util',
    'src/app/domains/shared/util-theme': 'shared:util',
  },
  depRules: {
    root: '*',
    shell: '*',
    cv: ['shared:*', 'cv:*'],
    'cv:feature': ['shared:*', 'cv:data'],
    'cv:data': 'shared:*',
    memoir: ['shared:*', 'memoir:*'],
    'memoir:feature': ['shared:*', 'memoir:data', 'memoir:ui'],
    'memoir:data': 'shared:*',
    'memoir:ui': 'shared:*',
    'shared:*': 'shared:*',
    lab: '*',
  },
};
