export function TagBadge({
  name,
  active,
  onClick,
}: {
  name: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const isButton = !!onClick;
  const Component = isButton ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-olive text-white"
          : "bg-olive-light/30 text-olive-dark hover:bg-olive-light/50"
      } ${isButton ? "cursor-pointer" : ""}`}
    >
      {name}
    </Component>
  );
}
