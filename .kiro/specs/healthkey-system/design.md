# Design Document

## Overview

HealthKey is a patient-controlled medical information system that enables secure, time-limited access to critical health data through AI-generated summaries. The system leverages Amazon Bedrock for intelligent document processing and implements strong privacy, security, and auditability suitable for healthcare data while maintaining patient data ownership.

The architecture follows a modular service-based design (MVP-friendly) with clear separation between patient management, clinician access, AI processing, and notification services. All components are designed for security and auditability.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        PW[Patient Web Interface]
        CW[Clinician Web Interface]
    end
    
    subgraph "API Gateway Layer"
        AG[API Gateway]
        AUTH[Authentication Service]
    end
    
    subgraph "Core Services"
        PM[Patient Management Service]
        AM[Access Management Service]
        AI[AI Processing Service]
        NS[Notification Service]
        AL[Audit Logging Service]
    end
    
    subgraph "External Services"
        BR[Amazon Bedrock]
        HV[Hospital/Org Verification (optional)]
        EC[Emergency Contacts]
    end
    
    subgraph "Data Layer"
        PDB[(Patient Database)]
        ADB[(Audit Database)]
        FS[File Storage]
    end
    
    PW --> AG
    CW --> AG
    AG --> AUTH
    AG --> PM
    AG --> AM
    AG --> AI
    AG --> NS
    AG --> AL
    
    PM --> PDB
    AM --> PDB
    AM --> HV
    AI --> BR
    AI --> FS
    NS --> EC
    AL --> ADB
    
    PM --> AL
    AM --> AL
    AI --> AL
```

### Security Architecture

The system implements defense-in-depth security with multiple layers:

1. **Authentication Layer**: Strong authentication (MFA recommended for clinicians and optional for patients)
2. **Authorization Layer**: Role-based access control with time-bound sessions
3. **Data Layer**: Encryption at rest and in transit
4. **Audit Layer**: Comprehensive logging of all data access and modifications
5. **Network Layer**: VPC isolation and security groups

## Components and Interfaces

### Patient Management Service

**Responsibilities:**
- Patient registration and profile management
- HealthKey ID generation and management
- Critical health information definition and updates
- Document upload coordination

**Key Interfaces:**
```typescript
interface PatientService {
  registerPatient(profile: PatientProfile): Promise<HealthKeyID>
  claimHospitalAccount(claimToken: string, credentials: PatientCredentials): Promise<void>
  updateProfile(patientId: string, updates: ProfileUpdates): Promise<void>
  defineCriticalInfo(patientId: string, criticalData: CriticalHealthInfo): Promise<void>
  uploadDocument(patientId: string, document: MedicalDocument): Promise<DocumentID>
}
```

### Access Management Service

**Responsibilities:**
- Clinician authentication through hospital/organizational authentication mechanisms
- Access request processing
- Time-bound session management
- Time-sensitive access workflow

**Key Interfaces:**
```typescript
interface AccessService {
  requestAccess(clinicianId: string, healthKeyId: string, purpose: string): Promise<AccessSession>
  verifyBiometric(biometricData: BiometricData, healthKeyId: string): Promise<AccessSession>
  validateSession(sessionId: string): Promise<SessionStatus>
  revokeAccess(sessionId: string): Promise<void>
}
```

### AI Processing Service

**Responsibilities:**
- Document processing and information extraction
- Clinical summary generation
- Multilingual translation
- Data source labeling

**Key Interfaces:**
```typescript
interface AIService {
  processDocument(document: MedicalDocument): Promise<ExtractedInfo>
  generateSummary(criticalInfo: CriticalHealthInfo, language: string): Promise<ClinicalSummary>
  translateContent(content: string, targetLanguage: string): Promise<TranslatedContent>
}
```

### Notification Service

**Responsibilities:**
- Emergency contact notifications
- Real-time access alerts
- Multi-channel message delivery

**Key Interfaces:**
```typescript
interface NotificationService {
  notifyEmergencyContacts(accessEvent: AccessEvent): Promise<NotificationResult[]>
  sendAccessAlert(patientId: string, accessDetails: AccessDetails): Promise<void>
}
```

## Data Models

### Core Data Structures

```typescript
interface PatientProfile {
  healthKeyId: string
  personalInfo: PersonalInfo
  emergencyContacts: EmergencyContact[]
  criticalHealthInfo: CriticalHealthInfo
  preferences: PatientPreferences
  createdAt: Date
  updatedAt: Date
}

