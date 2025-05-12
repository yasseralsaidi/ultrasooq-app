import { Helmet, HelmetProvider } from "react-helmet-async";

export default function VerifyAccountPassword() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Verify OTP</title>
        </Helmet>
      </HelmetProvider>
      <>
        <section className="beforeLoginSection">
          <div className="beforeLoginRow">Verify</div>
        </section>
      </>
    </>
  );
}
