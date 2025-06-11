// src/components/ui/Tabs.jsx
import React, { useState } from 'react';

export const Tabs = ({ children, defaultIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  return (
    <div className="tabs-container">
      {React.Children.map(children, (child) => {
        if (child.type.displayName === 'TabList') {
          return React.cloneElement(child, {
            activeIndex,
            setActiveIndex
          });
        } else if (child.type.displayName === 'TabPanels') {
          return React.cloneElement(child, {
            activeIndex
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabList = ({ children, activeIndex, setActiveIndex }) => {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #E2E8F0',
      marginBottom: '16px'
    }}>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          isActive: index === activeIndex,
          onClick: () => setActiveIndex(index)
        });
      })}
    </div>
  );
};

TabList.displayName = 'TabList';

export const Tab = ({ children, isActive, onClick }) => {
  return (
    <button
      style={{
        padding: '10px 16px',
        borderBottom: isActive ? '2px solid #3182CE' : 'none',
        backgroundColor: 'transparent',
        border: 'none',
        marginBottom: '-1px',
        color: isActive ? '#3182CE' : '#4A5568',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabPanels = ({ children, activeIndex }) => {
  return (
    <div>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          isActive: index === activeIndex
        });
      })}
    </div>
  );
};

TabPanels.displayName = 'TabPanels';

export const TabPanel = ({ children, isActive }) => {
  if (!isActive) return null;
  
  return (
    <div>
      {children}
    </div>
  );
};
