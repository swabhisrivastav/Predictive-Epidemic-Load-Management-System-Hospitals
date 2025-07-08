import React from "react";

const TopNavbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top">
      <div className="container-fluid">
        <button
          data-mdb-toggle="sidenav"
          data-mdb-target="#sidenav-1"
          className="btn shadow-0 p-0 me-3 d-block d-xxl-none"
        >
          <i className="fas fa-bars fa-lg"></i>
        </button>
        <form className="d-none d-md-flex justify-content-center mx-auto input-group w-auto my-auto">
          <input
            type="search"
            className="form-control rounded"
            placeholder="Search"
            style={{ minWidth: "225px" }}
          />
          <span className="input-group-text border-0">
            <i className="fas fa-search"></i>
          </span>
        </form>
        <ul className="navbar-nav d-flex align-items-center flex-row">
          <li className="nav-item me-3">
            <a className="nav-link py-1" href="#">
              <i className="fas fa-bell"></i>
            </a>
          </li>
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center py-1"
              href="#"
              id="navbarDropdown"
              role="button"
              data-mdb-toggle="dropdown"
            >
              <img
                src=""
                className="rounded-circle"
                height="30"
                alt=""
              />
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default TopNavbar;


