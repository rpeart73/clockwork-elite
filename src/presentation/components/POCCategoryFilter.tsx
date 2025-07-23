import React from 'react';
import './POCCategoryFilter.css';

export type POCCategory = 
  | 'all'
  | 'direct-student-contact'
  | 'third-party-communication'
  | 'internal-file-actions'
  | 'observation-based'
  | 'administrative-contact';

interface POCCategoryFilterProps {
  selectedCategory: POCCategory;
  onCategoryChange: (category: POCCategory) => void;
}

const categoryLabels: Record<POCCategory, string> = {
  'all': 'All Categories',
  'direct-student-contact': 'Direct Student Contact',
  'third-party-communication': 'Third-Party Communication',
  'internal-file-actions': 'Internal File Actions',
  'observation-based': 'Observation-Based',
  'administrative-contact': 'Administrative Contact'
};

const categoryDescriptions: Record<POCCategory, string> = {
  'all': 'Show all points of contact',
  'direct-student-contact': 'Meetings, appointments, emails with students',
  'third-party-communication': 'Faculty, parents, or external professionals',
  'internal-file-actions': 'File reviews, documentation updates',
  'observation-based': 'Observing student in academic settings',
  'administrative-contact': 'Scheduling, confirmations, routine matters'
};

export const POCCategoryFilter: React.FC<POCCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="poc-category-filter">
      <h3>POC Category Filter</h3>
      <div className="category-options">
        {(Object.keys(categoryLabels) as POCCategory[]).map(category => (
          <label key={category} className="category-option">
            <input
              type="radio"
              name="poc-category"
              value={category}
              checked={selectedCategory === category}
              onChange={() => onCategoryChange(category)}
            />
            <div className="category-info">
              <span className="category-label">{categoryLabels[category]}</span>
              <span className="category-description">{categoryDescriptions[category]}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};