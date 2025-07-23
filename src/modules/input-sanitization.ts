import DOMPurify from 'dompurify';

/**
 * Input sanitization module - Prevents XSS and injection attacks
 * All user input must pass through this module
 */

export class InputSanitizer {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  /**
   * Sanitize email content while preserving structure
   */
  static sanitizeEmailContent(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove any script tags or dangerous content
    let sanitized = input;
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Preserve email structure but escape HTML
    sanitized = this.escapeHtml(sanitized);

    return sanitized.trim();
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Use DOMPurify for thorough sanitization
    const clean = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    return clean.trim();
  }

  /**
   * Sanitize and validate email address
   */
  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeText(email);
    
    if (!this.EMAIL_PATTERN.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized.toLowerCase();
  }

  /**
   * Sanitize date input
   */
  static sanitizeDate(dateInput: string): string {
    // Remove any non-date characters
    const sanitized = dateInput.replace(/[<>\"'&]/g, '');
    return sanitized.trim();
  }

  /**
   * Escape HTML entities
   */
  private static escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize student name
   */
  static sanitizeStudentName(name: string): string {
    const sanitized = this.sanitizeText(name);
    
    // Ensure reasonable length
    if (sanitized.length < 1 || sanitized.length > 100) {
      throw new Error('Invalid name length');
    }

    // Only allow letters, spaces, hyphens, and apostrophes
    const cleaned = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
    
    return cleaned.trim();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: string | number, min?: number, max?: number): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }

    if (min !== undefined && num < min) {
      throw new Error(`Number must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new Error(`Number must be at most ${max}`);
    }

    return num;
  }

  /**
   * Validate content type based on patterns
   */
  static detectContentType(content: string): 'email' | 'task' | 'unknown' {
    const sanitized = this.sanitizeText(content);
    
    // Email patterns
    const emailPatterns = /@|from:|to:|subject:|sent:|date:/i;
    if (emailPatterns.test(sanitized)) {
      return 'email';
    }

    // Task patterns
    const taskPatterns = /task|project|deliverable|milestone|complete|implement/i;
    if (taskPatterns.test(sanitized)) {
      return 'task';
    }

    return 'unknown';
  }
}