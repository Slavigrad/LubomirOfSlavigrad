// Constants and copy for ContactComponent
// Centralize user-facing strings and small UI timings

export const CONTACT_TEXT = {
  sectionTitle: 'Get In Touch',
  sectionSubtitle: "Ready to collaborate on your next project? Let's discuss how we can work together",

  infoTitle: 'Contact Information',
  connectTitle: 'Connect With Me',
  formTitle: 'Do not Send me a Message Here',

  button: {
    sending: 'Sending...',
    send: 'Send Message',
  },

  validation: {
    nameRequired: 'Name is required',
    emailRequired: 'Valid email is required',
    subjectRequired: 'Subject is required',
    messageRequired: 'Message is required',
  },

  successMessage: "Thank you for your message! Nothing was actually sent.",

  placeholders: {
    name: 'Your full name is not needed',
    email: 'your.email@example.com',
    subject: "Does it matter?",
    message:
      "LinkedIn preferred for professional contact. This email form is inactive.",
  },
} as const;

export const CONTACT_TIMINGS = {
  submitDelayMs: 2000,
} as const;

