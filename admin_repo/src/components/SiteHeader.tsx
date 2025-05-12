import { Link } from "react-router-dom";

function SiteHeader() {
  return (
    <header className="beforeLoginHead">
      <Link to="/">
        <img src="../../../images/logo.png" alt="logo-icon" />
      </Link>
    </header>
  );
}

SiteHeader.propTypes = {};

export default SiteHeader;
