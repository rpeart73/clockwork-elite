import React, { useState } from 'react';
import { format } from 'date-fns';
import { POC_TEMPLATES } from '@/modules/poc-templates';
import { ONTARIO_QUICK_FILLS } from '@/modules/ontario-disability-templates';
import { PrivacyComplianceChecker } from './PrivacyComplianceChecker';
import './ManualPOCEditor.css';

interface ManualPOCEditorProps {
  selectedDate: Date;
  emailContent: string;
  studentName: string;
  onSave: (poc: ManualPOC) => void;
  onCancel: () => void;
  initialData?: Partial<ManualPOC>;
}

export interface ManualPOC {
  id?: string;
  date: string;
  purposeOfContact: string;
  clientReport: string;
  staffObservations: string;
  assessment: string;
  actionsTaken: string;
  nextSteps: string;
  category: string;
  duration: number;
  serviceType: string;
}

export const ManualPOCEditor: React.FC<ManualPOCEditorProps> = ({
  selectedDate,
  emailContent,
  studentName,
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<ManualPOC>({
    date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
    purposeOfContact: initialData?.purposeOfContact || '',
    clientReport: initialData?.clientReport || '',
    staffObservations: initialData?.staffObservations || '',
    assessment: initialData?.assessment || '',
    actionsTaken: initialData?.actionsTaken || '',
    nextSteps: initialData?.nextSteps || '',
    category: initialData?.category || 'direct-student-contact',
    duration: initialData?.duration || 60,
    serviceType: initialData?.serviceType || 'Email Support'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showQuickFills, setShowQuickFills] = useState<boolean>(false);

  const handleFieldChange = (field: keyof ManualPOC, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyTemplate = (templateId: string) => {
    const template = POC_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        purposeOfContact: fillPlaceholders(template.objective, studentName),
        clientReport: 'Student reported [specific details]. ' + 
                     fillPlaceholders(template.whatTranspired, studentName),
        staffObservations: 'Student appeared engaged and communicated clearly.',
        assessment: 'Current situation reflects [analysis].',
        actionsTaken: fillPlaceholders(template.whatTranspired, studentName),
        nextSteps: fillPlaceholders(template.outcomePlan, studentName)
      }));
    }
  };

  const fillPlaceholders = (text: string, name: string): string => {
    return text.replace(/{{studentName}}/g, name)
               .replace(/{{[^}]+}}/g, '[...]');
  };

  const insertQuickFill = (field: keyof ManualPOC, text: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]} ${text}` : text
    }));
  };

  const handleSave = () => {
    // Validate required fields
    const requiredFields: (keyof ManualPOC)[] = [
      'purposeOfContact', 'clientReport', 'staffObservations', 
      'assessment', 'actionsTaken', 'nextSteps'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please complete all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="manual-poc-editor">
      <div className="editor-layout">
        {/* Left side - Email content */}
        <div className="email-panel">
          <h3>Original Email</h3>
          <div className="email-content">
            <pre>{emailContent}</pre>
          </div>
        </div>

        {/* Right side - POC form */}
        <div className="form-panel">
          <div className="form-header">
            <h3>Manual POC Entry - {formData.date}</h3>
            <div className="form-controls">
              <select 
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                  }
                }}
              >
                <option value="">Select template (optional)</option>
                {POC_TEMPLATES.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              
              <button 
                onClick={() => setShowQuickFills(!showQuickFills)}
                className="quick-fill-toggle"
              >
                Quick Fills {showQuickFills ? '▼' : '▶'}
              </button>
            </div>
          </div>

          <div className="form-body">
            {/* Category and Duration */}
            <div className="form-row">
              <div className="form-group half">
                <label>Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                >
                  <option value="direct-student-contact">Direct Student Contact</option>
                  <option value="third-party-communication">Third-Party Communication</option>
                  <option value="internal-file-actions">Internal File Actions</option>
                  <option value="observation-based">Observation-Based</option>
                  <option value="administrative-contact">Administrative Contact</option>
                </select>
              </div>
              
              <div className="form-group half">
                <label>Duration (minutes)</label>
                <input 
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 0)}
                  min="5"
                  max="180"
                  step="5"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="form-group">
              <label>Service Type</label>
              <select 
                value={formData.serviceType}
                onChange={(e) => handleFieldChange('serviceType', e.target.value)}
              >
                <option value="Email Support">Email Support</option>
                <option value="Live Session">Live Session</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Chat Support">Chat Support</option>
                <option value="In-Person Meeting">In-Person Meeting</option>
              </select>
            </div>

            {/* 6 Required Sections */}
            <div className="form-section">
              <h4>1. Purpose of Contact</h4>
              <textarea
                value={formData.purposeOfContact}
                onChange={(e) => handleFieldChange('purposeOfContact', e.target.value)}
                placeholder="State the clear reason for the meeting or interaction..."
                rows={2}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  <button onClick={() => insertQuickFill('purposeOfContact', 'Student emailed to follow up on')}>
                    Follow-up
                  </button>
                  <button onClick={() => insertQuickFill('purposeOfContact', 'Student requested meeting regarding')}>
                    Meeting Request
                  </button>
                  <button onClick={() => insertQuickFill('purposeOfContact', 'Scheduled check-in to review')}>
                    Check-in
                  </button>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>2. Client Report (Subjective)</h4>
              <textarea
                value={formData.clientReport}
                onChange={(e) => handleFieldChange('clientReport', e.target.value)}
                placeholder="Summarize what the client shared - emotional state, concerns, or self-reports..."
                rows={3}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  {ONTARIO_QUICK_FILLS.stressLevels.map((level: string) => (
                    <button key={level} onClick={() => insertQuickFill('clientReport', `Student reported ${level}`)}>
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>3. Staff Observations (Objective)</h4>
              <textarea
                value={formData.staffObservations}
                onChange={(e) => handleFieldChange('staffObservations', e.target.value)}
                placeholder="Describe observations made during the interaction..."
                rows={3}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  {ONTARIO_QUICK_FILLS.emotionalStates.map((state: string) => (
                    <button key={state} onClick={() => insertQuickFill('staffObservations', `Student appeared ${state}`)}>
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>4. Assessment / Analysis</h4>
              <textarea
                value={formData.assessment}
                onChange={(e) => handleFieldChange('assessment', e.target.value)}
                placeholder="Provide brief professional insight or interpretation..."
                rows={3}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  {ONTARIO_QUICK_FILLS.assessmentFactors.slice(0, 3).map((factor: string) => (
                    <button key={factor} onClick={() => insertQuickFill('assessment', factor)}>
                      Assessment
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>5. Actions Taken / Intervention</h4>
              <textarea
                value={formData.actionsTaken}
                onChange={(e) => handleFieldChange('actionsTaken', e.target.value)}
                placeholder="Note any steps you took - information provided, accommodations reviewed..."
                rows={3}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  {ONTARIO_QUICK_FILLS.resources.slice(0, 3).map((resource: string) => (
                    <button key={resource} onClick={() => insertQuickFill('actionsTaken', `Reviewed ${resource}`)}>
                      {resource}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <h4>6. Plan / Next Steps</h4>
              <textarea
                value={formData.nextSteps}
                onChange={(e) => handleFieldChange('nextSteps', e.target.value)}
                placeholder="Summarize agreed-upon follow-up actions, timelines, or goals..."
                rows={3}
                required
              />
              {showQuickFills && (
                <div className="quick-fills">
                  {ONTARIO_QUICK_FILLS.clientActions.slice(0, 3).map((action: string) => (
                    <button key={action} onClick={() => insertQuickFill('nextSteps', `Student will ${action}`)}>
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Privacy Compliance Check */}
            <div className="form-section">
              <PrivacyComplianceChecker
                content={`${formData.purposeOfContact} ${formData.clientReport} ${formData.staffObservations} ${formData.assessment} ${formData.actionsTaken} ${formData.nextSteps}`}
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleSave} className="save-btn">
              Save POC
            </button>
            <button onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};