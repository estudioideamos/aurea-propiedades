type InternalHeroProps = {
  section: string;
  label: string;
  eyebrow: string;
  title: [string, string];
  description: string;
  metric: string;
  metricLabel: string;
};

export function InternalHero({ section, label, eyebrow, title, description, metric, metricLabel }: InternalHeroProps) {
  return <section className="internal-page-hero"><div className="internal-hero-top"><div className="internal-hero-label"><b>{section}</b><span>{label}</span></div><p>{eyebrow}</p></div><div className="internal-hero-main"><div><h1><span>{title[0]}</span><span>{title[1]}</span></h1><p>{description}</p></div><div className="internal-hero-metric"><b>{metric}</b><span>{metricLabel}</span></div></div></section>;
}