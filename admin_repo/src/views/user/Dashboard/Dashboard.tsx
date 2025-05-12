import { Helmet, HelmetProvider } from "react-helmet-async";

export default function Dashboard() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
      </HelmetProvider>
      <div className="listingPages allAccountsPage">
        <div className="listingPagesHead">
          <div className="left">
            <h3>Dashboard</h3>
          </div>
        </div>
        <div className="listingMain"></div>
      </div>
    </>
  );
}
