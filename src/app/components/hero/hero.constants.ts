export const UI_TEXT = {
  DOWNLOAD_CV: 'Download CV',
  GENERATING_PDF: 'Generating PDF...',
  GET_IN_TOUCH: 'Get In Touch',
  DOWNLOAD_FULL_PORTFOLIO: 'Download Full Portfolio',
  CHOOSE_TEMPLATE: 'Choose Template',
  PDF_CONFIGURATION: 'PDF Configuration',
  CANCEL: 'Cancel',
  GENERATE_PDF: 'Generate PDF'
} as const;

// Make it readonly to prevent modifications
export type UITextKeys = keyof typeof UI_TEXT;
