import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Eye,
  FileCheck2,
  FolderKanban,
  HardHat,
  IdCard,
  LayoutDashboard,
  LockKeyhole,
  Phone,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { HashRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import labourLogo from './assets/logos/Soldier-LS-Positive@3x.png'
import parentLogo from './assets/logos/Soldier-Negative@3x.png'
import monogramLogo from './assets/logos/Monogram-Positive@3x.png'
import { dashboardMetrics, recentActivity, weeklyCompletionData, workerSteps, workersSeed } from './data/seed'
import './index.css'
import type { InviteDraft, ReviewStatus, WorkerFormData, WorkerRecord, WorkerStatus } from './types'

type FieldType = 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'checkbox' | 'upload' | 'signature'

interface StepField {
  key: keyof WorkerFormData
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  helper?: string
  options?: string[]
}

interface StepConfig {
  id: number
  title: string
  helper: string
  fields: StepField[]
}

interface PrototypeState {
  unlocked: boolean
  workers: WorkerRecord[]
  invitePreview: string
}

const PASSWORD = 'Soldier01'
const STORAGE_KEY = 'soldier-onboarding-prototype-v1'
const demoWorkerId = 'sam-example'

const stepConfigs: StepConfig[] = [
  {
    id: 1,
    title: 'Personal Details',
    helper: 'Get the basics locked in before first shift.',
    fields: [
      { key: 'fullName', label: 'Full name', type: 'text', required: true, placeholder: 'Sam Example' },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
      { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '0400 000 111' },
      { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'sam@example.com' },
      { key: 'homeAddress', label: 'Home address', type: 'textarea', required: true, placeholder: 'Street, suburb, state, postcode' },
      { key: 'emergencyContactName', label: 'Emergency contact name', type: 'text', required: true },
      { key: 'emergencyContactNumber', label: 'Emergency contact number', type: 'tel', required: true },
      { key: 'nextOfKinRelationship', label: 'Next of kin relationship', type: 'text', required: true, placeholder: 'Partner / Parent / Sibling' },
      { key: 'profilePhoto', label: 'Profile photo', type: 'upload', required: true, helper: 'Selfie for site access and worker directory.' },
      { key: 'ppeSizing', label: 'PPE sizing', type: 'select', required: true, options: ['Small', 'Medium', 'Large', 'XL', '2XL'] },
      { key: 'vehicleDetails', label: 'Vehicle details', type: 'text', placeholder: 'ABC123 — optional if driving to site' },
      { key: 'licenceClass', label: 'Driver licence class', type: 'select', options: ['Not supplied', 'C', 'LR', 'MR', 'HR', 'HC', 'MC'] },
    ],
  },
  {
    id: 2,
    title: 'Employment & Role',
    helper: 'Set the job type and work history.',
    fields: [
      { key: 'positionApplyingFor', label: 'Position applying for', type: 'select', required: true, options: ['Crane Operator', 'Dogman', 'Rigger', 'Supervisor', 'Labourer', 'RTA Traffic Controller'] },
      { key: 'yearsExperience', label: 'Years of experience', type: 'text', required: true, placeholder: '5' },
      { key: 'previousEmployerOne', label: 'Previous employer 1', type: 'text', required: true },
      { key: 'previousEmployerTwo', label: 'Previous employer 2', type: 'text', required: true },
      { key: 'reasonForLeaving', label: 'Reason for leaving', type: 'textarea', required: true },
      { key: 'referenceOneName', label: 'Reference 1 name', type: 'text', placeholder: 'Optional' },
      { key: 'referenceOneCompany', label: 'Reference 1 company', type: 'text', placeholder: 'Optional' },
      { key: 'referenceOnePhone', label: 'Reference 1 phone', type: 'tel', placeholder: 'Optional' },
      { key: 'referenceTwoName', label: 'Reference 2 name', type: 'text', placeholder: 'Optional' },
      { key: 'referenceTwoCompany', label: 'Reference 2 company', type: 'text', placeholder: 'Optional' },
      { key: 'referenceTwoPhone', label: 'Reference 2 phone', type: 'tel', placeholder: 'Optional' },
    ],
  },
  {
    id: 3,
    title: 'Right to Work',
    helper: 'Capture identity and work rights before placement.',
    fields: [
      { key: 'citizenshipStatus', label: 'Citizenship / visa status', type: 'select', required: true, options: ['Australian citizen', 'Permanent resident', 'New Zealand citizen', 'Visa holder'] },
      { key: 'visaSubclass', label: 'Visa subclass', type: 'text', placeholder: 'Required if visa holder' },
      { key: 'vevoConsent', label: 'I consent to a VEVO check', type: 'checkbox', required: true },
      { key: 'passportUpload', label: 'Passport upload', type: 'upload', required: true },
      { key: 'photoIdUpload', label: 'Photo ID upload', type: 'upload', required: true, helper: 'Driver licence or passport image.' },
    ],
  },
  {
    id: 4,
    title: 'Licences & Tickets',
    helper: 'This is the compliance-heavy step. Don’t skip it.',
    fields: [
      { key: 'whiteCardNumber', label: 'White Card number', type: 'text', required: true },
      { key: 'whiteCardState', label: 'Issuing state', type: 'select', required: true, options: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] },
      { key: 'whiteCardExpiry', label: 'White Card expiry', type: 'text', required: true, placeholder: 'No expiry / dd mmm yyyy' },
      { key: 'whiteCardUpload', label: 'White Card image', type: 'upload', required: true },
      { key: 'hrwlType', label: 'HRWL type', type: 'select', required: true, options: ['CT', 'DG', 'RB', 'RI', 'RA'] },
      { key: 'hrwlNumber', label: 'HRWL licence number', type: 'text', required: true },
      { key: 'hrwlExpiry', label: 'HRWL expiry', type: 'date', required: true },
      { key: 'hrwlUpload', label: 'HRWL upload', type: 'upload', required: true },
      { key: 'additionalTickets', label: 'Additional tickets', type: 'textarea', placeholder: 'First Aid, EWP, Forklift, Traffic Control, etc.' },
      { key: 'additionalTicketsUpload', label: 'Additional ticket uploads', type: 'upload', helper: 'Optional supporting documents.' },
    ],
  },
  {
    id: 5,
    title: 'Competency Verification',
    helper: 'Short scenario prompts to verify field knowledge.',
    fields: [
      { key: 'liftPlanKnowledge', label: 'Lift plan process', type: 'textarea', required: true },
      { key: 'blindLifts', label: 'Blind lifts', type: 'textarea', required: true },
      { key: 'dualLifts', label: 'Dual lifts', type: 'textarea', required: true },
      { key: 'windKnowledge', label: 'Wind considerations', type: 'textarea', required: true },
      { key: 'exclusionZones', label: 'Exclusion zones', type: 'textarea', required: true },
      { key: 'maxWindStop', label: 'Max wind speed for stop', type: 'text', required: true },
      { key: 'lostCommsProcedure', label: 'Lost comms procedure', type: 'textarea', required: true },
      { key: 'swingingLoadControl', label: 'Swinging load control', type: 'textarea', required: true },
      { key: 'preLiftChecks', label: 'Pre-lift checks', type: 'textarea', required: true },
    ],
  },
  {
    id: 6,
    title: 'Safety Knowledge',
    helper: 'Confirm the worker understands day-one site behaviour.',
    fields: [
      { key: 'swmsKnowledge', label: 'SWMS understanding', type: 'textarea', required: true },
      { key: 'toolboxTalks', label: 'Toolbox talks', type: 'textarea', required: true },
      { key: 'incidentReporting', label: 'Incident reporting', type: 'textarea', required: true },
      { key: 'unsafePracticesResponse', label: 'Response to unsafe practices', type: 'textarea', required: true },
    ],
  },
  {
    id: 7,
    title: 'Medical & Fitness',
    helper: 'Identify any fitness or claims issues early.',
    fields: [
      { key: 'injuriesConditions', label: 'Injuries or conditions impacting work', type: 'textarea', required: true },
      { key: 'fitForWorkDeclaration', label: 'I confirm I am fit for work', type: 'checkbox', required: true },
      { key: 'previousWorkCoverClaims', label: 'Previous WorkCover claims', type: 'select', required: true, options: ['No', 'Yes'] },
      { key: 'previousWorkCoverDetails', label: 'WorkCover details', type: 'textarea', placeholder: 'Required if yes' },
    ],
  },
  {
    id: 8,
    title: 'Tax & Super',
    helper: 'Capture the payroll essentials.',
    fields: [
      { key: 'tfn', label: 'Tax File Number', type: 'text', required: true },
      { key: 'tfnDeclaration', label: 'I declare the TFN supplied is correct', type: 'checkbox', required: true },
      { key: 'superChoice', label: 'Super choice', type: 'select', required: true, options: ['Use Soldier default fund', 'Nominate my own fund'] },
      { key: 'superFundName', label: 'Super fund name', type: 'text', placeholder: 'Required if nominating own fund' },
      { key: 'superFundUsi', label: 'Super fund USI', type: 'text', placeholder: 'Required if nominating own fund' },
      { key: 'superFundAbn', label: 'Super fund ABN', type: 'text', placeholder: 'Required if nominating own fund' },
      { key: 'superMemberNumber', label: 'Member number', type: 'text', placeholder: 'Required if nominating own fund' },
    ],
  },
  {
    id: 9,
    title: 'Bank Details',
    helper: 'No bank details, no pay run.',
    fields: [
      { key: 'bankBsb', label: 'BSB', type: 'text', required: true, placeholder: '062-000' },
      { key: 'bankAccountNumber', label: 'Account number', type: 'text', required: true },
      { key: 'bankAccountName', label: 'Account name', type: 'text', required: true },
    ],
  },
  {
    id: 10,
    title: 'Consents & Sign-Off',
    helper: 'Final acknowledgements before review.',
    fields: [
      { key: 'privacyConsent', label: 'I acknowledge the Privacy Policy', type: 'checkbox', required: true },
      { key: 'drugAlcoholConsent', label: 'I acknowledge the Drug & Alcohol Policy', type: 'checkbox', required: true },
      { key: 'codeOfConductConsent', label: 'I acknowledge the Code of Conduct', type: 'checkbox', required: true },
      { key: 'fairWorkConsent', label: 'I confirm I have received the Fair Work Information Statement', type: 'checkbox', required: true },
      { key: 'awardAcknowledgement', label: 'I acknowledge the Building & Construction General On-site Award', type: 'checkbox', required: true },
      { key: 'workerSignature', label: 'Worker signature', type: 'signature', required: true },
      { key: 'workerSignatureDate', label: 'Worker signature date', type: 'date', required: true },
      { key: 'supervisorSignature', label: 'Supervisor signature', type: 'signature', required: true },
      { key: 'supervisorSignatureDate', label: 'Supervisor signature date', type: 'date', required: true },
    ],
  },
]

