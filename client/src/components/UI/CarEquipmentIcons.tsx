import React from 'react';

interface CarEquipmentIconsProps {
  carEquipment: string[];
  variant?: 'compact' | 'detailed';
}

export const CarEquipmentIcons = ({ carEquipment, variant = 'compact' }: CarEquipmentIconsProps) => {
  const equipmentData = [
    { 
      key: 'Jantes aluminium', 
      shortKey: 'Jantes',
      included: carEquipment.includes('Jantes alliage') || carEquipment.includes('Jantes aluminium'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="4" fill="currentColor"/>
          <path d="M24 8 L28 16 L24 20 L20 16 Z" fill="currentColor"/>
          <path d="M40 24 L32 28 L28 24 L32 20 Z" fill="currentColor"/>
          <path d="M24 40 L20 32 L24 28 L28 32 Z" fill="currentColor"/>
          <path d="M8 24 L16 20 L20 24 L16 28 Z" fill="currentColor"/>
          <path d="M35.5 12.5 L31 19 L28 16 L32.5 9.5 Z" fill="currentColor"/>
          <path d="M35.5 35.5 L32.5 38.5 L28 32 L31 29 Z" fill="currentColor"/>
          <path d="M12.5 35.5 L9.5 32.5 L16 28 L19 31 Z" fill="currentColor"/>
          <path d="M12.5 12.5 L15.5 9.5 L20 16 L17 19 Z" fill="currentColor"/>
        </svg>
      )
    },
    { 
      key: 'ABS', 
      shortKey: 'ABS',
      included: carEquipment.includes('ABS'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none"/>
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
        </svg>
      )
    },
    { 
      key: 'Direction assistée', 
      shortKey: 'Direction',
      included: carEquipment.includes('Direction assistée'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none"/>
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
          <path d="M24 6 L24 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 36 L24 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M6 24 L12 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <path d="M36 24 L42 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      key: 'Climatisation', 
      shortKey: 'Clim',
      included: carEquipment.includes('Climatisation'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <circle cx="24" cy="24" r="3" fill="currentColor"/>
          <path d="M24 8 L24 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 32 L24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 24 L16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M32 24 L40 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 12 L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M30 30 L36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M36 12 L30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 30 L12 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      key: 'Vitres électriques', 
      shortKey: 'Vitres élec',
      included: carEquipment.includes('Vitres électriques') || carEquipment.includes('Electric windows'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <rect x="8" y="12" width="32" height="24" stroke="currentColor" strokeWidth="2" fill="none" rx="2"/>
          <path d="M12 16 L36 16" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 32 L36 32" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 20 L20 28" stroke="currentColor" strokeWidth="2"/>
          <path d="M28 20 L28 28" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 22 L18 24 L16 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M32 22 L30 24 L32 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      key: 'Fermeture centrale', 
      shortKey: 'Fermeture',
      included: carEquipment.includes('Fermeture centrale') || carEquipment.includes('Central locking'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <rect x="16" y="20" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" rx="2"/>
          <path d="M20 20 L20 16 C20 13 21.5 12 24 12 C26.5 12 28 13 28 16 L28 20" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="24" cy="28" r="2" fill="currentColor"/>
          <path d="M24 30 L24 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      key: 'Airbags', 
      shortKey: 'Airbags',
      included: carEquipment.includes('Airbags'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <circle cx="24" cy="26" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M10 26 C10 26 14 22 18 22 C22 22 24 24 24 24 C24 24 26 22 30 22 C34 22 38 26 38 26" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="20" cy="20" r="2" fill="currentColor"/>
          <circle cx="28" cy="20" r="2" fill="currentColor"/>
        </svg>
      )
    },
    { 
      key: 'Toit ouvrant', 
      shortKey: 'Toit ouvrant',
      included: carEquipment.includes('Toit ouvrant'),
      icon: (
        <svg width={variant === 'compact' ? 16 : 32} height={variant === 'compact' ? 16 : 32} viewBox="0 0 48 48" fill="none" className="mx-auto">
          <rect x="8" y="20" width="32" height="16" stroke="currentColor" strokeWidth="2" fill="none" rx="2"/>
          <path d="M16 20 L16 12 L32 12 L32 20" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M20 16 L28 16" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 24 L36 24" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 28 L36 28" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 32 L36 32" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const availableEquipment = equipmentData.filter(eq => eq.included);
  
  if (availableEquipment.length === 0) return null;

  if (variant === 'compact') {
    // Version compacte pour ProductCard
    return (
      <div className="flex gap-1 flex-wrap">
        {availableEquipment.slice(0, 3).map((equipment, index) => (
          <div key={index} className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded text-xs">
            <div className="text-gray-600">{equipment.icon}</div>
            <span className="text-gray-700 font-medium">{equipment.shortKey}</span>
          </div>
        ))}
        {availableEquipment.length > 3 && (
          <div className="flex items-center bg-gray-100 px-1 py-0.5 rounded text-xs">
            <span className="text-gray-700 font-medium">+{availableEquipment.length - 3}</span>
          </div>
        )}
      </div>
    );
  }

  // Version détaillée pour ProductDetail
  return (
    <div className="grid grid-cols-4 gap-3">
      {equipmentData.map((item, index) => (
        <div key={index} className="text-center">
          <div className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center mb-2 mx-auto ${
            item.included ? 'border-gray-300 text-gray-700' : 'border-gray-200 text-gray-400'
          }`}>
            {item.icon}
          </div>
          <div className="text-xs text-gray-700 font-medium leading-tight whitespace-pre-line">
            {item.key.replace(' ', '\n')}
          </div>
        </div>
      ))}
    </div>
  );
};