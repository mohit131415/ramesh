export default function SectionHeader({ title, description, className = "" }) {
    return (
      <div className={`mb-8 ${className}`}>
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    )
  }
  