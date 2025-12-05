import * as React from "react";

export const WizardsHat = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* tapered cone */}
    <path d="M12 2c-2 3.5-3.5 7-4.5 11.5-.3 1.4-.5 2.5-.6 3.5h10.2c-.1-1-.3-2.1-.6-3.5C15.5 9 14 5.5 12 2z" />

    {/* wider curved brim - top */}
    <path d="M2 18c2.5-1 5.5-1.5 10-1.5s7.5.5 10 1.5" />

    {/* brim underside */}
    <path d="M2 18c2.5 1.2 5.5 2 10 2s7.5-.8 10-2" />

    {/* sparkles floating outside the hat */}
    <circle cx="4" cy="8" r="0.7" />
    <circle cx="20" cy="6" r="0.7" />
    <circle cx="19" cy="12" r="0.5" />
    <circle cx="3" cy="14" r="0.5" />
  </svg>
);
