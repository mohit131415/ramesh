export default function PageHeader({ title, description, className = "", children }) {
    return (
      <section className={`bg-cream py-12 mb-8 relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-pattern opacity-5 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
            {children}
          </div>
        </div>
      </section>
    )
  }
  