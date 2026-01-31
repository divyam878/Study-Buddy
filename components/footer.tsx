export function Footer() {
  return (
    <footer className="w-full border-t py-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between px-6 gap-4 md:h-16 md:flex-row md:py-0 text-center md:text-left">
        <p className="text-sm text-muted-foreground leading-loose">
          Built by <span className="font-semibold text-foreground">Divyam Goyal</span>.
          Assignment for <span className="font-semibold text-foreground">House of EdTech</span>.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/divyam878"
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/divyamgoyalfullstack"
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
