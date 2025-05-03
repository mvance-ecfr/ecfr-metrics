import React from 'react';

const MainContent: React.FC = () => {
  return (
    <section className="mb-4">
      <h2 className="h3 mb-3">Regulations</h2>
      <p className="text-muted mb-4">
        A UN-official website of the United States government. Not affiliated
        with DOGE.
      </p>
      <div className="card">
        <div className="card-body">
          <p className="card-text">
            This is the number of words and sections of regulations created by
            unelected bureaucrats currently present in the federal government's
            eCFR database
          </p>
        </div>
      </div>
    </section>
  );
};

export default MainContent;
