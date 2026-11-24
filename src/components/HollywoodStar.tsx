import React from 'react';

export interface HollywoodStarProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  withCircle?: boolean;
}

/**
 * Estrella redondeada oficial del Club Heladería Hollywood.
 * 5 puntas suaves con esquinas redondeadas y relleno continuo, idéntica a la identidad visual de la marca.
 */
export const HollywoodStar: React.FC<HollywoodStarProps> = ({
  className = "w-3 h-3",
  size,
  withCircle = false,
  ...props
}) => {
  const starIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size, ...props.style } : props.style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  if (withCircle) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#fef8e7] flex items-center justify-center shrink-0 border border-amber-200/50 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="#e1a139"
          stroke="#e1a139"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    );
  }

  return starIcon;
};

export default HollywoodStar;
