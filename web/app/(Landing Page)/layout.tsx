import AuthSessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionProvider>
      <Navbar />

      {children}

      <Footer />
    </AuthSessionProvider>
  );
}