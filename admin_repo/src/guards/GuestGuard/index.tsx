/* eslint-disable radix */
import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";

type GuestGuardProps = {
  children: React.ReactNode;
};

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user !== null) {
    return <Redirect to="/user/dashboard" />;
  }

  return <>{children}</>;
};

GuestGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestGuard;
