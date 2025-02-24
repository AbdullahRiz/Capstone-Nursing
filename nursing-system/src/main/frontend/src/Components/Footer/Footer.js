import React, { Fragment } from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <Fragment>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-links">
            <a href="/about" className="footer-link">
              About
            </a>
            <a href="/contact" className="footer-link">
              Contact
            </a>
            <a href="/information" className="footer-link">
              information
            </a>
          </div>
          <span className="footer-text">
            2025 © Nursing Capstone All rights reserved
          </span>
          <div className="footer-icons">
            <a
              href="https://twitter.com"
              className="footer-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-twitter-x"></i>
            </a>
            <a
              href="https://instagram.com"
              className="footer-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://facebook.com"
              className="footer-icon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-facebook"></i>
            </a>
          </div>
        </div>
      </footer>
    </Fragment>
  );
};

export default Footer;
