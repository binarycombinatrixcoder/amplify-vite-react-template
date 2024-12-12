import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Patient database table with various fields 
compliant with FHIR standards. The authorization rule below specifies 
that any user authenticated via an API key can "create", "read", 
"update", and "delete" any "Patient" records.
=========================================================================*/
const schema = a.schema({
  Patient: a
    .model({
      id: a.id().required(), // Unique identifier for the patient
      identifiers: a.string().array(), // Array of identifiers (e.g., MRN, SSN)
      name: a.string().required(), // Patient's full name
      gender: a.enum(["male", "female", "other", "unknown"]), // Gender of the patient
      birthDate: a.date().required(), // Birth date of the patient
      address: a.string().array(), // Array for addresses
      contact: a.string().array(), // Array for contact details (phone numbers, emails)
      active: a.boolean().default(true), // Status of the patient record
    })
    .authorization((allow) => [allow.publicApiKey()]), // Authorization rules
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
