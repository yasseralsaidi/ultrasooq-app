import { Helmet, HelmetProvider } from "react-helmet-async";

export default function ForgetPass() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Successful Reset Password</title>
        </Helmet>
      </HelmetProvider>
      <>
        <section className="successfullPage">Reset Password</section>
      </>
    </>
  );
}
