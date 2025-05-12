import { Suspense, Fragment, lazy } from "react";
import { Switch, Redirect, Route } from "react-router-dom";

import SiteLayout from "./layouts/SiteLayout";
import MainLayout from "./layouts/MainLayout";
import HomeLayout from "./layouts/HomeLayout";

import GuestGuard from "./guards/GuestGuard";
import UserGuard from "./guards/UserGuard";

import LoadingScreen from "./components/LoadingScreen";

export const renderRoutes: any = (routes = []) => (
  <Suspense fallback={<LoadingScreen />}>
    <Switch>
      {
        routes.map((route: any, i) => {
          const Guard = route.guard || Fragment;
          const Layout = route.layout || Fragment;
          const Component = route.component;

          return (
            <Route key={i} path={route.path} exact={route.exact} render={(props) => (
              <Guard>
                <Layout>
                  {route.routes ? renderRoutes(route.routes) : <Component {...props} />}
                </Layout>
              </Guard>
            )} />
          );
        })
      }
    </Switch>
  </Suspense>
);

const routes = [
  {
    exact: true,
    path: "/404",
    component: lazy(() => import("./views/errors/404")),
  },
  {
    exact: true,
    layout: SiteLayout,
    path: "/register",
    component: lazy(() => import("./views/auth/Register")),
  },
  {
    exact: true,
    layout: SiteLayout,
    guard: GuestGuard,
    path: "/",
    component: () => <Redirect to="/login" />,
  },
  {
    exact: true,
    guard: GuestGuard,
    layout: SiteLayout,
    path: "/login",
    component: lazy(() => import("./views/auth/Login")),
  },
  {
    exact: true,
    layout: SiteLayout,
    path: "/forgot-password",
    component: lazy(() => import("./views/auth/ForgetPass")),
  },
  {
    layout: SiteLayout,
    exact: true,
    path: "/otp-verification",
    component: lazy(
      () => import("./views/auth/ForgetPass/VerifyAccountPassword")
    ),
  },
  {
    exact: true,
    path: "/reset-password",
    layout: SiteLayout,
    component: lazy(() => import("./views/auth/ResetPass")),
  },

  {
    exact: true,
    layout: SiteLayout,
    path: "/successfully-password-reset",
    component: lazy(() => import("./views/auth/ResetPass/Successful")),
  },
  {
    guard: UserGuard,
    layout: MainLayout,
    routes: [
      {
        path: "/user/about",
        exact: true,
        component: lazy(() => import("./views/user/About/About")),
      },
      {
        exact: true,
        path: "/user/dashboard",
        component: lazy(() => import("./views/user/Dashboard/Dashboard")),
      },
      {
        exact: true,
        path: "/user/category",
        component: lazy(() => import("./views/user/Category/Category")),
      },
      {
        exact: true,
        path: "/user/brand",
        component: lazy(() => import("./views/user/Brand/Brand")),
      },
      {
        exact: true,
        path: "/user/policies",
        component: lazy(() => import("./views/user/Policies/Policies")),
      },
      {
        exact: true,
        path: "/user/fees",
        component: lazy(() => import("./views/user/Fees/Fees")),
      },
      {
        exact: true,
        path: "/user/fees/add",
        component: lazy(() => import("./views/user/Fees/AddFees")),
      },
      {
        exact: true,
        path: "/user/fees/update/:id",
        component: lazy(() => import("./views/user/Fees/UpdateFees")),
      },
      {
        exact: true,
        path: "/user/products",
        component: lazy(() => import("./views/user/Products/Products")),
      },
      {
        exact: true,
        path: "/user/products/:id",
        component: lazy(() => import("./views/user/Products/ProductsDetail")),
      },
      {
        exact: true,
        path: "/user/services",
        component: lazy(() => import("./views/user/Services/Services")),
      },
      {
        exact: true,
        path: "/user/services/:id",
        component: lazy(() => import("./views/user/Services/ServiceDetails")),
      },
      {
        exact: true,
        path: "/user/form-lists",
        component: lazy(() => import("./views/user/Form/FormLists")),
      },
      {
        exact: true,
        path: "/user/user-lists",
        component: lazy(() => import("./views/user/Userslist/UserLists")),
      },
      {
        exact: true,
        path: "/user/company-lists",
        component: lazy(() => import("./views/user/Userslist/CompanyList")),
      },
      {
        exact: true,
        path: "/user/freelancer-lists",
        component: lazy(() => import("./views/user/Userslist/FreelanceList")),
      },
      {
        exact: true,
        path: "/user/members",
        component: lazy(() => import("./views/user/Members/Members")),
      },
      {
        exact: true,
        path: "/user/roles",
        component: lazy(() => import("./views/user/Members/Roles")),
      },
      {
        exact: true,
        path: "/user/buyer-lists",
        component: lazy(() => import("./views/user/Userslist/BuyerList")),
      },
      {
        exact: true,
        path: "/user/create-form",
        component: lazy(() => import("./views/user/Form/CreateForm")),
      },
      {
        exact: true,
        path: "/user/edit-form/:formID",
        component: lazy(() => import("./views/user/Form/EditForm")),
      },
      {
        path: "/user/account",
        exact: true,
        component: lazy(() => import("./views/user/About/Account")),
      },
      {
        exact: true,
        path: "/user/edit-profile",
        component: lazy(() => import("./views/user/EditProfile/EditProfile")),
      },
      {
        exact: true,
        path: "/user/change-password",
        component: lazy(
          () => import("./views/user/ChangePasssword/ChangePasssword")
        ),
      },

      {
        exact: true,
        path: "/user/help",
        component: lazy(() => import("./views/user/Help/help")),
      },

      {
        exact: true,
        path: "/user/orders",
        component: lazy(() => import("./views/user/Orders/Orders")),
      },

      {
        exact: true,
        path: "/user/orders/:id",
        component: lazy(() => import("./views/user/Orders/OrderDetail")),
      },

      {
        exact: true,
        path: "/user/transactions",
        component: lazy(() => import("./views/user/Transactions/Transactions")),
      },

      {
        exact: true,
        path: "/user/transactions/:id",
        component: lazy(() => import("./views/user/Transactions/TransactionDetail")),
      },

      {
        exact: true,
        path: "/user/help-center/queries",
        component: lazy(() => import("./views/user/HelpCenter/Queries")),
      },

      {
        exact: true,
        path: "/user",
        component: () => <Redirect to="/user/about" />,
      },
      {
        component: () => <Redirect to="/404" />,
      },
    ],
  },

  {
    path: "*",
    layout: HomeLayout,
    routes: [
      {
        exact: true,
        path: "/",
        component: lazy(() => import("./views/Home")),
      },
      {
        exact: true,
        path: "/terms",
        component: lazy(() => import("./views/Home/TermsCondition")),
      },
      {
        exact: true,
        path: "/privacy",
        component: lazy(() => import("./views/Home/PrivacyPolicy")),
      },

      {
        component: () => <Redirect to="/404" />,
      },
    ],
  },
];

export default routes;
