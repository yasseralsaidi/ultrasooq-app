import React, { useState } from "react";
import PropTypes from "prop-types";
import AuthFooter from "../../components/AuthFooter";
import { Link, useHistory, useLocation } from "react-router-dom";
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

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {

  const location = useLocation();
  const { user, Logout, permissions } = useAuth();
  const [showLeftMenue, setShowLeftMenue] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const history = useHistory();

  const goToEditProfile = () => {
    history.push("/user/edit-profile");
  };
  const goToChangePassword = () => {
    history.push("/user/change-password");
  };

  const goToHelp = () => {
    history.push("/user/help");
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Check if the URL starts with /user/products
  const isActive = location.pathname.startsWith("/user/products");

  // check permission
  const checkPermission = (permissionName: string): boolean => {
    if (user?.tradeRole != 'ADMINMEMBER') return true;

    if (user?.tradeRole == 'ADMINMEMBER' && !permissions.includes(permissionName)) {
      return false;
    }

    return true;
  }

  return (
    <div className="body">
      {/* <main className="custom-dashboard"> */}
      <div className="adminLayout">
        <div className={showLeftMenue ? "leftPanel show" : "leftPanel"}>
          <button
            className={
              showLeftMenue
                ? "mainDashboard-toggle active"
                : "mainDashboard-toggle"
            }
            onClick={() => setShowLeftMenue(!showLeftMenue)}
          >
            <div></div>
          </button>
          <div className="logoDiv">
            <Link to="/user/dashboard">
              U<span className="collapsed-none">ltrasooq</span>
            </Link>
          </div>
          <ul>
            <li>
              <Link
                to="/user/dashboard"
                className={
                  history.location.pathname === "/user/dashboard"
                    ? "active"
                    : ""
                }
              >
                <img src="../../images/home.svg" alt="home-icon" />{" "}
                <span>Dashboard</span>
              </Link>
            </li>

            {checkPermission(PERMISSION_CATEGORIES) && <li>
              <Link
                to="/user/category"
                className={
                  history.location.pathname === "/user/category" ? "active" : ""
                }
              >
                <img src="../../images/category.svg" alt="category-icon" />{" "}
                <span>Platform Category</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_BRANDS) && <li>
              <Link
                to="/user/brand"
                className={
                  history.location.pathname === "/user/brand" ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Brand</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_PRODUCTS) && <li>
              <Link
                to="/user/products"
                // className={
                //   history.location.pathname === "/user/products" ? "active" : ""
                // }
                className={isActive ? "active" : ""}
              >
                <img src="../../images/product.svg" alt="product-icon" />{" "}
                <span>Products</span>
              </Link>
            </li>}
            {checkPermission(PERMISSION_PRODUCTS) && <li>
              <Link
                to="/user/services"
                // className={
                //   history.location.pathname === "/user/products" ? "active" : ""
                // }
                className={location.pathname.startsWith("/user/services") ? "active" : ""}
              >
                <img src="../../images/product.svg" alt="product-icon" />{" "}
                <span>Services</span>
              </Link>
            </li>}
            {checkPermission(PERMISSION_FORMS) && <li>
              <Link
                to="/user/form-lists"
                className={
                  history.location.pathname === "/user/form-lists"
                    ? "active"
                    : ""
                }
              >
                <img src="../../images/product.svg" alt="product-icon" />{" "}
                <span>Forms</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_USERS) && <ul>
              <li>
                <Link
                  to="#"
                  className={
                    history.location.pathname === "/user/user-lists"
                      ? "active"
                      : ""
                  }
                  onClick={toggleDropdown}
                >
                  <img src="../../images/product.svg" alt="product-icon" />{" "}
                  <span>Users</span>{" "}
                  <span className="p-[10px]">
                    <i className="fa fa-caret-down"></i>{" "}
                  </span>
                </Link>
                {dropdownOpen && (
                  <ul className="dropdown dropdown1">
                    <li>
                      <Link
                        to="/user/company-lists"
                        className={
                          history.location.pathname === "/user/company-lists"
                            ? "active"
                            : ""
                        }
                      >
                        <img
                          src="../../images/product.svg"
                          alt="product-icon"
                        />{" "}
                        <span>Company lists</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/user/freelancer-lists"
                        className={
                          history.location.pathname === "/user/freelancer-lists"
                            ? "active"
                            : ""
                        }
                      >
                        <img
                          src="../../images/product.svg"
                          alt="product-icon"
                        />{" "}
                        <span>Freelancer lists</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/user/buyer-lists"
                        className={
                          history.location.pathname === "/user/buyer-lists"
                            ? "active"
                            : ""
                        }
                      >
                        <img
                          src="../../images/product.svg"
                          alt="product-icon"
                        />{" "}
                        <span>Buyer lists</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>}

            {checkPermission(PERMISSION_MEMBERS) && <li>
              <Link
                to="/user/members"
                className={
                  history.location.pathname === "/user/members" ? "active" : ""
                }
              >
                <img src="../../images/product.svg" alt="product-icon" />{" "}
                <span>Members</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_ROLES) && <li>
              <Link
                to="/user/roles"
                className={
                  history.location.pathname === "/user/roles" ? "active" : ""
                }
              >
                <img src="../../images/product.svg" alt="product-icon" />{" "}
                <span>Roles</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_POLICIES) && <li>
              <Link
                to="/user/policies"
                className={
                  history.location.pathname === "/user/policies" ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Policies</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_FEES) && <li>
              <Link
                to="/user/fees"
                className={
                  history.location.pathname.includes("/user/fees") ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Fees</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_ORDERS) && <li>
              <Link
                to="/user/orders"
                className={
                  history.location.pathname.includes("/user/orders") ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Orders</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_TRANSACTIONS) && <li>
              <Link
                to="/user/transactions"
                className={
                  history.location.pathname.includes("/user/transactions") ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Transactions</span>
              </Link>
            </li>}

            {checkPermission(PERMISSION_HELP_CENTER) && <li>
              <Link
                to="/user/help-center/queries"
                className={
                  history.location.pathname.includes("/user/help-center/queries") ? "active" : ""
                }
              >
                <img src="/images/brand.svg" alt="brand-icon" />{" "}
                <span>Queries</span>
              </Link>
            </li>}
          </ul>
        </div>
        <div
          className="leftPanel-outerlayout"
          onClick={() => setShowLeftMenue(false)}
        ></div>
        <div className="rightPanel">
          <div className="dashbordHead">
            <div className="dashbordHeadRow">
              <button
                className={
                  showLeftMenue
                    ? "mainDashboard-toggle active"
                    : "mainDashboard-toggle"
                }
                onClick={() => setShowLeftMenue(!showLeftMenue)}
              >
                <div></div>
              </button>

              <div className="right">
                <div className="profileMenu">
                  <div className="dropdown">
                    <div
                      className="avtarBlock"
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                    >
                      <div className="imgBlock cursor-pointer">
                        <img src="../../images/people.png" alt="avatar-icon" />
                      </div>
                      {user && (
                        <p>
                          {user?.firstname} {user?.lastname}
                        </p>
                      )}
                    </div>

                    <ul
                      className={
                        showAccountMenu ? "dropdown-menu show" : "dropdown-menu"
                      }
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                    >
                      <li className="dropdown-menu-header">
                        <h5>Account</h5>
                        <button className="dropdown-close">
                          <img src="/images/modaclosebtn.svg" alt="" />
                        </button>
                      </li>
                      <li className="userAcountInfo">
                        <figure>
                          <img
                            src="../../images/people.png"
                            alt="people-icon"
                          />
                          {user && (
                            <figcaption>
                              {/* {user.firstname} */}
                              <h4>
                                {user?.firstname} {user?.lastname}
                              </h4>
                              <p>{user?.email}</p>
                            </figcaption>
                          )}
                        </figure>
                      </li>

                      <li>
                        <a className="dropdown-item" onClick={goToEditProfile}>
                          Edit Profile
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" onClick={goToChangePassword}>
                          Change Password
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" onClick={goToHelp}>
                          Help
                        </a>
                      </li>
                      <li>
                        <div className="cdivider"></div>
                      </li>
                      <li>
                        {/* onClick={handleLogout} */}
                        <a className="dropdown-item" onClick={() => Logout()}>
                          Logout
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {children}
          <AuthFooter />
        </div>
      </div>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
