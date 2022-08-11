export interface AddCorrelationResponse {
  correlation: Correlation;
}

export type GetCorrelationsResponse = Correlation[];

export interface Correlation {
  uid: string;
  sourceUID: string;
  targetUID: string;
  label?: string;
  description?: string;
  // TODO: options
}