interface CriticalHealthInfo {
  allergies: Allergy[]
  bloodGroup: BloodGroup
  medications: Medication[]
  conditions: MedicalCondition[]
  surgeries: Surgery[]
  implants: MedicalDevice[]
  patientEntered: CriticalDataItem[]
  documentExtracted: CriticalDataItem[]
}

interface AccessSession {
  sessionId: string
  clinicianId: string
  healthKeyId: string
  purpose: string
  hospitalInfo: HospitalInfo
  expiresAt: Date
  createdAt: Date
  status: SessionStatus
}

interface AuditLogEntry {
  id: string
  patientId: string
  action: AuditAction
  actor: string
  timestamp: Date
  details: Record<string, any>
  ipAddress: string
}
```

### Document Processing Models

```typescript
interface MedicalDocument {
  id: string
  patientId: string
  filename: string
  contentType: string
  uploadedAt: Date
  processedAt?: Date
  extractedInfo?: ExtractedInfo
  status: ProcessingStatus
}

interface ExtractedInfo {
  criticalFindings: CriticalDataItem[]
  sourceLanguage: string
  confidence: number
  processingMetadata: ProcessingMetadata
}

interface ClinicalSummary {
  patientId: string
  generatedAt: Date
  language: string
  summary: string
  criticalAlerts: string[]
  dataSourceBreakdown: DataSourceSummary
}
```

## Validation & Testing (MVP)

- **Role-based access control checks**: Verify that patients can only access their own data and clinicians can only access critical information during valid sessions
- **Time-bound session expiry**: Ensure all clinician access sessions automatically expire after configured time limits and revoke access appropriately
- **Audit log completeness**: Validate that all patient data actions (updates, access requests, document uploads) create corresponding audit entries with required details
- **AI summary generation + fallback behavior**: Test that AI pipeline generates clinical summaries successfully and falls back to raw critical information when generation fails
- **Multilingual translation check**: Verify that multilingual documents are processed correctly with source language preservation and translation capabilities
- **Notification trigger check**: Ensure emergency contacts receive notifications with complete information (clinician name, hospital, timestamp) for all access requests
- **Basic security tests**: Confirm authentication is required for all system access and unauthenticated requests are properly rejected

## Error Handling

### Document Processing Errors
- **Processing Failures**: When AI pipeline fails to process documents, the system maintains original documents and notifies patients with specific error details
- **Extraction Errors**: Partial extraction failures are handled gracefully, with successfully extracted data saved and errors logged
- **Language Detection Failures**: Documents with undetectable languages are processed with best-effort extraction and flagged for patient confirmation and re-upload if needed

### Access Control Errors
- **Authentication Failures**: Failed clinician authentication attempts are logged and blocked after configurable retry limits
- **Session Expiration**: Expired sessions trigger automatic cleanup and user redirection with clear messaging
- **Biometric Failures**: Failed biometric verification prompts HealthKey_ID-based access request if available; otherwise access cannot proceed until the patient can authenticate or an authorized attendant helps

### Notification Errors
- **Delivery Failures**: Failed emergency contact notifications are logged with retry mechanisms for transient failures
- **Invalid Contact Information**: Invalid emergency contacts don't prevent access processing but are flagged for patient attention
- **Service Outages**: Notification service outages trigger fallback mechanisms and delayed delivery queues

### Data Integrity Errors
- **Audit Log Failures**: Critical system operations that fail to create audit entries trigger system alerts and potential transaction rollbacks
- **Database Consistency**: Data inconsistencies between services trigger automatic reconciliation processes
- **Backup Failures**: Failed backup operations trigger immediate alerts and alternative backup mechanisms
