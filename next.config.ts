import type { NextConfig } from "next";

// Pages that were removed. Each old address forwards to the closest page that still exists.
const retiredRoutes: Array<[string, string]> = [
  ["/dashboard", "/patterns"],
  ["/favorites", "/patterns"],
  ["/reports", "/pmo/communications-and-reporting"],
  ["/reports/new", "/pmo/communications-and-reporting"],
  ["/pmo/adoption", "/pmo"],
  ["/pmo/backlog", "/pmo"],
  ["/pmo/cadence", "/pmo"],
  ["/pmo/communications", "/pmo/communications-and-reporting"],
  ["/pmo/escalations", "/pmo/change-risk-issue-control"],
  ["/pmo/kpis", "/pmo/communications-and-reporting"],
  ["/pmo/release", "/pmo/roadmap"],
  ["/pmo/runbook", "/pmo"],
  ["/pmo/uat", "/pmo/roadmap"]
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return retiredRoutes.map(([source, destination]) => ({ source, destination, permanent: true }));
  }
};

export default nextConfig;
