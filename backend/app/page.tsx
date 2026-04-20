export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>InboxFlow AI Backend</h1>
      <p>Running Next.js {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0,7) || "local"}</p>
    </div>
  );
}