function loadInitialState(): PrototypeState {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { unlocked: false, workers: workersSeed, invitePreview: '' }
  }

  try {
    return JSON.parse(raw) as PrototypeState
  } catch {
    return { unlocked: false, workers: workersSeed, invitePreview: '' }
  }
}

function App() {
  const [state, setState] = useState<PrototypeState>(() => loadInitialState())

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const demoWorker = state.workers.find((worker) => worker.id === demoWorkerId) ?? workersSeed.find((worker) => worker.id === demoWorkerId)!

  const updateWorker = (workerId: string, updater: (worker: WorkerRecord) => WorkerRecord) => {
    setState((current) => ({
      ...current,
      workers: current.workers.map((worker) => (worker.id === workerId ? updater(worker) : worker)),
    }))
  }

  const saveStep = (workerId: string, stepId: number, values: WorkerFormData) => {
    updateWorker(workerId, (worker) => {
      const merged = { ...worker.formData, ...values }
      const nextStep = Math.min(10, stepId + 1)
      const completion = stepId === 10 ? 100 : Math.max(worker.completion, Math.round((stepId / 10) * 100))
      const submitted = stepId === 10

      return {
        ...worker,
        formData: merged,
        currentStep: submitted ? 10 : nextStep,
        completion,
        status: submitted ? 'Awaiting Review' : 'In Progress',
        reviewStatus: submitted ? 'Awaiting Review' : 'Changes Requested',
        submittedDate: submitted ? '22 Apr 2026' : worker.submittedDate,
        activity: [
          {
            id: `${worker.id}-step-${stepId}-${Date.now()}`,
            time: 'Just now',
            label: submitted ? 'Submitted onboarding form' : `Saved ${stepConfigs[stepId - 1].title}`,
          },
          ...worker.activity,
        ].slice(0, 8),
      }
    })
  }

  const updateReviewStatus = (workerId: string, reviewStatus: ReviewStatus, note: string) => {
    updateWorker(workerId, (worker) => {
      const nextStatus: WorkerStatus =
        reviewStatus === 'Approved'
          ? 'Onboarded'
          : reviewStatus === 'Rejected'
            ? 'Rejected'
            : reviewStatus === 'Changes Requested'
              ? 'Changes Requested'
              : 'Awaiting Review'

      return {
        ...worker,
        status: nextStatus,
        reviewStatus,
        completion: reviewStatus === 'Approved' ? 100 : worker.completion,
        note,
        adminNotes: [note, ...worker.adminNotes].slice(0, 6),
        activity: [
          {
            id: `${worker.id}-review-${Date.now()}`,
            time: 'Just now',
            label: `Review updated: ${reviewStatus}`,
          },
          ...worker.activity,
        ].slice(0, 8),
      }
    })
  }

  const sendInvite = (draft: InviteDraft) => {
    const fullName = `${draft.firstName} ${draft.lastName}`.trim()
    const id = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const sms = `Hi ${draft.firstName}, Paymaan at Soldier has invited you to onboard. Tap here: soldier.au/onboard/abc123`

    setState((current) => ({
      ...current,
      invitePreview: sms,
      workers: [
        {
          id,
          name: fullName,
          firstName: draft.firstName,
          role: draft.position,
          status: 'Invited',
          reviewStatus: 'Awaiting Review',
          completion: 0,
          invitedDate: '22 Apr 2026',
          phone: draft.mobile,
          email: draft.email,
          location: draft.siteAssignment || 'Sydney, NSW',
          avatarColor: '#7CBE3E',
          note: draft.note || 'Invite sent from prototype',
          licences: [],
          activity: [{ id: `${id}-invite`, time: 'Just now', label: 'Invite sent' }],
          adminNotes: draft.note ? [draft.note] : ['Invite created in prototype'],
          currentStep: 1,
          formData: { fullName, firstName: draft.firstName, phone: draft.mobile, email: draft.email, positionApplyingFor: draft.position },
        },
        ...current.workers,
      ],
    }))
  }

  if (!state.unlocked) {
    return <PasswordGate onUnlock={() => setState((current) => ({ ...current, unlocked: true }))} />
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <PrototypeRibbon />
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/worker/welcome" element={<WorkerWelcomePage worker={demoWorker} />} />
          <Route path="/worker/dashboard" element={<WorkerDashboardPage worker={demoWorker} />} />
          <Route path="/worker/onboarding/:stepId" element={<WorkerWizardPage worker={demoWorker} onSave={saveStep} />} />
          <Route path="/worker/submitted" element={<WorkerSubmittedPage worker={demoWorker} />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage workers={state.workers} />} />
          <Route path="/admin/workers" element={<WorkersListPage workers={state.workers} />} />
          <Route path="/admin/workers/:workerId" element={<WorkerDetailPage workers={state.workers} onReview={updateReviewStatus} />} />
          <Route path="/admin/forms" element={<CompletedFormsPage workers={state.workers} />} />
          <Route path="/admin/forms/:workerId" element={<FormViewerPage workers={state.workers} onReview={updateReviewStatus} />} />
          <Route path="/admin/invite" element={<InviteWorkerPage invitePreview={state.invitePreview} onSendInvite={sendInvite} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (value === PASSWORD) {
      setError('')
      onUnlock()
      return
    }
    setError('Wrong password. Use the shared demo password.')
  }

  return (
    <div className="gate-shell">
      <div className="prototype-tag">PROTOTYPE BUILD — SIMULATED DATA ONLY</div>
      <div className="gate-card">
        <img className="gate-logo" src={parentLogo} alt="Soldier Group" />
        <p className="eyebrow">WORKER ONBOARDING APP</p>
        <h1>Protected demo</h1>
        <p className="subtle-copy">Enter the shared password to view the clickable Soldier prototype.</p>
        <form className="gate-form" onSubmit={handleSubmit}>
          <label>
            Password
            <input type="password" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter password" />
          </label>
          {error ? <p className="field-error">{error}</p> : null}
          <button className="primary-button" type="submit">
            <LockKeyhole size={18} />
            Unlock prototype
          </button>
        </form>
        <p className="small-muted">Getting the job done.</p>
      </div>
    </div>
  )
}

function PrototypeRibbon() {
  return <div className="prototype-ribbon">PROTOTYPE BUILD — SIMULATED DATA ONLY</div>
}

function RoleSelectPage() {
  return (
    <div className="landing-shell">
      <div className="landing-hero">
        <img className="landing-logo" src={parentLogo} alt="Soldier Group" />
        <p className="eyebrow">GETTING THE JOB DONE.</p>
        <h1>Worker onboarding prototype</h1>
        <p className="hero-copy">Switch between the worker journey and the internal admin experience. Both layouts are responsive for desktop and mobile walk-throughs.</p>
        <div className="role-grid">
          <RoleCard
            title="I'm a Worker"
            copy="Open the invite flow, dashboard, and the full 10-step onboarding wizard."
            icon={<HardHat size={26} />}
            to="/worker/welcome"
          />
          <RoleCard
            title="I'm Admin"
            copy="View the dashboard, directory, form review, and invite flow with seeded data."
            icon={<Building2 size={26} />}
            to="/admin/dashboard"
          />
        </div>
        <p className="small-muted">Prototype build — simulated data only.</p>
      </div>
    </div>
  )
}

function RoleCard({ title, copy, icon, to }: { title: string; copy: string; icon: React.ReactNode; to: string }) {
  return (
    <Link className="role-card" to={to}>
      <div className="role-card-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <ChevronRight size={20} />
    </Link>
  )
}

function WorkerWelcomePage({ worker }: { worker: WorkerRecord }) {
  return (
    <WorkerLayout worker={worker} title={`Welcome to Soldier, ${worker.firstName}.`} subtitle="Before your first shift we need a few details. Should take about 15 minutes.">
      <div className="panel-grid worker-grid">
        <section className="panel panel-strong">
          <img className="section-logo labour" src={labourLogo} alt="Soldier Labour Services" />
          <h2>What you'll need</h2>
          <ul className="bullet-list">
            <li>Photo of your licence and White Card</li>
            <li>TFN and super fund details</li>
            <li>Bank details</li>
            <li>Emergency contact</li>
            <li>Passport or photo ID</li>
          </ul>
          <div className="button-row stack-on-mobile">
            <Link className="primary-button" to="/worker/onboarding/1">
              Start onboarding <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/worker/dashboard">
              Skip to dashboard
            </Link>
          </div>
        </section>
        <section className="panel phone-preview-card">
          <div className="phone-preview">
            <div className="phone-preview-top">SMS deep-link preview</div>
            <div className="phone-preview-body">
              <p className="sms-line"><strong>Paymaan:</strong> Hi {worker.firstName}, tap to onboard with Soldier.</p>
              <p className="sms-link">soldier.au/onboard/abc123</p>
              <p className="small-muted">Prototype only — no real SMS is sent.</p>
            </div>
          </div>
        </section>
      </div>
    </WorkerLayout>
  )
}

function WorkerDashboardPage({ worker }: { worker: WorkerRecord }) {
  const completedSteps = Math.round(worker.completion / 10)

  return (
    <WorkerLayout worker={worker} title={`Morning, ${worker.firstName}.`} subtitle="Keep moving through onboarding and see exactly what’s left.">
      <div className="panel-grid worker-dashboard-grid">
        <section className="panel panel-strong">
          <div className="dashboard-heading-row">
            <div>
              <p className="eyebrow">ONBOARDING PROGRESS</p>
              <h2>{completedSteps} of 10 steps complete</h2>
            </div>
            <div className="progress-ring">{worker.completion}%</div>
          </div>
          <ProgressBar value={worker.completion} />
          <div className="cta-card">
            <div>
              <p className="eyebrow">NEXT ACTION</p>
              <h3>Continue where you left off</h3>
              <p className="small-muted">Pick up at Step {worker.currentStep} — {workerSteps[worker.currentStep - 1]}</p>
            </div>
            <Link className="primary-button" to={`/worker/onboarding/${worker.currentStep}`}>
              Continue onboarding <ArrowRight size={18} />
            </Link>
          </div>
        </section>
        <section className="panel">
          <div className="section-title-row">
            <h2>My documents</h2>
            <IdCard size={18} />
          </div>
          <div className="doc-placeholder-list">
            <DocPlaceholder title="White Card" value={worker.formData.whiteCardNumber || 'Pending'} />
            <DocPlaceholder title="HRWL" value={worker.formData.hrwlNumber || 'Pending'} />
            <DocPlaceholder title="Photo ID" value={worker.formData.photoIdUpload || 'Awaiting upload'} />
          </div>
        </section>
      </div>
      <section className="panel section-spacer">
        <div className="section-title-row">
          <h2>Step status</h2>
          <ClipboardList size={18} />
        </div>
        <div className="step-list">
          {stepConfigs.map((step) => {
            const status = step.id < worker.currentStep ? 'Done' : step.id === worker.currentStep ? 'In progress' : 'Not started'
            return (
              <Link className="step-card" key={step.id} to={`/worker/onboarding/${step.id}`}>
                <div>
                  <p className="eyebrow">STEP {step.id}</p>
                  <h3>{step.title}</h3>
                  <p>{step.helper}</p>
                </div>
                <StatusPill status={status} />
              </Link>
            )
          })}
        </div>
        <div className="support-footer">
          <Phone size={16} /> Need help? Call 1300 SOLDIER
        </div>
      </section>
    </WorkerLayout>
  )
}

function WorkerWizardPage({ worker, onSave }: { worker: WorkerRecord; onSave: (workerId: string, stepId: number, values: WorkerFormData) => void }) {
  const params = useParams()
  const stepId = Number(params.stepId || '1')
  const config = stepConfigs.find((step) => step.id === stepId) ?? stepConfigs[0]

  return (
    <WorkerWizardForm
      key={`${worker.id}-${config.id}-${worker.completion}-${worker.reviewStatus}`}
      worker={worker}
      config={config}
      onSave={onSave}
    />
  )
}

function WorkerWizardForm({
  worker,
  config,
  onSave,
}: {
  worker: WorkerRecord
  config: StepConfig
  onSave: (workerId: string, stepId: number, values: WorkerFormData) => void
}) {
  const navigate = useNavigate()
  const [values, setValues] = useState<WorkerFormData>(worker.formData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (key: keyof WorkerFormData, next: string | boolean) => {
    setValues((current) => ({ ...current, [key]: next }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    for (const field of config.fields) {
      const value = values[field.key]
      if (!field.required) continue
      if (field.type === 'checkbox') {
        if (!value) nextErrors[String(field.key)] = 'Required'
      } else if (typeof value !== 'string' || value.trim() === '') {
        nextErrors[String(field.key)] = 'Required'
      }
    }

    if (values.previousWorkCoverClaims === 'Yes' && !String(values.previousWorkCoverDetails || '').trim()) {
      nextErrors.previousWorkCoverDetails = 'Tell us about the claim'
    }

    if (values.citizenshipStatus === 'Visa holder' && !String(values.visaSubclass || '').trim()) {
      nextErrors.visaSubclass = 'Visa subclass required'
    }

    if (values.superChoice === 'Nominate my own fund') {
      for (const key of ['superFundName', 'superFundUsi', 'superFundAbn', 'superMemberNumber'] as Array<keyof WorkerFormData>) {
        if (!String(values[key] || '').trim()) nextErrors[String(key)] = 'Required for own fund'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    onSave(worker.id, config.id, values)
    if (config.id === 10) {
      navigate('/worker/submitted')
    } else {
      navigate(`/worker/onboarding/${config.id + 1}`)
    }
  }

  return (
    <WorkerLayout
      worker={worker}
      title={`Step ${config.id} of 10 — ${config.title}`}
      subtitle={config.helper}
      backTo={config.id === 1 ? '/worker/dashboard' : `/worker/onboarding/${config.id - 1}`}
      topAction={<Link className="top-action-link" to="/worker/dashboard">Save & Exit</Link>}
    >
      <section className="panel section-spacer onboarding-panel">
        <div className="wizard-progress-head">
          <div className="eyebrow">STEP {config.id} OF 10</div>
          <ProgressBar value={config.id * 10} />
        </div>
        <form className="wizard-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {config.fields.map((field) => (
              <FieldRenderer
                key={String(field.key)}
                field={field}
                value={values[field.key]}
                error={errors[String(field.key)]}
                onChange={handleChange}
              />
            ))}
          </div>
          <div className="sticky-submit">
            <Link className="secondary-button" to="/worker/dashboard">Save & Exit</Link>
            <button className="primary-button" type="submit">
              {config.id === 10 ? 'Submit for review' : 'Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </WorkerLayout>
  )
}

function WorkerSubmittedPage({ worker }: { worker: WorkerRecord }) {
  return (
    <WorkerLayout worker={worker} title="Your onboarding has been submitted for review." subtitle="Paymaan or a team member will review within 24 hours. We'll SMS you when you're cleared for your first shift.">
      <section className="panel panel-strong submit-panel">
        <CheckCircle2 size={64} className="success-icon" />
        <p className="hero-copy narrow">Everything in this demo is simulated, but the approval path behaves like the real product would.</p>
        <div className="button-row center-buttons stack-on-mobile">
          <Link className="primary-button" to="/worker/dashboard">Back to dashboard</Link>
          <Link className="secondary-button" to="/admin/forms/sam-example">Preview admin review</Link>
        </div>
      </section>
    </WorkerLayout>
  )
}

function WorkerLayout({
  worker,
  title,
  subtitle,
  children,
  backTo,
  topAction,
}: {
  worker: WorkerRecord
  title: string
  subtitle: string
  children: React.ReactNode
  backTo?: string
  topAction?: React.ReactNode
}) {
  return (
    <div className="page-shell worker-shell">
      <header className="context-header">
        <div className="context-header-top">
          <Link className="logo-lockup" to="/">
            <img className="monogram" src={monogramLogo} alt="Soldier monogram" />
            <img className="header-logo labour" src={labourLogo} alt="Soldier Labour Services" />
          </Link>
          <div className="top-actions">
            {topAction}
            <StatusPill status={worker.status} />
          </div>
        </div>
        <div className="context-header-main">
          <div>
            {backTo ? (
              <Link className="back-link" to={backTo}>
                <ArrowLeft size={16} /> Back
              </Link>
            ) : null}
            <h1>{title}</h1>
            <p className="hero-copy">{subtitle}</p>
          </div>
          <div className="profile-chip">
            <div className="avatar-chip" style={{ backgroundColor: worker.avatarColor }}>{worker.firstName.charAt(0)}</div>
            <div>
              <strong>{worker.name}</strong>
              <p>{worker.role}</p>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

function AdminDashboardPage({ workers }: { workers: WorkerRecord[] }) {
  const awaiting = workers.filter((worker) => worker.submittedDate && worker.reviewStatus === 'Awaiting Review')
  const pending = workers.filter((worker) => ['Invited', 'In Progress', 'Changes Requested'].includes(worker.status))
  const expiring = workers.filter((worker) => worker.licences.some((licence) => licence.status === 'Expiring' || licence.status === 'Expired'))

  return (
    <AdminLayout title="Admin dashboard" subtitle="The internal view for invites, reviews, compliance tracking, and workforce status.">
      <div className="kpi-grid">
        <KpiCard label="Total Onboarded" value={String(dashboardMetrics.totalOnboarded)} icon={<Users size={22} />} to="/admin/workers" />
        <KpiCard label="Pending Onboarding" value={String(dashboardMetrics.pendingOnboarding)} icon={<FolderKanban size={22} />} to="/admin/workers" accent="warning" />
        <KpiCard label="Awaiting Review" value={String(awaiting.length)} icon={<FileCheck2 size={22} />} to="/admin/forms" accent="warning" />
        <KpiCard label="Credentials Expiring" value={String(expiring.length)} icon={<BadgeAlert size={22} />} to="/admin/workers" accent="danger" />
      </div>
      <div className="panel-grid admin-grid">
        <section className="panel panel-strong">
          <div className="section-title-row">
            <h2>Recent activity</h2>
            <Bell size={18} />
          </div>
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span>{item.label}</span>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
          <div className="button-row stack-on-mobile">
            <Link className="primary-button" to="/admin/invite">Invite Worker</Link>
            <Link className="secondary-button" to="/admin/forms">Review Pending ({awaiting.length})</Link>
          </div>
        </section>
        <section className="panel">
          <div className="section-title-row">
            <h2>Completions this week vs last</h2>
            <CalendarClock size={18} />
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyCompletionData}>
                <defs>
                  <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7CBE3E" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#7CBE3E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="label" stroke="#9AA0A6" />
                <YAxis stroke="#9AA0A6" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2A2A2A', color: '#FDFBF7' }} />
                <Area type="monotone" dataKey="lastWeek" stroke="#5b5f66" fill="#5b5f66" fillOpacity={0.18} />
                <Area type="monotone" dataKey="thisWeek" stroke="#7CBE3E" fill="url(#greenFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="summary-inline">
            <span>Completed this week: {dashboardMetrics.completedThisWeek}</span>
            <span>Pending now: {pending.length}</span>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function WorkersListPage({ workers }: { workers: WorkerRecord[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  const filtered = useMemo(() => {
    return workers.filter((worker) => {
      const matchesQuery = [worker.name, worker.phone, worker.role, ...worker.licences.map((licence) => licence.number)]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || worker.status === statusFilter
      const matchesRole = roleFilter === 'All' || worker.role === roleFilter
      return matchesQuery && matchesStatus && matchesRole
    })
  }, [query, roleFilter, statusFilter, workers])

  return (
    <AdminLayout title="Workers" subtitle="Search, filter, and review the workforce directory.">
      <section className="panel section-spacer">
        <div className="toolbar-grid">
          <label className="input-with-icon">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, phone, role, licence number" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {['All', 'Onboarded', 'Pending', 'Awaiting Review', 'In Progress', 'Invited', 'Changes Requested'].map((option) => (
              <option key={option} value={option === 'Pending' ? 'Pending' : option}>{option}</option>
            ))}
          </select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            {['All', 'Crane Operator', 'Dogman', 'Rigger', 'Supervisor', 'Labourer'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <Link className="primary-button" to="/admin/invite">+ Invite Worker</Link>
        </div>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date invited</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker) => (
                <tr key={worker.id}>
                  <td>
                    <Link className="inline-link" to={`/admin/workers/${worker.id}`}>{worker.name}</Link>
                  </td>
                  <td>{worker.role}</td>
                  <td><StatusPill status={worker.status} /></td>
                  <td>{worker.invitedDate}</td>
                  <td>{worker.completion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}

function WorkerDetailPage({ workers, onReview }: { workers: WorkerRecord[]; onReview: (workerId: string, reviewStatus: ReviewStatus, note: string) => void }) {
  const { workerId } = useParams()
  const worker = workers.find((item) => item.id === workerId)

  if (!worker) return <Navigate to="/admin/workers" replace />

  return (
    <AdminLayout title={worker.name} subtitle="Overview, onboarding data, licences, activity, and internal notes.">
      <div className="detail-hero panel panel-strong">
        <div className="profile-row">
          <div className="avatar-large" style={{ backgroundColor: worker.avatarColor }}>{worker.firstName.charAt(0)}</div>
          <div>
            <h2>{worker.role}</h2>
            <p>{worker.phone} • {worker.email}</p>
            <p className="small-muted">{worker.location}</p>
          </div>
        </div>
        <div className="button-row stack-on-mobile">
          <button className="primary-button" type="button" onClick={() => onReview(worker.id, 'Approved', 'Approved from worker detail view')}>Approve</button>
          <button className="secondary-button" type="button" onClick={() => onReview(worker.id, 'Changes Requested', 'Changes requested from worker detail view')}>Request Changes</button>
          <button className="secondary-button danger" type="button" onClick={() => onReview(worker.id, 'Rejected', 'Marked inactive in prototype')}>Mark Inactive</button>
        </div>
      </div>
      <div className="panel-grid admin-detail-grid section-spacer">
        <section className="panel">
          <div className="section-title-row"><h2>Overview</h2><UserRound size={18} /></div>
          <div className="overview-list">
            <DetailRow label="Status" value={<StatusPill status={worker.status} />} />
            <DetailRow label="Completion" value={`${worker.completion}%`} />
            <DetailRow label="Submitted" value={worker.submittedDate || 'Not submitted'} />
            <DetailRow label="Current step" value={`Step ${worker.currentStep} — ${workerSteps[worker.currentStep - 1] || 'Not started'}`} />
          </div>
        </section>
        <section className="panel">
          <div className="section-title-row"><h2>Licences & Tickets</h2><ShieldCheck size={18} /></div>
          <div className="licence-list">
            {worker.licences.length ? worker.licences.map((licence) => (
              <div className="licence-card" key={`${worker.id}-${licence.number}`}>
                <div>
                  <strong>{licence.type}</strong>
                  <p>{licence.number}</p>
                </div>
                <div>
                  <p>{licence.expiry}</p>
                  <StatusPill status={licence.status} />
                </div>
              </div>
            )) : <p className="small-muted">No documents uploaded yet.</p>}
          </div>
        </section>
        <section className="panel">
          <div className="section-title-row"><h2>Activity log</h2><Bell size={18} /></div>
          <div className="activity-list">
            {worker.activity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span>{item.label}</span>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-title-row"><h2>Notes</h2><Briefcase size={18} /></div>
          <div className="notes-list">
            {worker.adminNotes.map((note, index) => <p key={`${worker.id}-note-${index}`}>{note}</p>)}
          </div>
        </section>
      </div>
      <section className="panel section-spacer">
        <div className="section-title-row"><h2>Onboarding form snapshot</h2><Eye size={18} /></div>
        <ReadOnlyFormSummary worker={worker} />
      </section>
    </AdminLayout>
  )
}

function CompletedFormsPage({ workers }: { workers: WorkerRecord[] }) {
  const [filter, setFilter] = useState<ReviewStatus | 'All'>('Awaiting Review')
  const forms = workers.filter((worker) => worker.submittedDate)
  const filtered = filter === 'All' ? forms : forms.filter((worker) => worker.reviewStatus === filter)

  return (
    <AdminLayout title="Completed onboarding forms" subtitle="Review submitted forms and update worker status in-session.">
      <section className="panel section-spacer">
        <div className="chip-row">
          {(['Awaiting Review', 'Approved', 'Changes Requested', 'Rejected', 'All'] as const).map((item) => (
            <button key={item} className={`chip-button ${filter === item ? 'active' : ''}`} type="button" onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <div className="forms-list">
          {filtered.map((worker) => (
            <Link className="form-list-item" key={worker.id} to={`/admin/forms/${worker.id}`}>
              <div>
                <h3>{worker.name}</h3>
                <p>{worker.role}</p>
              </div>
              <div>
                <p>{worker.submittedDate}</p>
                <StatusPill status={worker.reviewStatus} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}

function FormViewerPage({ workers, onReview }: { workers: WorkerRecord[]; onReview: (workerId: string, reviewStatus: ReviewStatus, note: string) => void }) {
  const { workerId } = useParams()
  const worker = workers.find((item) => item.id === workerId)

  if (!worker) return <Navigate to="/admin/forms" replace />

  return (
    <AdminLayout title={`Form viewer — ${worker.name}`} subtitle="Read-only view of the submitted onboarding form with inline review actions.">
      <section className="panel section-spacer">
        <ReadOnlyFormSummary worker={worker} expanded />
      </section>
      <section className="review-bar">
        <button className="primary-button" type="button" onClick={() => onReview(worker.id, 'Approved', 'Approved from form viewer')}>Approve</button>
        <button className="secondary-button" type="button" onClick={() => onReview(worker.id, 'Changes Requested', 'Request changes: missing follow-up items')}>Request Changes</button>
        <button className="secondary-button danger" type="button" onClick={() => onReview(worker.id, 'Rejected', 'Rejected in prototype review flow')}>Reject</button>
      </section>
    </AdminLayout>
  )
}

function InviteWorkerPage({ invitePreview, onSendInvite }: { invitePreview: string; onSendInvite: (draft: InviteDraft) => void }) {
  const [draft, setDraft] = useState<InviteDraft>({ firstName: '', lastName: '', mobile: '', email: '', position: 'Crane Operator', note: '', siteAssignment: '' })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSendInvite(draft)
    setDraft({ firstName: '', lastName: '', mobile: '', email: '', position: 'Crane Operator', note: '', siteAssignment: '' })
  }

  return (
    <AdminLayout title="Invite new worker" subtitle="Create a simulated invite and preview the outbound SMS copy.">
      <div className="panel-grid admin-grid section-spacer">
        <section className="panel panel-strong">
          <form className="wizard-form" onSubmit={handleSubmit}>
            <div className="form-grid compact-grid">
              <SimpleInput label="First name" value={draft.firstName} onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))} />
              <SimpleInput label="Last name" value={draft.lastName} onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))} />
              <SimpleInput label="Mobile" value={draft.mobile} onChange={(value) => setDraft((current) => ({ ...current, mobile: value }))} />
              <SimpleInput label="Email" value={draft.email} onChange={(value) => setDraft((current) => ({ ...current, email: value }))} />
              <SimpleSelect label="Position applying for" value={draft.position} options={['Crane Operator', 'Dogman', 'Rigger', 'Supervisor', 'Labourer']} onChange={(value) => setDraft((current) => ({ ...current, position: value }))} />
              <SimpleInput label="Site assignment placeholder" value={draft.siteAssignment} onChange={(value) => setDraft((current) => ({ ...current, siteAssignment: value }))} />
              <div className="field full-span">
                <label>Internal note</label>
                <textarea rows={4} value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Optional admin note" />
              </div>
            </div>
            <button className="primary-button" type="submit"><Send size={18} /> Send Invite</button>
          </form>
        </section>
        <section className="panel phone-preview-card">
          <div className="section-title-row"><h2>Simulated SMS preview</h2><Phone size={18} /></div>
          <div className="phone-preview">
            <div className="phone-preview-top">Soldier outbound message</div>
            <div className="phone-preview-body">
              <p>{invitePreview || 'Hi John, Paymaan at Soldier has invited you to onboard. Tap here: soldier.au/onboard/abc123'}</p>
              <p className="small-muted">No SMS is actually sent in this prototype.</p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function AdminLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const location = useLocation()
  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/admin/workers', label: 'Workers', icon: <Users size={16} /> },
    { to: '/admin/forms', label: 'Forms', icon: <FileCheck2 size={16} /> },
    { to: '/admin/invite', label: 'Invite', icon: <Send size={16} /> },
  ]

  return (
    <div className="page-shell admin-shell">
      <header className="context-header admin-header">
        <div className="context-header-top">
          <Link className="logo-lockup" to="/">
            <img className="monogram" src={monogramLogo} alt="Soldier monogram" />
            <img className="header-logo" src={parentLogo} alt="Soldier Group" />
          </Link>
          <div className="top-actions">
            <span className="pill muted-pill">Admin mode</span>
          </div>
        </div>
        <div className="context-header-main admin-main">
          <div>
            <h1>{title}</h1>
            <p className="hero-copy">{subtitle}</p>
          </div>
          <nav className="admin-nav">
            {navItems.map((item) => (
              <Link key={item.to} className={`admin-nav-link ${location.pathname === item.to ? 'active' : ''}`} to={item.to}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  error,
  onChange,
}: {
  field: StepField
  value: WorkerFormData[keyof WorkerFormData]
  error?: string
  onChange: (key: keyof WorkerFormData, next: string | boolean) => void
}) {
  const commonProps = {
    id: String(field.key),
    name: String(field.key),
    placeholder: field.placeholder,
  }

  return (
    <div className={`field ${field.type === 'textarea' ? 'full-span' : ''} ${field.type === 'checkbox' ? 'full-span checkbox-field' : ''}`}>
      {field.type !== 'checkbox' ? <label htmlFor={String(field.key)}>{field.label}{field.required ? ' *' : ''}</label> : null}
      {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'date' ? (
        <input type={field.type} {...commonProps} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(field.key, event.target.value)} />
      ) : null}
      {field.type === 'textarea' ? (
        <textarea rows={4} {...commonProps} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(field.key, event.target.value)} />
      ) : null}
      {field.type === 'select' ? (
        <select id={String(field.key)} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(field.key, event.target.value)}>
          <option value="">Select</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : null}
      {field.type === 'checkbox' ? (
        <label className="checkbox-row" htmlFor={String(field.key)}>
          <input id={String(field.key)} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.key, event.target.checked)} />
          <span>{field.label}</span>
        </label>
      ) : null}
      {field.type === 'upload' ? (
        <div className="upload-card">
          <button className="secondary-button" type="button" onClick={() => onChange(field.key, 'Added from camera roll (prototype)')}>Add file</button>
          <span>{typeof value === 'string' && value ? value : 'No file added yet'}</span>
        </div>
      ) : null}
      {field.type === 'signature' ? (
        <div className="signature-card">
          <div className="signature-pad">Tap to simulate a signature in the prototype</div>
          <div className="button-row compact-row">
            <button className="secondary-button" type="button" onClick={() => onChange(field.key, 'Signed in prototype')}>Simulate signature</button>
            <button className="text-button" type="button" onClick={() => onChange(field.key, '')}>Clear</button>
          </div>
          <span>{typeof value === 'string' && value ? value : 'No signature captured yet'}</span>
        </div>
      ) : null}
      {field.helper ? <p className="small-muted">{field.helper}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

function ReadOnlyFormSummary({ worker, expanded = false }: { worker: WorkerRecord; expanded?: boolean }) {
  const visibleSteps = expanded ? stepConfigs : stepConfigs.slice(0, 5)

  return (
    <div className="read-only-stack">
      {visibleSteps.map((step) => (
        <section className="read-only-section" key={`${worker.id}-${step.id}`}>
          <div className="section-title-row">
            <h3>Step {step.id} — {step.title}</h3>
            <StatusPill status={step.id <= worker.currentStep ? 'Submitted' : 'Pending'} />
          </div>
          <div className="read-only-grid">
            {step.fields.map((field) => {
              const value = worker.formData[field.key]
              return (
                <div className="read-only-item" key={`${worker.id}-${String(field.key)}`}>
                  <span>{field.label}</span>
                  <strong>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—'}</strong>
                </div>
              )
            })}
          </div>
        </section>
      ))}
      {!expanded ? <p className="small-muted">Open the full Form Viewer to see every section.</p> : null}
    </div>
  )
}

function KpiCard({ label, value, icon, to, accent = 'default' }: { label: string; value: string; icon: React.ReactNode; to: string; accent?: 'default' | 'warning' | 'danger' }) {
  return (
    <Link className={`kpi-card ${accent}`} to={to}>
      <div>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
    </Link>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    ['Done', 'Onboarded', 'Approved', 'Valid', 'Submitted'].includes(status)
      ? 'success'
      : ['Awaiting Review', 'In progress', 'Expiring', 'warning'].includes(status)
        ? 'warning'
        : ['Rejected', 'Expired'].includes(status)
          ? 'danger'
          : ['Changes Requested'].includes(status)
            ? 'warning'
            : 'muted'

  return <span className={`pill ${tone}`}>{status}</span>
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-track" aria-label={`${value}% complete`}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

function DocPlaceholder({ title, value }: { title: string; value: string }) {
  return (
    <div className="doc-card">
      <div>
        <strong>{title}</strong>
        <p>{value}</p>
      </div>
      <CircleAlert size={18} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SimpleInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function SimpleSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  )
}

export default App
