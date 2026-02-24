// ============================================================================
// AUTH
// ============================================================================

export interface UserProfile {
  company_name: string;
  balance: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// ============================================================================
// SAVED ADDRESSES
// ============================================================================

export interface SavedAddress {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SAVED PACKAGES
// ============================================================================

export interface SavedPackage {
  id: number;
  label: string;
  length: number;
  width: number;
  height: number;
  weight_lb: number;
  weight_oz: number;
  total_weight_oz: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SHIPMENT BATCH
// ============================================================================

export type BatchStatus = 'draft' | 'reviewed' | 'shipping_selected' | 'purchased';
export type LabelSize = 'letter' | '4x6';

export interface ShipmentBatch {
  id: number;
  file_name: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  status: BatchStatus;
  label_size: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
  parse_warnings?: string[];
}

// ============================================================================
// SHIPMENT RECORD
// ============================================================================

export type VerificationStatus = 'unverified' | 'verified' | 'failed';
export type ShippingService = 'priority' | 'ground' | '';

export interface ShipmentRecord {
  id: number;
  batch: number;
  row_number: number;

  // Ship From
  from_first_name: string;
  from_last_name: string;
  from_address1: string;
  from_address2: string;
  from_city: string;
  from_state: string;
  from_zip: string;
  from_phone: string;

  // Ship To
  to_first_name: string;
  to_last_name: string;
  to_address1: string;
  to_address2: string;
  to_city: string;
  to_state: string;
  to_zip: string;
  to_phone: string;

  // Package
  weight_lb: number | null;
  weight_oz: number | null;
  length: number | null;
  width: number | null;
  height: number | null;

  // Reference
  order_number: string;
  item_sku: string;

  // Validation
  validation_errors: string[];
  is_valid: boolean;

  // Verification
  from_address_verified: VerificationStatus;
  to_address_verified: VerificationStatus;

  // Shipping
  shipping_service: ShippingService;
  shipping_cost: number;

  // Display
  from_address_display: string;
  to_address_display: string;
  package_display: string;
  total_weight_oz: number;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// SHIPPING RATES
// ============================================================================

export interface ShippingRate {
  key: string;
  name: string;
  base_price: number;
  per_oz_rate: number;
}

export interface ShippingRatesResponse {
  services: ShippingRate[];
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

export interface BulkUpdateFromRequest {
  shipment_ids: number[];
  saved_address_id: number;
}

export interface BulkUpdatePackageRequest {
  shipment_ids: number[];
  saved_package_id: number;
}

export interface BulkUpdateShippingRequest {
  shipment_ids: number[];
  service: 'priority' | 'ground' | 'cheapest';
}

export interface BulkDeleteRequest {
  shipment_ids: number[];
}

export interface BulkActionResponse {
  message: string;
  updated_count: number;
}

// ============================================================================
// PURCHASE
// ============================================================================

export interface PurchaseRequest {
  label_size: LabelSize;
  accept_terms: boolean;
}

export interface PurchaseResponse {
  message: string;
  batch_id: number;
  total_labels: number;
  total_cost: number;
  label_size: string;
  new_balance: number;
}

// ============================================================================
// VERIFICATION
// ============================================================================

export interface VerifyAddressResponse {
  shipment_id: number;
  address_type: string;
  verified: boolean;
  errors: string[];
  warnings: string[];
  suggestions: Record<string, string>;
}

export interface BulkVerifyRequest {
  shipment_ids?: number[];
  address_type: 'from' | 'to' | 'both';
}

export interface BulkVerifyResponse {
  total: number;
  verified: number;
  failed: number;
  skipped: number;
  details: Array<{
    shipment_id: number;
    row_number: number;
    to_verified?: boolean;
    from_verified?: boolean;
    to_warnings?: string[];
    from_warnings?: string[];
  }>;
}

// ============================================================================
// API ERROR
// ============================================================================

export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: unknown;
}