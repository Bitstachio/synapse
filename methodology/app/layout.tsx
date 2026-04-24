import Image from "next/image";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { ReactNode } from "react";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {};

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold ms-1">
        AI & The Transformation of Labor
      </span>
    </div>
  );
};

const CustomLastUpdated = () => <span></span>;

const navbar = <Navbar logo={<Logo />} />;
const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>;

const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head></Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          lastUpdated={<CustomLastUpdated />}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;
