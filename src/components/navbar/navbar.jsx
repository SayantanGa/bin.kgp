import { NavLink } from "react-router-dom";
import "./navbar.css";
import { useState } from "react";

function NavItems({ forHamburger }) {
  return (
    <nav className={`${forHamburger ? "hamburger__nav" : null}`}>
      <ul className={`${forHamburger ? "hamburger__list" : "Navbar-list"}`}>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            home{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/calculator"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            calculator{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/tt"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            tt{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/comparator"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            comparator{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/kmap"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            k-map{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/simplifier"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            simplifier{" "}
          </NavLink>
        </li>
        <li className={`${forHamburger ? "hamburger__item" : "Navbar-item"}`}>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              (isActive ? "text-red-200" : null) +
              `${forHamburger ? "hamburger__link" : "Navbar-link"}`
            }
            onClick={() =>
              (document.getElementById("hamburger-toggle").checked = false)
            }
          >
            {" "}
            about{" "}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function Hamburger() {
  return (
    <div className="hamburger">
      <input
        type="checkbox"
        className="hamburger__checkbox"
        id="hamburger-toggle"
      />
      <label for="hamburger-toggle" className="hamburger__button">
        <span className="hamburger__icon">&nbsp;</span>
      </label>
      <div className="hamburger__background">&nbsp;</div>
      <NavItems forHamburger={true} />
    </div>
  );
}

export default function Navbar({ showMobileView }) {
  return (
    <div className="Navbar">
      <h1 className="Navbar-header">
        bin.kgp <span className="beta">&#7526;</span>
      </h1>
      {showMobileView ? <Hamburger /> : <NavItems forHamburger={false} />}
    </div>
  );
}
