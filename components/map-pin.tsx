export function MapPin({ active }: { active?: boolean }) {
  return (
    <svg
      width={active ? 36 : 28}
      height={active ? 44 : 34}
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `translate(-50%, -100%)`,
        transition: "all 0.2s ease",
        filter: active ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "none",
      }}
    >
      <path
        d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 20 14 20s14-9.5 14-20C28 6.268 21.732 0 14 0z"
        fill={active ? "#A84B2F" : "#C75B39"}
      />
      <circle cx="14" cy="13" r="5" fill="white" opacity="0.9" />
    </svg>
  );
}
