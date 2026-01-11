import React from 'react';
import '../../styles/glassmorphism.css';
import '../../styles/animations.css';

interface PremiumCardProps {
  children: React.ReactNode;
  role?: 'admin' | 'doctor' | 'patient' | 'receptionist';
  className?: string;
  hover?: boolean;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'card-enter' | 'stagger-item';
  onClick?: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  role = 'patient',
  className = '',
  hover = true,
  animation = 'card-enter',
  onClick
}) => {
  const roleClasses = {
    admin: 'glass-card-admin',
    doctor: 'glass-card-doctor',
    patient: 'glass-card-patient',
    receptionist: 'glass-card-receptionist'
  };

  const baseClasses = `
    ${roleClasses[role]} 
    ${hover ? 'hover-lift' : ''} 
    ${animation} 
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Specialized card variants
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  role?: 'admin' | 'doctor' | 'patient' | 'receptionist';
  trend?: { value: number; isPositive: boolean };
}> = ({ title, value, icon: Icon, role = 'patient', trend }) => {
  const roleColors = {
    admin: 'text-blue-400',
    doctor: 'text-cyan-400',
    patient: 'text-blue-400',
    receptionist: 'text-purple-400'
  };

  return (
    <PremiumCard role={role} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center ${roleColors[role]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </PremiumCard>
  );
};

export const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  role?: 'admin' | 'doctor' | 'patient' | 'receptionist';
  onClick: () => void;
  buttonText?: string;
}> = ({ title, description, icon: Icon, role = 'patient', onClick, buttonText = 'Action' }) => {
  const roleColors = {
    admin: 'from-slate-600 to-blue-700',
    doctor: 'from-cyan-500 to-teal-600',
    patient: 'from-blue-500 to-purple-600',
    receptionist: 'from-purple-500 to-pink-600'
  };

  return (
    <PremiumCard role={role} className="p-6" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${roleColors[role]} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm mb-4">{description}</p>
          <button className={`glass-button-${role} btn-hover-lift text-sm px-4 py-2`}>
            {buttonText}
          </button>
        </div>
      </div>
    </PremiumCard>
  );
};

export const ListCard: React.FC<{
  title: string;
  items: Array<{ id: string; label: string; value?: string; status?: string }>;
  role?: 'admin' | 'doctor' | 'patient' | 'receptionist';
  onItemClick?: (id: string) => void;
}> = ({ title, items, role = 'patient', onItemClick }) => {
  return (
    <PremiumCard role={role} className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${
              onItemClick ? 'cursor-pointer' : ''
            } stagger-item`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onItemClick?.(item.id)}
          >
            <span className="text-white/90 text-sm">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-white/70 text-sm">{item.value}</span>
              )}
              {item.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
};

export default PremiumCard;