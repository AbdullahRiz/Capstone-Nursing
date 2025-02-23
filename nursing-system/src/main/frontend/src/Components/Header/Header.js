import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import Navigation from "./Navigation Bar";
import Home from "../Home/Home";

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg">
        <Link className="navbar-brand" to="/">
          🏥 Nursing Group
        </Link>
        <Navigation />

        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link className="nav-link account-link" to="/account">
              <i className="bi bi-person-circle"></i>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
