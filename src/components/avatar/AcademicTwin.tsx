import React from 'react';
import { Gender, AvatarConfig } from '../../types';

const ASSETS = {
  female: {
    welcome: '/src/assets/images/clay_student_female_1791657317601.jpg',
    holding_sign: '/src/assets/images/female_holding_sign_1791662437175.jpg',
    studying: '/src/assets/images/female_studying_1791662458205.jpg',
  },
  male: {
    welcome: '/src/assets/images/clay_student_male_1791657329638.jpg',
    holding_sign: '/src/assets/images/male_holding_sign_1791662448013.jpg',
    studying: '/src/assets/images/male_studying_1791662469398.jpg',
  },
};

export type CharacterPose = 'welcome' | 'holding_sign' | 'studying' | 'celebrating' | 'rescue' | 'encouraging';

interface AcademicTwinProps {
  gender?: Gender;
  avatar?: AvatarConfig;
  pose?: CharacterPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean; // For continuous subtle study loop
  showBadge?: boolean;
  onClick?: () => void;
}

export const AcademicTwin: React.FC<AcademicTwinProps> = ({
  gender: propGender,
  avatar,
  pose = 'welcome',
  size = 'md',
  className = '',
  isAnimated = false,
  showBadge = false,
  onClick,
}) => {
  const gender = avatar?.gender || propGender || 'female';
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32 md:w-36 md:h-36',
    xl: 'w-64 h-64 md:w-72 md:h-72',
  }[size];

  // Select appropriate image asset based on gender and pose
  const charAssets = gender === 'female' ? ASSETS.female : ASSETS.male;
  let imageSrc = charAssets.welcome;

  if (pose === 'holding_sign') {
    imageSrc = charAssets.holding_sign;
  } else if (pose === 'studying' || pose === 'focus' as any) {
    imageSrc = charAssets.studying;
  }

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`${sizeClasses} rounded-3xl overflow-hidden shadow-lg p-1 bg-gradient-to-b from-white/90 to-white/40 dark:from-gray-800/90 dark:to-gray-800/40 border-2 border-white/80 dark:border-gray-700/80 transition-transform ${
          isAnimated ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''
        }`}
      >
        <img
          src={imageSrc}
          alt={gender === 'female' ? 'UniRescue Female Student' : 'UniRescue Male Student'}
          className={`w-full h-full object-cover rounded-2xl ${
            isAnimated ? 'scale-[1.02] transition-transform duration-1000' : ''
          }`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Floating study / motivation indicator if active */}
      {pose === 'studying' && isAnimated && (
        <div className="absolute -top-1 -end-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs shadow-md animate-bounce">
          ✏️
        </div>
      )}
    </div>
  );
};
