import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-2">
          A totally unofficial website of the United States government not
          affiliated with DOGE. Data sourced from the eCFR
          (https://www.ecfr.gov/developers/documentation/api/v1).
        </p>
      </div>
    </footer>
  );
};

export default Footer;
