import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import HomeHeader from "../../components/HomeHeader";
import SiteFooter from "../../components/SiteFooter";

export default function PrivacyPolicy() {
  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <title>Privacy Policy</title>
        </Helmet>
      </HelmetProvider>
      <HomeHeader />
      Privacy Policy
      <SiteFooter />
    </div>
  );
}
