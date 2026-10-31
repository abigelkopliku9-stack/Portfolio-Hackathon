export default function BrandMark({ size = 34 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true" className="myfolio-mark"><rect width="36" height="36" rx="10" fill="currentColor" /><path d="M9 25V12l9 8 9-8v13" stroke="#f4f2de" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M25 7h4v4" stroke="#d8ad7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
