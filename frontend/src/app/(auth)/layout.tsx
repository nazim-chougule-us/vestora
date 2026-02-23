/**
 * Vestora Frontend — Auth layout (no sidebar/topbar).
 * Used for login and register pages.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      {children}
    </div>
  );
}
