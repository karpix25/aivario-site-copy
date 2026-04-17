import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { topNav } from "../data/siteData";

function navClass({ isActive }) {
  return isActive ? "active-link" : "";
}

export default function SiteLayout() {
  return (
    <div className="aivario-page">
      <div className="canvas-noise" />
      <main className="layout">
        <nav className="topbar glass-card">
          <NavLink to="/" className="brand">
            AIVario
          </NavLink>
          <div className="menu">
            {topNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <button className="pill-btn dark">Submit tool Soon</button>
        </nav>

        <Outlet />

        <footer className="footer">
          <NavLink to="/" className="brand">
            AIVario
          </NavLink>
          <div>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/blog">Newsletter</NavLink>
            <a href="https://x.com/aivario" target="_blank" rel="noreferrer">
              Twitter
            </a>
          </div>
          <p>© 2026 AIVario</p>
        </footer>
      </main>
    </div>
  );
}
