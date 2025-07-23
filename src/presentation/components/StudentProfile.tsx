import React, { useState } from 'react';
import { format } from 'date-fns';
import './StudentProfile.css';

export interface StudentProfileData {
  id?: string;
  name: string;
  email: string;
  alternateEmails?: string[];
  program?: string;
  year?: string;
  accommodations?: string[];
  tags?: string[];
  runningNotes?: string;
  lastContactDate?: Date;
  totalInteractions?: number;
  preferredContactMethod?: string;
  importantDates?: { date: Date; description: string }[];
}

interface StudentProfileProps {
  student: StudentProfileData;
  onUpdate?: (updates: Partial<StudentProfileData>) => void;
  onAddNote?: (note: string) => void;
  readOnly?: boolean;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onUpdate,
  onAddNote,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<StudentProfileData>(student);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(student);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
      const noteWithTimestamp = `[${timestamp}] ${newNote.trim()}`;
      
      onAddNote(noteWithTimestamp);
      setNewNote('');
      
      // Also update running notes locally
      const currentNotes = editedData.runningNotes || '';
      const updatedNotes = currentNotes 
        ? `${currentNotes}\n\n${noteWithTimestamp}`
        : noteWithTimestamp;
      
      setEditedData({ ...editedData, runningNotes: updatedNotes });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const currentTags = editedData.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        setEditedData({
          ...editedData,
          tags: [...currentTags, newTag.trim()]
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedData({
      ...editedData,
      tags: (editedData.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const getNotesPreview = (notes: string | undefined) => {
    if (!notes) return 'No notes recorded yet.';
    const lines = notes.split('\n');
    const preview = lines.slice(-3).join('\n');
    return preview;
  };

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="profile-title">
          <h2>{student.name}</h2>
          <span className="profile-email">{student.email}</span>
        </div>
        {!readOnly && (
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-save" onClick={handleSave}>Save</button>
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">Total Interactions</span>
          <span className="stat-value">{student.totalInteractions || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last Contact</span>
          <span className="stat-value">
            {student.lastContactDate 
              ? format(student.lastContactDate, 'MMM d, yyyy')
              : 'No contact yet'
            }
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Program</span>
          <span className="stat-value">{student.program || 'Not specified'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Year</span>
          <span className="stat-value">{student.year || 'Not specified'}</span>
        </div>
      </div>

      <div className="profile-section">
        <h3>Contact Information</h3>
        {isEditing ? (
          <div className="edit-form">
            <label>
              Primary Email
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
              />
            </label>
            <label>
              Preferred Contact Method
              <select
                value={editedData.preferredContactMethod || 'email'}
                onChange={(e) => setEditedData({ ...editedData, preferredContactMethod: e.target.value })}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="in-person">In-Person</option>
                <option value="video">Video Call</option>
              </select>
            </label>
          </div>
        ) : (
          <div className="info-display">
            <p><strong>Primary:</strong> {student.email}</p>
            {student.alternateEmails && student.alternateEmails.length > 0 && (
              <p><strong>Alternate:</strong> {student.alternateEmails.join(', ')}</p>
            )}
            <p><strong>Preferred Method:</strong> {student.preferredContactMethod || 'Email'}</p>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3>Academic Information</h3>
        {isEditing ? (
          <div className="edit-form">
            <label>
              Program
              <input
                type="text"
                value={editedData.program || ''}
                onChange={(e) => setEditedData({ ...editedData, program: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </label>
            <label>
              Year
              <input
                type="text"
                value={editedData.year || ''}
                onChange={(e) => setEditedData({ ...editedData, year: e.target.value })}
                placeholder="e.g., 3rd Year"
              />
            </label>
          </div>
        ) : (
          <div className="info-display">
            <p><strong>Program:</strong> {student.program || 'Not specified'}</p>
            <p><strong>Year:</strong> {student.year || 'Not specified'}</p>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3>Accommodations</h3>
        {student.accommodations && student.accommodations.length > 0 ? (
          <ul className="accommodations-list">
            {student.accommodations.map((acc, index) => (
              <li key={index}>{acc}</li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No accommodations recorded</p>
        )}
      </div>

      <div className="profile-section">
        <h3>Tags</h3>
        <div className="tags-container">
          {(editedData.tags || []).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              {isEditing && (
                <button 
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {isEditing && (
            <div className="tag-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
              />
              <button onClick={handleAddTag}>+</button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <h3>Running Notes</h3>
          {!readOnly && (
            <button 
              className="btn-toggle"
              onClick={() => setShowAllNotes(!showAllNotes)}
            >
              {showAllNotes ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>
        
        <div className="notes-display">
          <pre>{showAllNotes ? student.runningNotes : getNotesPreview(student.runningNotes)}</pre>
        </div>
        
        {!readOnly && (
          <div className="add-note">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              rows={3}
            />
            <button 
              className="btn-add-note"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              Add Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};