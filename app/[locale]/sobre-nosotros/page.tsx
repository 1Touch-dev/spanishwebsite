import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata() {
  return { title: 'Sobre nosotros' };
}

export default async function SobreNosotrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-fh max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold text-brand-navy">Sobre nosotros</h1>
      <p className="mt-4 leading-relaxed text-slate-600">
        FutHoy sigue la actualidad de FIFA World Cup 2026 con noticias, grupos, partidos en vivo,
        goleadores y analisis. Combinamos cobertura propia con enlaces a fuentes destacadas del
        futbol internacional en espanol.
      </p>
    </div>
  );
}
