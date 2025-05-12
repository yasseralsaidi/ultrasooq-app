import { Helmet, HelmetProvider } from "react-helmet-async";

export default function ForgetPass() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Forget Password | Ultrasooq Admin</title>
        </Helmet>
      </HelmetProvider>
      <>
        <section className="beforeLoginSection">Forget Password</section>
      </>
    </>
  );
}
