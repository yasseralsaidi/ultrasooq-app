import React from "react";
import PropTypes from "prop-types";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

type SiteLayoutProps = {
  children: React.ReactNode;
};

const SiteLayout: React.FC<SiteLayoutProps> = ({ children }) => {
  return (
    <>
      {/* <SiteHeader /> */}

      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
};

SiteLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SiteLayout;
