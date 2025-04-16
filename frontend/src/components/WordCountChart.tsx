import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type WordCountEntry = {
  agency: string;
  total_word_count: string; // it's a string in the API, we'll convert it
};

export function WordCountChart() {
  const { data, isLoading, error } = useQuery<WordCountEntry[]>({
    queryKey: ['wordCounts'],
    queryFn: async () => {
      const res = await fetch(
        `https://ecfr-metrics-app-api-660490499645.us-central1.run.app/metrics/dates/2025-04-16`
      );
      if (!res.ok) throw new Error('Failed to fetch word counts');
      return res.json();
    },
  });

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Error loading data</p>;

  // Convert total_word_count to number and sort by descending word count
  const chartData = data!
    .map((entry) => ({
      agency: entry.agency,
      wordCount: parseInt(entry.total_word_count, 10),
    }))
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 20); // top 20 for readability
  return chartData.map((data) => (
    <span>
      {data.agency}: {data.wordCount}
      <br />
    </span>
  ));
}
