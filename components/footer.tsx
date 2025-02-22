export function Footer() {
  return (
    <footer className="border-t bg-background py-6 mt-auto">
      <div className="container flex flex-col items-center justify-center text-sm text-muted-foreground">
        <p className="mb-2">Need help? Contact our customer support team</p>
        <a 
          href="mailto:customerservice@flavorjournal.com"
          className="text-green-400 hover:text-green-300"
        >
          customerservice@flavorjournal.com
        </a>
        <p className="mt-4">© {new Date().getFullYear()} Flavor Journal. All rights reserved.</p>
      </div>
    </footer>
  )
} 