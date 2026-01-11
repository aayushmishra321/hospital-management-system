import React from 'react';
import { 
  Shield, 
  Stethoscope, 
  Heart, 
  UserCheck, 
  Loader2
} from 'lucide-react';
import '../../styles/animations.css';

interface PremiumLoaderProps {
  role?: 'admin' | 'doctor' | 'patient' | 'receptionist';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pulse' | 'spin' | 'medical' | 'dots';
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  role = 'patient',
  message,
  size = 'md',
  variant = 'medical'
}) => {
  const roleConfigs = {
    admin: {
      icon: Shield,
      color: 'from-slate-600 to-blue-700',
      bgColor: 'bg-blue-600',
      message: 'Loading admin dashboard...',
      accent: 'text-blue-400'
    },
    doctor: {
      icon: Stethoscope,
      color: 'from-cyan-500 to-teal-600',
      bgColor: 'bg-cyan-600',
      message: 'Preparing medical interface...',
      accent: 'text-cyan-400'
    },
    patient: {
      icon: Heart,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-600',
      message: 'Loading your health portal...',
      accent: 'text-blue-400'
    },
    receptionist: {
      icon: UserCheck,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-600',
      message: 'Setting up front desk...',
      accent: 'text-purple-400'
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const config = roleConfigs[role];
  const Icon = config.icon;
  const displayMessage = message || config.message;

  // Pulse Loader
  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center loading-pulse shadow-lg`}>
          <Icon className="w-1/2 h-1/2 text-white" />
        </div>
        {displayMessage && (
          <p className={`mt-4 text-sm ${config.accent} font-medium animate-pulse`}>
            {displayMessage}
          </p>
        )}
      </div>
    );
  }

  // Spinning Loader
  if (variant === 'spin') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-transparent animate-spin`}></div>
          <div className={`absolute inset-2 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
            <Icon className="w-1/2 h-1/2 text-white" />
          </div>
        </div>
        {displayMessage && (
          <p className={`mt-4 text-sm ${config.accent} font-medium`}>
            {displayMessage}
          </p>
        )}
      </div>
    );
  }

  // Medical Loader (Advanced)
  if (variant === 'medical') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Outer Ring */}
          <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent bg-gradient-to-r ${config.color} animate-spin`} 
               style={{ animationDuration: '3s' }}>
            <div className="w-full h-full rounded-full border-4 border-white/20"></div>
          </div>
          
          {/* Inner Ring */}
          <div className={`absolute inset-2 rounded-full border-2 border-transparent bg-gradient-to-l ${config.color} animate-spin`}
               style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
            <div className="w-full h-full rounded-full border-2 border-white/30"></div>
          </div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center loading-medical shadow-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Pulse Effect */}
          <div className={`absolute inset-0 rounded-full ${config.bgColor} opacity-20 animate-ping`}></div>
        </div>
        
        {displayMessage && (
          <div className="mt-6 text-center">
            <p className={`text-sm ${config.accent} font-medium mb-2`}>
              {displayMessage}
            </p>
            <div className="flex justify-center">
              <div className="loading-dots">
                <div className={`loading-dot ${config.bgColor}`}></div>
                <div className={`loading-dot ${config.bgColor}`}></div>
                <div className={`loading-dot ${config.bgColor}`}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dots Loader
  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-1/2 h-1/2 text-white" />
          </div>
          <div className="loading-dots">
            <div className={`loading-dot ${config.bgColor}`}></div>
            <div className={`loading-dot ${config.bgColor}`}></div>
            <div className={`loading-dot ${config.bgColor}`}></div>
          </div>
        </div>
        {displayMessage && (
          <p className={`text-sm ${config.accent} font-medium`}>
            {displayMessage}
          </p>
        )}
      </div>
    );
  }

  return null;
};

// Full Screen Loader
export const FullScreenLoader: React.FC<PremiumLoaderProps> = (props) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center">
        <PremiumLoader {...props} size="lg" variant="medical" />
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-2">
            {props.role ? `${props.role.charAt(0).toUpperCase() + props.role.slice(1)} Portal` : 'Healthcare System'}
          </h3>
          <p className="text-white/70 text-sm">
            Preparing your personalized experience...
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline Loader for Components
export const InlineLoader: React.FC<{ role?: string; message?: string }> = ({ 
  role = 'patient', 
  message = 'Loading...' 
}) => {
  const roleColors = {
    admin: 'text-blue-600',
    doctor: 'text-cyan-600',
    patient: 'text-blue-600',
    receptionist: 'text-purple-600'
  };

  return (
    <div className="flex items-center justify-center gap-3 p-4">
      <Loader2 className={`w-5 h-5 animate-spin ${roleColors[role] || 'text-blue-600'}`} />
      <span className={`text-sm font-medium ${roleColors[role] || 'text-blue-600'}`}>
        {message}
      </span>
    </div>
  );
};

// Button Loader
export const ButtonLoader: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode; 
  className?: string;
}> = ({ loading, children, className = '' }) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="loading-dots">
          <div className="loading-dot bg-current opacity-60"></div>
          <div className="loading-dot bg-current opacity-80"></div>
          <div className="loading-dot bg-current"></div>
        </div>
        <span>Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};

// Card Skeleton Loader
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass-card p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
            <div className="h-3 bg-white/10 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PremiumLoader;