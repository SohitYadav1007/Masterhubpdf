import Link from 'next/link';
import ToolLayout from '../components/ToolLayout';
export default function NotFound() {
  return (
    <ToolLayout title="Page Not Found">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="text-8xl font-black text-primary-100 mb-4 select-none">404</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-sm">This page doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary px-8 py-3">← Back to Home</Link>
      </div>
    </ToolLayout>
  );
}
