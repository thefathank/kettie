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
      {/* Abstract geometric mark — angular P³ monogram */}
      <rect x="8" y="8" width="84" height="84" rx="20" fill="rgba(16,185,129,0.12)" />
      
      {/* Stylized P shape */}
      <path
        d="M30 78V22h20c12 0 22 8 22 18s-10 18-22 18H42"
        stroke="hsl(160, 84%, 39%)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Superscript ³ */}
      <text
        x="72"
        y="32"
        fill="hsl(160, 84%, 39%)"
        fontSize="20"
        fontWeight="700"
        fontFamily="Satoshi, sans-serif"
      >
        ³
      </text>

      {/* Accent dot */}
      <circle cx="30" cy="78" r="4" fill="hsl(160, 84%, 39%)" />
    </svg>
  );
};
