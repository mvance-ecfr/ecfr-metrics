import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';

interface WordCountEntry {
  agency: string;
  total_word_count: string; // it's a string in the API, we'll convert it
  total_section_count: string;
}

function formatCount(count: number): string {
  if (count > 999999) {
    return (count / 1000000).toFixed(2) + 'M';
  } else if (count > 999) {
    return (count / 1000).toFixed(2) + 'K';
  } else {
    return count.toString();
  }
}

const RegulationsTable: React.FC = () => {
  const [sortBy, setSortBy] = useState<string>('Words');
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
  const sortedData = [...data!].sort((a, b) => {
    if (sortBy === 'Words')
      return parseInt(b.total_word_count) - parseInt(a.total_word_count);
    if (sortBy === 'Sections')
      return parseInt(b.total_section_count) - parseInt(a.total_section_count);
    if (sortBy === 'Agency') return a.agency.localeCompare(b.agency);
    return 0;
  });

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4">Regulations Data</h2>
        <Listbox value={sortBy} onChange={setSortBy}>
          <div className="position-relative">
            <Listbox.Button className="btn btn-primary d-flex align-items-center">
              <span>Sort by {sortBy}</span>
              <ChevronDownIcon
                className="ms-2"
                style={{ width: '20px', height: '20px' }}
              />
            </Listbox.Button>
            <Listbox.Options className="listbox-options">
              <Listbox.Option value="Agency" className="listbox-option">
                Agency
              </Listbox.Option>
              <Listbox.Option value="Words" className="listbox-option">
                Words
              </Listbox.Option>
              <Listbox.Option value="Sections" className="listbox-option">
                Sections
              </Listbox.Option>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Agency</th>
                  <th scope="col">Words</th>
                  <th scope="col">Sections of Regulation</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.agency}</td>
                    <td>{formatCount(parseInt(item.total_word_count))}</td>
                    <td>{formatCount(parseInt(item.total_section_count))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegulationsTable;
