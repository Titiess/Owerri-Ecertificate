// ============================================
// Owerri E-Certificate Platform — TypeScript Types
// ============================================

// Re-export Prisma types for convenience
export type {
  Applicant,
  AdminUser,
  Application,
  ApplicationFile,
  AuditLog,
} from '@prisma/client';

export type {
  AdminRole,
  CertificateType,
  ApplicationStatus,
  PaymentStatus,
} from '@prisma/client';

// ============================================
// Session / Auth Types
// ============================================

export interface SessionUser {
  id: string;
  email?: string;
  username?: string;
  name: string;
  role: 'APPLICANT' | 'ADMIN' | 'CHAIRMAN';
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Application Form Types
// ============================================

export interface ApplicationFormData {
  // Step 1: Personal Details
  fullName: string;
  dateOfBirth: string;
  phone: string;

  // Step 2: Family Info
  fatherName: string;
  motherName: string;

  // Step 3: Certificate Details
  nativeOf: string;
  lga: string;
  stateOfOrigin: string;
  purpose: string;
  certificateType: string;
}

// ============================================
// Dashboard Stats
// ============================================

export interface AdminDashboardStats {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  totalRevenue: number;
  thisMonth: {
    applications: number;
    approved: number;
    revenue: number;
  };
}

export interface ApplicantDashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ============================================
// Certificate Type Configuration (Scalability)
// ============================================

export interface CertificateTypeConfig {
  type: string;
  label: string;
  description: string;
  fee: number;
  requiredFields: string[];
  requiresFileUpload: boolean;
  requiredFileTypes?: string[];
}

export const CERTIFICATE_TYPE_CONFIGS: CertificateTypeConfig[] = [
  {
    type: 'STATE_OF_ORIGIN',
    label: 'Certificate of Origin (State of Origin)',
    description: 'Official certificate confirming state of origin for indigenes of Owerri Municipal Council.',
    fee: 5000,
    requiredFields: ['fullName', 'dateOfBirth', 'nativeOf', 'lga', 'stateOfOrigin', 'fatherName', 'motherName', 'purpose'],
    requiresFileUpload: false,
  },
  // Future certificate types can be added here:
  // {
  //   type: 'CERTIFICATE_OF_INDIGENE',
  //   label: 'Certificate of Indigene',
  //   ...
  //   requiresFileUpload: true,
  //   requiredFileTypes: ['PASSPORT_PHOTO'],
  // },
];
