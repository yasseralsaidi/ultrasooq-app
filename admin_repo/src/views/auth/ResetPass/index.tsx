import { Helmet, HelmetProvider } from "react-helmet-async";

export default function ForgetPass() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Reset Password</title>
        </Helmet>
      </HelmetProvider>
      <>
        <section className="beforeLoginSection">Reset Password</section>
      </>
    </>
  );
}
