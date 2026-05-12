import { ReportGeneratorPreview } from "@/components/reports/report-generator-preview";

export const metadata = {
  title: "Status Report Preview | BuilderVault"
};

export default function NewReportPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
          <div className="eyebrow">Local report preview</div>
          <h1 className="page-title">Generate a structured status report preview.</h1>
          <p className="lead">
            Enter project status details and BuilderVault will format a local,
            deterministic report. This demonstrates the workflow before AI,
            account storage, or report history are added.
          </p>
        </div>
        <ReportGeneratorPreview />
      </div>
    </section>
  );
}
