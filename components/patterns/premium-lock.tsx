import Link from "next/link";

type PremiumLockProps = {
  title?: string;
};

export function PremiumLock({ title = "Premium section locked" }: PremiumLockProps) {
  return (
    <div className="locked-panel">
      <div>
        <strong>{title}</strong>
        <p style={{ color: "#6f4d14", lineHeight: 1.6, margin: "6px 0 0" }}>
          This advanced implementation content will unlock for Pro subscribers
          when auth and subscriptions are added in Phase 3.
        </p>
      </div>
      <div className="locked-preview">
        Formula, detailed build steps, common mistakes, and troubleshooting are
        intentionally gated here to demonstrate the premium pattern experience.
      </div>
      <Link className="button" href="/#pricing" style={{ justifySelf: "start" }}>
        Preview Pro plan
      </Link>
    </div>
  );
}
