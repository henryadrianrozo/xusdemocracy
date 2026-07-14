export default function Wordmark({ href = '/' }) {
  const inner = (
    <>
      <span className="wm-x">X</span>
      <span className="wm-us">Us</span>
      <span className="wm-democracy">Democracy</span>
    </>
  );
  return href ? (
    <a href={href} className="wordmark">{inner}</a>
  ) : (
    <span className="wordmark">{inner}</span>
  );
}
