import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle touch events for mobile
  const handleTouch = () => {
    setShowTooltip(true);
    // Hide tooltip after a delay
    setTimeout(() => setShowTooltip(false), 1500);
  };

  return (
    <div 
      className={`tooltip ${className || ''}`}
      onTouchStart={handleTouch}
    >
      {children}
      <span className={`tooltip-text ${showTooltip ? 'visible opacity-100' : ''}`}>
        {text}
      </span>
    </div>
  );
};

export default Tooltip; 