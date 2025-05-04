import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { WordCountEntry } from '../types';
import { formatCount } from '../util';

export interface WordCountCalculation {
  agency: string;
  starting_word_count: number;
  starting_section_count: number;
  total_word_count: number;
  total_section_count: number;
  percent_increased: number;
  words_increased: number;
  sections_increased: number;
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

  const dataByAgency: { [agency: string]: WordCountCalculation } = {};
  for (const item of data!) {
    let agencyData = dataByAgency[item.agency];
    if (!agencyData) {
      dataByAgency[item.agency] = agencyData = { agency: item.agency } as any;
    }
    if (item.effective_date.startsWith('2024')) {
      // starting {
      agencyData.starting_section_count = parseInt(item.total_section_count);
      agencyData.starting_word_count = parseInt(item.total_word_count);
    } else {
      agencyData.total_section_count = parseInt(item.total_section_count);
      agencyData.total_word_count = parseInt(item.total_word_count);
    }
    if (agencyData.starting_section_count && agencyData.total_word_count) {
      // we have all the data, calculate
      agencyData.words_increased =
        agencyData.total_word_count - agencyData.starting_word_count;
      agencyData.sections_increased =
        agencyData.total_section_count - agencyData.starting_section_count;
      agencyData.percent_increased =
        (agencyData.words_increased / agencyData.starting_word_count) * 100;
    }
  }

  const sortedData = [...Object.values(dataByAgency)].sort((a, b) => {
    if (sortBy === 'Words') return b.total_word_count - a.total_word_count;
    if (sortBy === 'Sections')
      return b.total_section_count - a.total_section_count;
    if (sortBy === 'Agency') return a.agency.localeCompare(b.agency);
    if (sortBy == 'Percent Increased')
      return (
        (b.percent_increased ?? 0) - (a.percent_increased ?? 0) ||
        a.agency.localeCompare(b.agency)
      );
    if (sortBy == 'Words Increased')
      return (
        (b.words_increased ?? 0) - (a.words_increased ?? 0) ||
        a.agency.localeCompare(b.agency)
      );
    return 0;
  });

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4">Federal Regulations by Agency</h2>
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
              <Listbox.Option
                value="Percent Increased"
                className="listbox-option"
              >
                Percent Increased
              </Listbox.Option>
              <Listbox.Option
                value="Words Increased"
                className="listbox-option"
              >
                Words Increased
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
                  <th scope="col">Words in 2024</th>
                  <th scope="col">Sections in 2024</th>
                  <th scope="col">Words Today</th>
                  <th scope="col">Sections of Regulation</th>

                  <th scope="col">Percent Increased</th>
                  <th scope="col">Words Increased</th>
                  <th scope="col">Sections Increased</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.agency}</td>
                    <td>{formatCount(item.starting_word_count)}</td>
                    <td>{formatCount(item.starting_section_count)}</td>
                    <td>{formatCount(item.total_word_count)}</td>
                    <td>{formatCount(item.total_section_count)}</td>
                    <td>{item.percent_increased?.toFixed(1)}%</td>
                    <td>{formatCount(item.words_increased)}</td>
                    <td>{formatCount(item.sections_increased)}</td>
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
