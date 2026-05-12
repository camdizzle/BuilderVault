import { SimplePage } from "@/components/layout/simple-page";

export const metadata = {
  title: "About | BuilderVault"
};

export default function AboutPage() {
  return (
    <SimplePage
      eyebrow="About"
      lead="BuilderVault is being shaped as a practical toolkit for people who build real Microsoft 365 and PMO solutions under real business constraints."
      title="Field-tested patterns, not generic tutorials."
    >
      <p>
        The product starts with a Power Apps, SharePoint, Power Automate, and PMO
        pattern library. The goal is to help makers and project teams move faster
        with copy-ready examples, implementation notes, and common pitfalls.
      </p>
      <p>
        The second product line is a status report generator for project managers
        and PMO teams. Before AI is integrated, the local preview demonstrates the
        report structure and workflow.
      </p>
    </SimplePage>
  );
}
