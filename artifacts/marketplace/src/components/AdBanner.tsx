interface AdBannerProps {
  type: "leaderboard" | "square";
  className?: string;
}

export default function AdBanner({ type, className = "" }: AdBannerProps) {
  if (type === "leaderboard") {
    return (
      <div
        className={`ad-placeholder w-full rounded-lg ${className}`}
        style={{ height: "90px", maxWidth: "728px" }}
      >
        <span className="font-medium tracking-widest text-muted-foreground/70">Publicidad</span>
      </div>
    );
  }
  return (
    <div
      className={`ad-placeholder rounded-lg w-full ${className}`}
      style={{ height: "250px", maxWidth: "300px" }}
    >
      <span className="font-medium tracking-widest text-muted-foreground/70">Publicidad</span>
    </div>
  );
}
