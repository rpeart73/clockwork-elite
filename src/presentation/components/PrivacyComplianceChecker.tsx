import React, { useState, useEffect } from 'react';
import { checkPrivacyCompliance, PrivacyCheckResult } from '@/modules/privacy-compliance';
import './PrivacyComplianceChecker.css';

interface PrivacyComplianceCheckerProps {
  content: string;
}

export const PrivacyComplianceChecker: React.FC<PrivacyComplianceCheckerProps> = ({
  content
}) => {
  const [checkResult, setCheckResult] = useState<PrivacyCheckResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (content) {
      const result = checkPrivacyCompliance(content);
      setCheckResult(result);
      // Auto-expand if there are high-severity issues
      if (result.issues.filter(i => i.severity === 'high').length > 0) {
        setIsExpanded(true);
      }
    }
  }, [content]);

  if (!checkResult) return null;

  const highIssues = checkResult.issues.filter(i => i.severity === 'high');
  const mediumIssues = checkResult.issues.filter(i => i.severity === 'medium');
  const lowIssues = checkResult.issues.filter(i => i.severity === 'low');

  return (
    <div className={`privacy-checker ${!checkResult.isCompliant ? 'non-compliant' : ''}`}>
      <div className="privacy-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="privacy-status">
          {checkResult.isCompliant ? (
            <>
              <span className="status-icon compliant">✓</span>
              <span>Privacy Compliant</span>
            </>
          ) : (
            <>
              <span className="status-icon non-compliant">⚠</span>
              <span>Privacy Issues Detected</span>
            </>
          )}
        </div>
        <div className="issue-summary">
          {highIssues.length > 0 && (
            <span className="issue-count high">{highIssues.length} High</span>
          )}
          {mediumIssues.length > 0 && (
            <span className="issue-count medium">{mediumIssues.length} Medium</span>
          )}
          {lowIssues.length > 0 && (
            <span className="issue-count low">{lowIssues.length} Low</span>
          )}
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="privacy-details">
          {highIssues.length > 0 && (
            <div className="issue-section">
              <h4 className="issue-heading high">High Priority Issues</h4>
              {highIssues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <p className="issue-description">{issue.description}</p>
                  <code className="issue-location">{issue.location}</code>
                </div>
              ))}
            </div>
          )}

          {mediumIssues.length > 0 && (
            <div className="issue-section">
              <h4 className="issue-heading medium">Medium Priority Issues</h4>
              {mediumIssues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <p className="issue-description">{issue.description}</p>
                  <code className="issue-location">{issue.location}</code>
                </div>
              ))}
            </div>
          )}

          {lowIssues.length > 0 && (
            <div className="issue-section">
              <h4 className="issue-heading low">Low Priority Issues</h4>
              {lowIssues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <p className="issue-description">{issue.description}</p>
                  <code className="issue-location">{issue.location}</code>
                </div>
              ))}
            </div>
          )}

          {checkResult.suggestions.length > 0 && (
            <div className="suggestions-section">
              <h4>Suggestions</h4>
              <ul>
                {checkResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};