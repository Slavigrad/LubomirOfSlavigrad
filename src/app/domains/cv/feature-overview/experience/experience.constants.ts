// Constants for ExperienceComponent: UI strings, repeated classes, icon paths
// Keep purely presentational values here (no behavior). Typed and documented.

export const EXPERIENCE_TEXT = {
  SECTION_TITLE: 'Professional Experience',
  SUMMARY_LINE: 'A journey through innovative projects and technical leadership roles',
  SUMMARY_LABELS: {
    PROJECTS_DELIVERED: 'Projects Delivered',
    YEARS_OF_EXPERIENCE: 'Years of Experience',
    COMPANIES_WORKED: 'Companies Worked',
    TECHNOLOGIES_USED: 'Technologies Used',
  },
  BUTTONS: {
    EXPAND_ALL: 'Expand All',
    COLLAPSE_ALL: 'Collapse All',
    READ: 'Read',
    EXPAND: 'Expand',
    COLLAPSE: 'Collapse',
    SHOW: 'Show',
    HIDE: 'Hide',
    CLOSE: 'Close',
  },
  ARIA: {
    VIEW_DETAILS: 'View details',
  },
  LABELS: {
    PRESENT: 'Present',
    CURRENT: 'Current',
    TEAM: 'Team',
  },
  HEADINGS: {
    DESCRIPTION: 'Description',
    TECHNOLOGIES: 'Technologies',
    RESPONSIBILITIES: 'Responsibilities',
    ACHIEVEMENTS: 'Achievements',
    PROJECTS: 'Projects',
  },
} as const;

// Frequently reused class strings
export const EXPERIENCE_CLASSES = {
  toolbarButton: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/30 transition text-sm font-medium',
  readButton: 'inline-flex items-center gap-1 px-3 py-1 rounded-md border border-border/30 bg-background/50 hover:bg-muted/40 transition text-sm font-medium',
  toggleButton: 'inline-flex items-center gap-1 px-3 py-1 rounded-md border border-border/30 bg-background/50 hover:bg-muted/30 transition text-sm font-medium',
  positionToggleButton: 'inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/30 bg-background/50 hover:bg-muted/30 transition text-xs font-medium',
  currentBadge: 'px-2 py-1 bg-primary/20 text-primary text-xs rounded-full',
} as const;

// SVG path data constants
export const EXPERIENCE_ICONS = {
  PLUS: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  MINUS: 'M18 12H6',
  SEARCH: 'M21 21l-4.35-4.35m1.1-4.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z',
  CHEVRON_DOWN: 'M19 9l-7 7-7-7',
  LOCATION_PIN_OUTER: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  LOCATION_PIN_INNER: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  DURATION: 'M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V9',
  CLOSE_X: 'M6 18L18 6M6 6l12 12',
  CHECK_CIRCLE: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
} as const;

