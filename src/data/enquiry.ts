/** Shared by the form (Contact.astro), the client script and the Worker (src/lib/enquire.ts). */
export const enquiryFields = {
  name: { label: "Name", maxLength: 120, required: true },
  email: { label: "Email", maxLength: 254, required: true },
  role: { label: "I am a…", maxLength: 40, required: true },
  organisation: { label: "School or organisation (optional)", maxLength: 160, required: false },
  message: { label: "Message", maxLength: 4000, required: true },
} as const;

export type EnquiryField = keyof typeof enquiryFields;

/** "I am a…" options: stable values (sent to the Worker) with sentence-case labels. */
export const enquiryRoles = [
  { value: "school-leader-senco", label: "School leader/SENCO" },
  { value: "teacher", label: "Teacher" },
  { value: "therapist", label: "Therapist" },
  { value: "parent-carer", label: "Parent/carer" },
  { value: "other", label: "Other" },
] as const;

export type EnquiryRole = (typeof enquiryRoles)[number]["value"];

export const roleLabel = (value: string) => enquiryRoles.find((role) => role.value === value)?.label;

export const enquiryMessages = {
  pending: "Sending your enquiry…",
  success: "Thank you—your enquiry has been received. Daniel will be in touch.",
  invalid: "Please check the highlighted fields and try again.",
  failure: "Sorry, your enquiry could not be sent. Please try again later.",
  unavailable: "Sorry, online enquiries aren’t available yet, so your enquiry has not been sent. Please try again later.",
  required: {
    name: "Please enter your name.",
    email: "Please enter your email address.",
    role: "Please choose the option that best describes you.",
    organisation: "",
    message: "Please enter your message.",
  },
  roleInvalid: "Please choose one of the listed options.",
  emailFormat: "Please enter an email address in the format name@example.com.",
  tooLong: "This is too long. Please shorten it.",
} as const;

/** Also excludes , < > " and control characters so the address is safe to use as the email reply-to. */
export const EMAIL_PATTERN =
  /^[^\s@,<>"\u0000-\u001f\u007f-\u009f]+@[^\s@,<>"\u0000-\u001f\u007f-\u009f]+\.[^\s@,<>"\u0000-\u001f\u007f-\u009f]+$/;

/** Honeypot field name: deliberately non-semantic so browsers don't autofill it. */
export const HONEYPOT_FIELD = "rm_extra";
