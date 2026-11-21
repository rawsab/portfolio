// split_host_overlap.json (all training labels), host_distribution.json (anonymous coverage), and audit.json (sizing only).
export const overlap = {"host":[{"matched":1834,"total":1895,"percent":96.78100263852242},{"matched":921,"total":1504,"percent":61.236702127659576}],"registrable_domain":[{"matched":1847,"total":1895,"percent":97.46701846965699},{"matched":1061,"total":1504,"percent":70.54521276595744}]} as const;
export const benignTotal = 38228 as const;
export const benignCoverage = [
  [1,4979,13.024484670921838],
  [5,21899,57.285235952704824],
  [10,30094,78.72240242754002],
  [25,36209,94.7185309197447],
] as const;
export const candidateSplits = [
  ["Train",55291,31284,24007,10293],
  ["Validation",10007,5667,4340,1913],
  ["Test",2608,1207,1401,580],
] as const;
export const quarantined = {"benign":70,"malicious":21} as const;
export const mixedLabelGroups = 101 as const;
