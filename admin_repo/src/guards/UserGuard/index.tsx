/* eslint-disable radix */
import React from "react";
import { Redirect, matchPath, useLocation, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";
import { 
  PERMISSION_BRANDS, 
  PERMISSION_CATEGORIES, 
  PERMISSION_FEES, 
  PERMISSION_FORMS, 
  PERMISSION_HELP_CENTER, 
  PERMISSION_MEMBERS, 
  PERMISSION_ORDERS, 
  PERMISSION_POLICIES, 
  PERMISSION_PRODUCTS, 
  PERMISSION_ROLES, 
  PERMISSION_TRANSACTIONS, 
  PERMISSION_USERS
} from "../../utils/permissions";

type UserGuardProps = {
  children: React.ReactNode;
};

const UserGuard: React.FC<UserGuardProps> = ({ children }) => {
  const { isAuthenticated, user, permissions } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && user === null) {
    return <Redirect to="/login" />;
  }

  const renderChildren = () => {
    return <>{children}</>;
  };

  if (user?.tradeRole != "ADMINMEMBER") {
    return renderChildren();
  }

  if (matchPath(location.pathname, { path: "/user/category" }) && !permissions.includes(PERMISSION_CATEGORIES)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/brand" }) && !permissions.includes(PERMISSION_BRANDS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/products" }) && !permissions.includes(PERMISSION_PRODUCTS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/form-lists" }) && !permissions.includes(PERMISSION_FORMS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/company-lists" }) && !permissions.includes(PERMISSION_USERS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/freelancer-lists" }) && !permissions.includes(PERMISSION_USERS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/buyer-lists" }) && !permissions.includes(PERMISSION_USERS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/members" }) && !permissions.includes(PERMISSION_MEMBERS)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/roles" }) && !permissions.includes(PERMISSION_ROLES)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/policy" }) && !permissions.includes(PERMISSION_POLICIES)) {
    return <Redirect to="/" />;
  }

  if (matchPath(location.pathname, { path: "/user/fees" }) && !permissions.includes(PERMISSION_FEES)) {
    return <Redirect to="/" exact={true} />;
  }

  if (matchPath(location.pathname, { path: "/user/orders" }) && !permissions.includes(PERMISSION_ORDERS)) {
    return <Redirect to="/" exact={true} />;
  }

  if (matchPath(location.pathname, { path: "/user/transactions" }) && !permissions.includes(PERMISSION_TRANSACTIONS)) {
    return <Redirect to="/" exact={true} />;
  }

  if (matchPath(location.pathname, { path: "/user/help-center" }) && !permissions.includes(PERMISSION_HELP_CENTER)) {
    return <Redirect to="/" exact={true} />;
  }

  return renderChildren();
};

UserGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserGuard;
