import React from 'react';

const RulesList = ({ rules, selectedRules, onRuleToggle }) => {
  return (
    <div className="rules-list">
      {rules.length === 0 ? (
        <p className="no-rules">No rules found in the specified directory.</p>
      ) : (
        <ul>
          {rules.map(rule => (
            <li key={rule.id} className="rule-item">
              <div className="rule-checkbox">
                <input
                  type="checkbox"
                  id={`rule-${rule.id}`}
                  checked={selectedRules.includes(rule.id)}
                  onChange={() => onRuleToggle(rule.id)}
                />
                <label htmlFor={`rule-${rule.id}`} className="rule-name">{rule.name}</label>
              </div>
              <p className="rule-description">{rule.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RulesList;