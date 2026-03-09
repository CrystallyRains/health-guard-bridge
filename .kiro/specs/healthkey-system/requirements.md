# Requirements Document

## Introduction

HealthKey is a patient-controlled system that enables doctors to access critical medical information in a secure, time-limited manner through AI-generated summaries. The system provides clinicians with fast, reliable medical context while ensuring privacy, auditability, and patient ownership of data.

## Glossary

- **HealthKey_System**: The complete patient-controlled medical information platform
- **Patient**: Individual who owns and controls their medical data in the system
- **Clinician**: Authenticated medical professional (doctor/nurse) requesting patient information access
- **HealthKey_ID**: Unique identifier assigned to each patient for access requests
- **Critical_Health_Information**: Patient-defined subset of medical data consented for controlled, time-sensitive clinical sharing
- **AI_Pipeline**: Amazon Bedrock-powered system for document processing and summary generation
- **Emergency_Contact**: Patient-designated individual who receives access notifications
- **Access_Session**: Time-limited period during which a clinician can view patient summaries
- **Audit_Log**: Complete record of all system actions visible to patients

## Requirements

### Requirement 1: Patient Registration and Profile Management

**User Story:** As a patient, I want to register for HealthKey and manage my medical profile, so that I can control my medical information sharing.

#### Acceptance Criteria

1. WHEN a patient completes self-registration, THE HealthKey_System SHALL create a unique HealthKey_ID and patient account
2. WHEN hospital staff creates a patient profile, THE HealthKey_System SHALL generate a minimal profile with HealthKey_ID for later patient claiming
3. WHEN a patient claims a hospital-created account, THE HealthKey_System SHALL transfer full profile control to the patient
4. THE Patient SHALL be able to manually add allergies, blood group, medications, conditions, surgeries, emergency contacts, and preferred language
5. WHEN a patient updates their profile, THE HealthKey_System SHALL log the change in the Audit_Log immediately

### Requirement 2: Document Upload and Processing

**User Story:** As a patient, I want to upload medical documents, so that AI can extract critical information for clinician access.

#### Acceptance Criteria

1. WHEN a patient uploads a medical document, THE HealthKey_System SHALL store it securely and trigger AI_Pipeline processing
2. WHEN the AI_Pipeline processes a document, THE HealthKey_System SHALL extract critical medical facts and label them as document-derived
3. WHEN document processing completes, THE HealthKey_System SHALL update the patient's Critical_Health_Information with extracted data
4. THE AI_Pipeline SHALL support multilingual documents and preserve source language references
5. WHEN processing fails, THE HealthKey_System SHALL notify the patient and maintain the original document

### Requirement 3: Critical Health Information Management

**User Story:** As a patient, I want to define what medical information is critical for controlled, time-sensitive clinical sharing, so that I control what clinicians can access.


#### Acceptance Criteria

1. THE Patient SHALL be able to designate which medical information constitutes Critical_Health_Information
2. WHEN displaying Critical_Health_Information, THE HealthKey_System SHALL clearly label each item as patient-entered or document-extracted
3. THE Patient SHALL be able to modify or remove any Critical_Health_Information at any time
4. WHEN Critical_Health_Information changes, THE HealthKey_System SHALL update the clinician summary view immediately
5. THE HealthKey_System SHALL combine patient-entered and document-derived data into a unified critical view

### Requirement 4: Clinician Access Requests

**User Story:** As a clinician, I want to request access to a patient's critical medical information, so that I can provide informed medical care quickly.

#### Acceptance Criteria

1. WHEN a clinician requests access using a HealthKey_ID, THE HealthKey_System SHALL authenticate the clinician's credentials
2. WHEN access is granted, THE HealthKey_System SHALL create a time-limited Access_Session restricted to Critical_Health_Information only
3. WHEN an Access_Session is created, THE HealthKey_System SHALL notify all Emergency_Contacts immediately with clinician name, hospital name, and hospital address
4. THE HealthKey_System SHALL support biometric-based patient identification for access requests when patients cannot actively authenticate
5. WHEN an Access_Session expires, THE HealthKey_System SHALL revoke all clinician access automatically

