/**
 * Interface for board game data
 */
export interface BoardGameData {
  gameName: string;
  companyName: string;
  rules: string;
  objective: string;
  faqs: Record<string, string>;
}

/**
 * Interface for e-commerce data (example of another data type)
 */
export interface EcommerceData {
  storeName: string;
  companyName: string;
  returnPolicy: string;
  shippingInfo: string;
  faqs: Record<string, string>;
}

/**
 * Union type of all supported data types
 */
export type SupportData = BoardGameData | EcommerceData;
