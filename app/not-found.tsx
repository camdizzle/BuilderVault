import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ padding: "72px 0" }}>
      <div className="container">
        <h1 className="page-title">Pattern not found.</h1>
        <p className="lead">That BuilderVault pattern is not in the static seed library.</p>
        <Link className="button" href="/patterns">
          Browse patterns
        </Link>
      </div>
    </section>
  );
}
