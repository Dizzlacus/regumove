import { EMAIL_PATTERN, enquiryFields, enquiryMessages, roleLabel, type EnquiryField } from "../data/enquiry";

export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

/** Same rules in the browser (main.js) and the Worker (enquire.ts). */
export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const field of Object.keys(enquiryFields) as EnquiryField[]) {
    const value = values[field] ?? "";
    const rules = enquiryFields[field];
    if (!value) {
      if (rules.required) errors[field] = enquiryMessages.required[field];
    } else if (value.length > rules.maxLength) errors[field] = enquiryMessages.tooLong;
  }
  if (!errors.email && !EMAIL_PATTERN.test(values.email)) errors.email = enquiryMessages.emailFormat;
  if (!errors.role && !roleLabel(values.role)) errors.role = enquiryMessages.roleInvalid;
  return errors;
}
