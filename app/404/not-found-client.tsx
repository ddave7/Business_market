export default function NotFoundClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-4">
        <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Return Home
        </a>
        <a
          href="/products"
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          Browse Products
        </a>
      </div>
    </div>
  )
}
