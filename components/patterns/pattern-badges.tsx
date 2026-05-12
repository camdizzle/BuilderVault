import { Badge } from "@/components/ui/badge";
import type { Pattern } from "@/types/pattern";

type PatternBadgesProps = {
  pattern: Pattern;
};

export function PatternBadges({ pattern }: PatternBadgesProps) {
  return (
    <div className="badge-row">
      <Badge tone={pattern.isPremium ? "premium" : "free"}>
        {pattern.isPremium ? "Premium" : "Free"}
      </Badge>
      <Badge tone="difficulty">{pattern.difficulty}</Badge>
      <Badge>{pattern.category}</Badge>
      {pattern.platform.map((platform) => (
        <Badge key={platform}>{platform}</Badge>
      ))}
    </div>
  );
}
