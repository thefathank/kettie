interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  };

  const { width, height } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hexagon background */}
      <polygon
        points="50,2 93,27 93,73 50,98 7,73 7,27"
        fill="hsl(160 84% 39%)"
      />
      
      {/* Inner circle - lighter green */}
      <circle cx="50" cy="50" r="32" fill="hsl(150 60% 65%)" />
      
      {/* Tennis ball seams */}
      <g stroke="hsl(160 90% 20%)" strokeWidth="4" strokeLinecap="round" fill="none">
        {/* Left curve */}
        <path d="M 28 35 Q 38 50 28 65" />
        {/* Right curve */}
        <path d="M 72 35 Q 62 50 72 65" />
      </g>
    </svg>
  );
};
