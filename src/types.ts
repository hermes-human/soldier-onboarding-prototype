export type AppRole = 'worker' | 'admin'

export type WorkerStatus =
  | 'Onboarded'
  | 'Awaiting Review'
  | 'In Progress'
  | 'Invited'
  | 'Changes Requested'
  | 'Rejected'

export type ReviewStatus = 'Awaiting Review' | 'Approved' | 'Changes Requested' | 'Rejected'

export type TicketStatus = 'Valid' | 'Expiring' | 'Expired' | 'Pending'

export interface LicenceRecord {
  type: string
  number: string
  expiry: string
  status: TicketStatus
  documentLabel: string
}

export interface ActivityItem {
  id: string
  label: string
  time: string
}

export interface ReferenceContact {
  name: string
  company: string
  phone: string
}

export interface WorkerFormData {
  fullName?: string
  firstName?: string
  dateOfBirth?: string
  phone?: string
  email?: string
  homeAddress?: string
  emergencyContactName?: string
  emergencyContactNumber?: string
  nextOfKinRelationship?: string
  profilePhoto?: string
  ppeSizing?: string
  vehicleDetails?: string
  licenceClass?: string
  positionApplyingFor?: string
  yearsExperience?: string
  previousEmployerOne?: string
  previousEmployerTwo?: string
  reasonForLeaving?: string
  referenceOneName?: string
  referenceOneCompany?: string
  referenceOnePhone?: string
  referenceTwoName?: string
  referenceTwoCompany?: string
  referenceTwoPhone?: string
  citizenshipStatus?: string
  visaSubclass?: string
  vevoConsent?: boolean
  passportUpload?: string
  photoIdUpload?: string
  whiteCardNumber?: string
  whiteCardState?: string
  whiteCardExpiry?: string
  whiteCardUpload?: string
  hrwlType?: string
  hrwlNumber?: string
  hrwlExpiry?: string
  hrwlUpload?: string
  additionalTickets?: string
  additionalTicketsUpload?: string
  liftPlanKnowledge?: string
  blindLifts?: string
  dualLifts?: string
  windKnowledge?: string
  exclusionZones?: string
  maxWindStop?: string
  lostCommsProcedure?: string
  swingingLoadControl?: string
  preLiftChecks?: string
  swmsKnowledge?: string
  toolboxTalks?: string
  incidentReporting?: string
  unsafePracticesResponse?: string
  injuriesConditions?: string
  fitForWorkDeclaration?: boolean
  previousWorkCoverClaims?: string
  previousWorkCoverDetails?: string
  tfn?: string
  tfnDeclaration?: boolean
  superChoice?: string
  superFundName?: string
  superFundUsi?: string
  superFundAbn?: string
  superMemberNumber?: string
  bankBsb?: string
  bankAccountNumber?: string
  bankAccountName?: string
  privacyConsent?: boolean
  drugAlcoholConsent?: boolean
  codeOfConductConsent?: boolean
  fairWorkConsent?: boolean
  awardAcknowledgement?: boolean
  workerSignature?: string
  supervisorSignature?: string
  workerSignatureDate?: string
  supervisorSignatureDate?: string
}

export interface WorkerRecord {
  id: string
  name: string
  firstName: string
  role: string
  status: WorkerStatus
  reviewStatus: ReviewStatus
  completion: number
  invitedDate: string
  submittedDate?: string
  phone: string
  email: string
  location: string
  avatarColor: string
  note: string
  licences: LicenceRecord[]
  activity: ActivityItem[]
  adminNotes: string[]
  currentStep: number
  formData: WorkerFormData
}

export interface DashboardMetrics {
  totalOnboarded: number
  pendingOnboarding: number
  awaitingReview: number
  credentialsExpiring: number
  completedThisWeek: number
}

export interface InviteDraft {
  firstName: string
  lastName: string
  mobile: string
  email: string
  position: string
  note: string
  siteAssignment: string
}
