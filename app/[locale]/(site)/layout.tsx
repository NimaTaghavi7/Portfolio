import Preloader from "@/components/Preloader";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import ScrollProgress from "@/components/site/ScrollProgress";
import SmoothScroll from "@/components/ui/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
      >
        Skip to content
      </a>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </div>
      <SmoothScroll />
    </>
  );
}
