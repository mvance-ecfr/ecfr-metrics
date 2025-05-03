import React from 'react';
import iHeartDoge from '../assets/i-heart-doge.png';

const Header: React.FC = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src={iHeartDoge} // Replace with actual DOGE logo URL
              alt="DOGE Logo"
              className="me-2"
              style={{ height: '40px' }}
            />
            <span className="fs-5">
              I ❤️ DOGE: Department of Government Efficiency
            </span>
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Regulations
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Regulations
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Regulations
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Regulations
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Regulations
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
