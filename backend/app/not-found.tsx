export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <p>Page Not Found</p>
        <a href="/" style={{ color: '#0070f3' }}>Go Home</a>
      </div>
    </div>
  );
}