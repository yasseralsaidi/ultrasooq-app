import { Helmet, HelmetProvider } from "react-helmet-async";
import HomeHeader from "../../components/HomeHeader";
import SiteFooter from "../../components/SiteFooter";

export default function TermsCondition() {
  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <title>Terms and conditions</title>
        </Helmet>
      </HelmetProvider>
      <HomeHeader />
      Terms and conditions
      <SiteFooter />
    </div>
  );
}
