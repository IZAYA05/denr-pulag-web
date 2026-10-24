import BookPackage from "@/components/user/packages/BookPackage";

type BookingPageProps = {
  searchParams: Promise<{
    packageId?: string;
  }>;
};

export default async function BookingPage({
  searchParams,
}: BookingPageProps) {
  const params = await searchParams;

  return (
    <BookPackage initialPackageId={params.packageId ?? ""} />
  );
}
