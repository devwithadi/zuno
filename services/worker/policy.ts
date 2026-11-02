/** Bounded work per cycle; keep editorial waves shorter than inbox leases. */
export const workerPolicy = Object.freeze({
  sourceConcurrency: 4,
  editorialConcurrency: 3,
  editedPublicationLimit: 30,
  extractivePublicationLimit: 50,
  maximumPublicationLimit: 50,
  maximumScannedEntries: 50,
});
