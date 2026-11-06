import { CatalogView } from "@/components/catalog-view";

interface CatalogPageProps {
  searchParams: Promise<{ q?: string }>;
}

const CatalogPage = async ({
  searchParams,
}: CatalogPageProps) => {
  const { q = "" } = await searchParams;

  return <CatalogView initialQuery={q} />;
};

export default CatalogPage;
