import React from 'react';

interface UniformImageCardProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  height?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayClassName?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const UniformImageCard: React.FC<UniformImageCardProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
  className = '',
  containerClassName = '',
  height = 'h-48',
  children,
  overlay = false,
  overlayClassName = 'bg-gradient-to-t from-black/50 to-transparent',
  onError
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onError) {
      onError(e);
    } else {
      (e.target as HTMLImageElement).src = fallbackSrc;
    }
  };

  return (
    <div className={`relative overflow-hidden ${height} ${containerClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-300 ${className}`}
        onError={handleImageError}
        loading="lazy"
      />
      {overlay && (
        <div className={`absolute inset-0 ${overlayClassName}`}></div>
      )}
      {children && (
        <div className="absolute inset-0 flex items-end justify-start p-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Predefined card variants for common use cases
export const ServiceCard: React.FC<{
  title: string;
  description: string;
  image: string;
  icon?: React.ComponentType<any>;
  color?: string;
  link?: string;
}> = ({ title, description, image, icon: Icon, color = 'bg-blue-500', link }) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      <UniformImageCard
        src={image}
        alt={title}
        height="h-48"
        className="group-hover:scale-110"
        overlay={true}
        overlayClassName="bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"
      >
        {Icon && (
          <div className={`absolute top-4 left-4 ${color} w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
            <Icon className="w-6 h-6 text-white group-hover:animate-pulse" />
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors duration-300">
            {title}
          </h3>
        </div>
      </UniformImageCard>
      
      <div className="p-6 bg-gradient-to-br from-white to-purple-50/30 group-hover:from-cyan-50/50 group-hover:to-purple-50/30 transition-all duration-500">
        <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
        {link && (
          <a 
            href={link}
            className="inline-flex items-center gap-2 text-cyan-600 font-medium hover:text-purple-600 group-hover:gap-3 transition-all duration-300"
          >
            Learn More
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export const DepartmentCard: React.FC<{
  name: string;
  image: string;
  icon?: React.ComponentType<any>;
  color?: string;
}> = ({ name, image, icon: Icon, color = 'bg-teal-600' }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-105">
        <UniformImageCard
          src={image}
          alt={name}
          height="h-48"
          className="group-hover:scale-125"
          overlay={true}
          overlayClassName="bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500"
        >
          {Icon && (
            <div className={`absolute top-4 right-4 ${color} w-10 h-10 rounded-full flex items-center justify-center opacity-90 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
              <Icon className="w-5 h-5 text-white group-hover:animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-purple-400/0 group-hover:from-cyan-400/20 group-hover:to-purple-400/20 transition-all duration-500"></div>
        </UniformImageCard>
        
        <div className="p-4 bg-gradient-to-br from-white to-purple-50/50 group-hover:from-cyan-50/50 group-hover:to-purple-50/30 transition-all duration-500">
          <h3 className="font-bold text-gray-800 text-center group-hover:text-cyan-600 transition-colors duration-300 group-hover:scale-105 transform">
            {name}
          </h3>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/0 to-purple-600/0 group-hover:from-cyan-600/10 group-hover:to-purple-600/10 transition-all duration-500 rounded-xl"></div>
      </div>
    </div>
  );
};

export const DoctorCard: React.FC<{
  name: string;
  specialty: string;
  image: string;
  experience: string;
  description: string;
  link?: string;
}> = ({ name, specialty, image, experience, description, link }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
      <UniformImageCard
        src={image}
        alt={name}
        height="h-64"
        className="group-hover:scale-105"
        overlay={true}
        overlayClassName="bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
        <p className="text-cyan-600 font-medium mb-2">{specialty}</p>
        <p className="text-sm text-gray-500 mb-3">{experience} Experience</p>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
        {link && (
          <a 
            href={link}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium text-center inline-block transform hover:scale-105"
          >
            Book Appointment
          </a>
        )}
      </div>
    </div>
  );
};

export const TestimonialCard: React.FC<{
  name: string;
  image: string;
  testimonial: string;
  rating?: number;
}> = ({ name, image, testimonial, rating = 5 }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-4">
        <UniformImageCard
          src={image}
          alt={name}
          height="h-16"
          containerClassName="w-16 rounded-full overflow-hidden flex-shrink-0"
          className="group-hover:scale-110"
        />
        <div>
          <h4 className="font-bold text-gray-800 group-hover:text-cyan-600 transition-colors duration-300">{name}</h4>
          <div className="flex gap-1 mt-1">
            {[...Array(rating)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 italic leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
        "{testimonial}"
      </p>
    </div>
  );
};

// CSS utility classes for consistent image handling
export const imageCardStyles = {
  // Fixed height containers
  container: {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
    xlarge: 'h-80',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  },
  
  // Image object-fit styles
  image: {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    scaleDown: 'object-scale-down',
    none: 'object-none'
  },
  
  // Position classes for object-position
  position: {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
    topLeft: 'object-left-top',
    topRight: 'object-right-top',
    bottomLeft: 'object-left-bottom',
    bottomRight: 'object-right-bottom'
  },
  
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-300',
    scaleUp: 'hover:scale-110 transition-transform duration-300',
    scaleDown: 'hover:scale-95 transition-transform duration-300',
    rotate: 'hover:rotate-3 transition-transform duration-300',
    brightness: 'hover:brightness-110 transition-all duration-300',
    blur: 'hover:blur-sm transition-all duration-300'
  }
};

export default UniformImageCard;