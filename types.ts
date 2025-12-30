
export enum StudyStatus {
  ENROLLING = 'Enrolling',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  PENDING = 'Pending'
}

export enum PatientStatus {
  SCREENING = 'Screening',
  ENROLLED = 'Enrolled',
  SCREEN_FAILURE = 'Screen Failure',
  WITHDRAWN = 'Withdrawn',
  COMPLETED = 'Completed'
}

export type StudyType = 'Drug' | 'Device';
export type DrugPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Other';

export interface Milestone {
  id: string;
  label: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface StatisticalDataPoint {
  label: string;
  value: number;
}

export interface PresentationSlide {
  title: string;
  bullets: string[];
}

export interface SpecimenProcedure {
  task: string;
  details: string;
}

export interface SpecimenLogistics {
  address: string;
  courier: string;
  courierContact: string;
}

export interface ProtocolInsight {
  schedule?: string;
  criteria?: string;
  diagnostics?: string;
  screeningProcedures?: string[];
  aeGuidelines?: string;
  summary?: string;
  algorithm?: string;
  drugFeatures?: string;
  prepRequirements?: string;
  statisticalAnalysis?: StatisticalDataPoint[];
  presentationSlides?: PresentationSlide[];
  // New Specimen Features
  specimenProcedures?: SpecimenProcedure[];
  specimenLogistics?: SpecimenLogistics;
}

export interface MonitorInfo {
  name: string;
  contact: string;
  nextVisit?: string;
  lastVisit?: string;
  frequency?: string;
}

export interface ClinicalTeam {
  principalInvestigator: string;
  subPrincipalInvestigator?: string;
  mainCoordinator: string;
  substituteCoordinator?: string;
}

export interface Study {
  id: string;
  title: string;
  type: StudyType;
  phase?: DrugPhase;
  isFollowUp: boolean;
  previousTrialName?: string;
  principalInvestigator: string; 
  team?: ClinicalTeam;
  monitor?: MonitorInfo; // New: Monitor tracking
  status: StudyStatus;
  enrollmentTarget: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  description: string;
  milestones: Milestone[];
  protocolInsight?: ProtocolInsight;
  screeningChecklist?: string[];
}

export interface AdverseEvent {
  id: string;
  type: 'AE' | 'SAE';
  description: string;
  date: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  status: 'Open' | 'Reported' | 'Resolved';
}

export interface Patient {
  id: string;
  studyId: string;
  gender: 'M' | 'F' | 'Other';
  status: PatientStatus;
  lastVisit: string;
  consentStatus: 'Pending' | 'Signed';
  patientSignature?: string; 
  piSignature?: string;
  completedScreeningItems?: string[];
  reportedEvents?: AdverseEvent[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SiteUser {
  id: string;
  name: string;
  role: 'Admin' | 'Coordinator' | 'PI';
}
