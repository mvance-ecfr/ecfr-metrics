import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { WordCountEntry } from '../types';
import { formatCount } from '../util';

const MainContent: React.FC = () => {
  const { data, isLoading, error } = useQuery<WordCountEntry[]>({
    queryKey: ['wordCounts'],
    queryFn: async () => {
      const res = await fetch(
        `https://ecfr-metrics-app-api-660490499645.us-central1.run.app/metrics`
      );
      if (!res.ok) throw new Error('Failed to fetch word counts');
      return res.json();
    },
  });

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading data</p>;

  const totalWords2024 = data!.reduce(
    (acc, item) =>
      acc +
      (item.effective_date.startsWith('2024')
        ? parseInt(item.total_word_count)
        : 0),
    0
  );
  const totalWordsToday = data!.reduce(
    (acc, item) =>
      acc +
      (!item.effective_date.startsWith('2024')
        ? parseInt(item.total_word_count)
        : 0),
    0
  );
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
            This is the number of words added by unelected bureaucrats in only
            the past calendar year currently present in the federal government's
            eCFR database
          </p>
        </div>
      </div>
      <span className="card-group">
        <div className="card">
          <div className="card-body">
            <h1>Total Words of Regulation</h1>
            <h2>
              May 2024 {formatCount(totalWords2024)} vs Today{' '}
              {formatCount(totalWordsToday)}
            </h2>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h1>Increase in Words in 12 months</h1>
            <h2>
              {formatCount(totalWordsToday - totalWords2024)} Words an increase
              of{' '}
              {(
                ((totalWordsToday - totalWords2024) / totalWords2024) *
                100
              ).toFixed(1)}
              %
            </h2>
          </div>
        </div>
      </span>
    </section>
  );
};

export default MainContent;