### Requirement 5: AI-Generated Clinical Summaries

**User Story:** As a clinician, I want to view AI-generated summaries of patient information, so that I can quickly understand critical medical context.

#### Acceptance Criteria

1. WHEN a clinician accesses patient information, THE AI_Pipeline SHALL generate a concise clinical summary from Critical_Health_Information
2. THE AI_Pipeline SHALL translate content into the clinician's preferred language while preserving source references
3. WHEN generating summaries, THE AI_Pipeline SHALL clearly distinguish between patient-entered and document-extracted information
4. THE AI_Pipeline SHALL optimize summaries for clinical use with relevant medical terminology
5. WHEN summary generation fails, THE HealthKey_System SHALL display raw Critical_Health_Information with error notification

### Requirement 6: Emergency Contact Notifications

**User Story:** As an emergency contact, I want to receive instant notifications when clinicians access my family member's information, so that I stay informed about their medical care.

#### Acceptance Criteria

1. WHEN a clinician requests access, THE HealthKey_System SHALL send instant notifications to all Emergency_Contacts
2. THE Notification SHALL include clinician name, hospital name, hospital address, and timestamp
3. WHEN multiple access requests occur, THE HealthKey_System SHALL send separate notifications for each request
4. THE HealthKey_System SHALL support multiple notification methods for Emergency_Contacts
5. WHEN Emergency_Contact information is invalid, THE HealthKey_System SHALL log the delivery failure and continue processing

### Requirement 7: Audit Logging and Transparency

**User Story:** As a patient, I want to view all actions taken on my medical data, so that I can monitor access and maintain control over my information.

#### Acceptance Criteria

1. WHEN any action occurs on patient data, THE HealthKey_System SHALL create an entry in the Audit_Log immediately
2. THE Audit_Log SHALL record data updates, access requests, clinician views, and system actions with timestamps
3. THE Patient SHALL be able to view their complete Audit_Log through the web interface
4. WHEN displaying audit entries, THE HealthKey_System SHALL show action type, timestamp, actor, and affected data
5. THE Audit_Log SHALL be immutable and tamper-evident for security compliance

### Requirement 8: Security and Access Control

**User Story:** As a system administrator, I want to ensure secure, role-based access to patient data, so that privacy and compliance requirements are met.

#### Acceptance Criteria

1. THE HealthKey_System SHALL authenticate all users before granting any system access
2. WHEN processing access requests, THE HealthKey_System SHALL verify clinician credentials through hospital or organizational authentication mechanisms
3. THE HealthKey_System SHALL enforce time-bound access sessions that automatically expire
4. THE HealthKey_System SHALL prevent any access to full medical records beyond Critical_Health_Information
5. WHEN security violations are detected, THE HealthKey_System SHALL log the incident and revoke access immediately

### Requirement 9: Web Interface for Patients

**User Story:** As a patient, I want a web interface to manage my HealthKey account, so that I can easily control my medical information sharing.

#### Acceptance Criteria

1. THE HealthKey_System SHALL provide a web interface for patient registration and profile management
2. THE Patient SHALL be able to upload medical documents through the web interface
3. THE Patient SHALL be able to define and modify Critical_Health_Information through the web interface
4. THE Patient SHALL be able to view their Audit_Log through the web interface
5. WHEN using the web interface, THE HealthKey_System SHALL provide clear visual feedback for all patient actions

### Requirement 10: Web Interface for Clinicians

**User Story:** As a clinician, I want a web interface to request patient access and view summaries, so that I can quickly obtain critical medical information during patient care.

#### Acceptance Criteria

1. THE HealthKey_System SHALL provide a web interface for clinician authentication and access requests
2. WHEN a clinician enters a HealthKey_ID, THE HealthKey_System SHALL initiate the access request process through the web interface
3. THE Clinician SHALL be able to view time-limited AI-generated summaries through the web interface
4. THE HealthKey_System SHALL display access session time remaining prominently in the clinician interface
5. WHEN access expires, THE HealthKey_System SHALL automatically redirect clinicians to the request page
