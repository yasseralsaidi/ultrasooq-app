import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Cookie from "../utils/Cookie";

const HomeHeader = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [, setScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    function onScroll() {
      let currentPosition = window.pageYOffset; // or use document.documentElement.scrollTop;
      if (currentPosition > scrollTop) {
        // downscroll code
        setScrolling(false);
      } else {
        // upscroll code
        setScrolling(true);
      }
      setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop]);

  const goToLogin = () => {
    if (document && document.querySelector("body")) {
      document.querySelector("body")?.classList.toggle("fixed");
      history.push("/login");
    }
  };
  const goToHome = () => {
    // document.querySelector('body').classList.toggle("fixed")
    history.push("/");
  };
  const goToAbout = () => {
    history.push("/about");
  };
  const goToFaq = () => {
    history.push("/faq");
  };
  const goToContact = () => {
    history.push("/contact");
  };
  return (
    <>
      <section className={`header ${scrollTop > 50 ? "header-fixed" : ""}`}>
        <div className="headerMain">
          <div className="left">
            <Link to="/">
              <img src="../images/logo.svg" alt="logo-icon" />
            </Link>
          </div>
          <div className={showMenu ? "middle show" : "middle"}>
            <ul>
              <li>
                <Link
                  to="/"
                  onClick={goToHome}
                  className={history.location.pathname === "/" ? "active" : ""}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={goToAbout}
                  className={
                    history.location.pathname === "/about" ? "active" : ""
                  }
                >
                  About
                </Link>
              </li>
              {/* <li><Link to="/blog" onClick={goToBlog} className={history.location.pathname === "/blog" && "active"}>Blog</Link></li> */}
              {/* <li><Link href="#">Pricing</Link></li> */}
              <li>
                <Link
                  to="/contact"
                  onClick={goToContact}
                  className={
                    history.location.pathname === "/contact" ? "active" : ""
                  }
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  onClick={goToFaq}
                  className={
                    history.location.pathname === "/faq" ? "active" : ""
                  }
                >
                  Faq
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  onClick={goToLogin}
                  className={
                    history.location.pathname === "/login" ? "active" : ""
                  }
                >
                  My account
                </Link>
              </li>

              {/* Responsive */}
              {!Cookie.getCookie("_tokenPuremoon_SuperAdmin") && (
                <li className="only-for-responsive">
                  <div className="singupLogin_btn themeBtnGreen">
                    <Link to="/register">Signup</Link>
                    <Link to="/login">Login</Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
          {/* Desktop */}
          {Cookie.getCookie("_tokenPuremoon_SuperAdmin") ? (
            <div className="right">
              <div className="bag" onClick={() => history.push("/user/cart")}>
                <button>
                  <img src="../images/bag.svg" alt="bag-icon" />
                </button>
                {user && <span>{user?.cart_count ? user.cart_count : 0}</span>}
              </div>
              {/* <button><img src="../images/search.svg" /></button> */}
              <div className="singupLogin_btn">
                <a href="/register">Signup</a>
                <a href="/login">Login</a>
              </div>
              <button
                className={showMenu ? "menuBtn active" : "menuBtn"}
                onClick={() => {
                  setShowMenu(!showMenu);
                  if (document && document.querySelector("body")) {
                    document.querySelector("body")?.classList.toggle("fixed");
                  }
                }}
              >
                <div></div>
              </button>
            </div>
          ) : (
            <div className="right">
              <div className="singupLogin_btn">
                <a href="/register">Signup</a>
                <a href="/login">Login</a>
              </div>
              <button
                className={showMenu ? "menuBtn active" : "menuBtn"}
                onClick={() => {
                  setShowMenu(!showMenu);
                  if (document && document.querySelector("body")) {
                    document.querySelector("body")?.classList.toggle("fixed");
                  }
                }}
              >
                <div></div>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

HomeHeader.propTypes = {};

export default HomeHeader;
