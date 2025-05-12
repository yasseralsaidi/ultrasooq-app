import { Helmet, HelmetProvider } from "react-helmet-async";

export default function Register() {
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Registration</title>
        </Helmet>
      </HelmetProvider>

      {/* <SiteHeader /> */}

      <h1>Sign Up</h1>
    </>
  );
}
