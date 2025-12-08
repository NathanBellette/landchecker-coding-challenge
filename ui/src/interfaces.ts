// Property-related types
export interface PropertyImage {
  id: number;
  url: string;
  position: number;
}

export interface Property {
  id: number;
  title: string;
  description: string | null;
  price: number;
  formatted_price: string;
  bedrooms: number;
  property_type: string;
  status: string;
  latitude: number;
  longitude: number;
  published_at: string;
  property_images: PropertyImage[];
}

export interface PropertyEvent {
  id: number;
  event_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface WatchlistProperty extends Property {
  watchlist_id?: number;
}

export interface WatchlistData {
  properties: Array<{ id: number; watchlist_id?: number }>;
}

// Search-related types
export interface SearchFilters {
  property_type?: string;
  min_bedrooms?: string;
  max_bedrooms?: string;
  min_price?: string;
  max_price?: string;
}

// Auth-related types
export interface User {
  id: number;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// UI-related types
export interface TabChangeDetails {
  value: string;
}

export interface FormattedEventData {
  label: string;
  details: string;
}

// API response types
export interface ErrorResponse {
  error?: string;
  errors?: Record<string, unknown>;
}

