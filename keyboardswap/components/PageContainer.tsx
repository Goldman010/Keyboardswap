type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
};

export function PageContainer({
  children,
  maxWidth = "max-w-6xl",
  className = "",
}: PageContainerProps) {
  return (
    <main className={`mx-auto px-6 py-10 ${maxWidth} ${className}`.trim()}>
      {children}
    </main>
  );
}
