/**
 * Privacy and Ethics Compliance Module
 * Ensures POCs meet Ontario privacy standards and ethical guidelines
 */

export interface PrivacyCheckResult {
  isCompliant: boolean;
  issues: PrivacyIssue[];
  suggestions: string[];
}

export interface PrivacyIssue {
  severity: 'high' | 'medium' | 'low';
  type: PrivacyIssueType;
  description: string;
  location: string;
}

export type PrivacyIssueType = 
  | 'personal-health-info'
  | 'third-party-info'
  | 'inappropriate-detail'
  | 'missing-consent'
  | 'identifiable-info'
  | 'subjective-language'
  | 'unprofessional-tone';

/**
 * Check POC content for privacy and ethics compliance
 */
export function checkPrivacyCompliance(pocContent: string): PrivacyCheckResult {
  const issues: PrivacyIssue[] = [];
  const suggestions: string[] = [];

  // Check for personal health information
  const healthInfoPatterns = [
    /\b(diagnosis|diagnosed with|medication|prescription|medical condition|mental health diagnosis|psychiatric)\b/gi,
    /\b(HIV|AIDS|cancer|diabetes|bipolar|schizophrenia|ADHD|autism)\b/gi,
    /\b(suicide|self-harm|addiction|substance abuse)\b/gi
  ];

  healthInfoPatterns.forEach(pattern => {
    const matches = pocContent.match(pattern);
    if (matches) {
      issues.push({
        severity: 'high',
        type: 'personal-health-info',
        description: `Contains sensitive health information: "${matches[0]}"`,
        location: matches[0]
      });
      suggestions.push('Replace specific diagnoses with general terms like "health condition" or "documented disability"');
    }
  });

  // Check for third-party information
  const thirdPartyPatterns = [
    /\b(mother|father|parent|sibling|partner|spouse|roommate|friend)\s+(said|reported|called|contacted)/gi,
    /\b(professor|instructor|TA)\s+\w+\s+(complained|reported|said)/gi
  ];

  thirdPartyPatterns.forEach(pattern => {
    const matches = pocContent.match(pattern);
    if (matches) {
      issues.push({
        severity: 'medium',
        type: 'third-party-info',
        description: 'Contains third-party information without clear consent',
        location: matches[0]
      });
      suggestions.push('Ensure third-party information is relevant and consented to be included');
    }
  });

  // Check for inappropriate personal details
  const inappropriateDetailPatterns = [
    /\b(home address|phone number|social insurance|student number|employee number)\b/gi,
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g // Email addresses
  ];

  inappropriateDetailPatterns.forEach(pattern => {
    const matches = pocContent.match(pattern);
    if (matches) {
      issues.push({
        severity: 'high',
        type: 'identifiable-info',
        description: 'Contains personally identifiable information',
        location: matches[0]
      });
      suggestions.push('Remove specific identifying information like phone numbers, addresses, or ID numbers');
    }
  });

  // Check for subjective or judgmental language
  const subjectivePatterns = [
    /\b(lazy|unmotivated|difficult|problematic|uncooperative|demanding|entitled)\b/gi,
    /\b(clearly lying|obviously faking|seeking attention|manipulative)\b/gi,
    /\b(should have|could have|needs to learn|must understand)\b/gi
  ];

  subjectivePatterns.forEach(pattern => {
    const matches = pocContent.match(pattern);
    if (matches) {
      issues.push({
        severity: 'medium',
        type: 'subjective-language',
        description: `Contains subjective or judgmental language: "${matches[0]}"`,
        location: matches[0]
      });
      suggestions.push('Use objective, observable language instead of subjective interpretations');
    }
  });

  // Check for unprofessional tone
  const unprofessionalPatterns = [
    /\b(ugh|omg|lol|wtf|damn|hell)\b/gi,
    /\!{2,}/g, // Multiple exclamation marks
    /\?{2,}/g, // Multiple question marks
    /\.{4,}/g  // Excessive ellipsis
  ];

  unprofessionalPatterns.forEach(pattern => {
    const matches = pocContent.match(pattern);
    if (matches) {
      issues.push({
        severity: 'low',
        type: 'unprofessional-tone',
        description: 'Contains unprofessional language or formatting',
        location: matches[0]
      });
      suggestions.push('Maintain professional tone throughout documentation');
    }
  });

  // Add general suggestions
  if (issues.length === 0) {
    suggestions.push('Documentation appears to meet privacy and ethical standards');
  } else {
    suggestions.push('Review and revise flagged sections before finalizing');
  }

  return {
    isCompliant: issues.filter(i => i.severity === 'high').length === 0,
    issues,
    suggestions
  };
}

/**
 * Sanitize POC content to remove privacy concerns
 */
export function sanitizePOCContent(content: string): string {
  let sanitized = content;

  // Remove email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email redacted]');

  // Remove phone numbers
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone redacted]');

  // Remove student numbers (assuming 9-digit format)
  sanitized = sanitized.replace(/\b\d{9}\b/g, '[ID redacted]');

  // Replace specific medical terms with general ones
  const medicalReplacements: Record<string, string> = {
    'ADHD': 'documented condition',
    'autism': 'documented condition',
    'depression': 'mental health condition',
    'anxiety': 'mental health concern',
    'bipolar': 'documented condition',
    'schizophrenia': 'documented condition'
  };

  Object.entries(medicalReplacements).forEach(([term, replacement]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  });

  return sanitized;
}

/**
 * Generate privacy-compliant alternatives for common scenarios
 */
export function getPrivacyCompliantAlternatives(originalText: string): string[] {
  const alternatives: string[] = [];

  // Medical conditions
  if (/diagnosed with|has ADHD|has autism/i.test(originalText)) {
    alternatives.push('Student has documented disability requiring accommodations');
    alternatives.push('Student presented medical documentation supporting accommodation request');
  }

  // Family involvement
  if (/mother called|parent contacted|father said/i.test(originalText)) {
    alternatives.push('Received third-party inquiry regarding student (consent on file)');
    alternatives.push('Authorized family member contacted office regarding student concerns');
  }

  // Mental health
  if (/suicidal|self-harm|crisis/i.test(originalText)) {
    alternatives.push('Student presented with urgent mental health concerns; appropriate referrals made');
    alternatives.push('Immediate support provided; connected with crisis resources');
  }

  // Academic struggles
  if (/failing|can't handle|struggling badly/i.test(originalText)) {
    alternatives.push('Student experiencing academic challenges');
    alternatives.push('Student reported difficulty meeting course requirements');
  }

  return alternatives;
}

/**
 * Check if consent is properly documented
 */
export function checkConsentDocumentation(pocContent: string): boolean {
  const consentIndicators = [
    /consent (obtained|given|provided|on file)/i,
    /authorized to (discuss|share|contact)/i,
    /permission (granted|given|obtained)/i,
    /agreed to (share|discuss|include)/i
  ];

  return consentIndicators.some(pattern => pattern.test(pocContent));
}