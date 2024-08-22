import React, { useState } from 'react';
import axios from 'axios';

const AnalysisResult = ({ data }) => {
  if (data.error) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">Failed to parse analysis results. Raw content:</span>
        <pre className="mt-2 whitespace-pre-wrap">{data.rawContent}</pre>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="text-xl font-semibold mb-2">Analysis Results:</h2>
      <div className="mb-4">
        <h3 className="font-bold">Summary:</h3>
        <p>{data.summary}</p>
      </div>
      {data.sections.map((section, index) => (
        <div key={index} className="mb-4">
          <h3 className="font-bold">{section.title}</h3>
          <p>{section.content}</p>
        </div>
      ))}
      {data.relevantImages.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold">Relevant Images:</h3>
          <ul className="list-disc pl-5">
            {data.relevantImages.map((image, index) => (
              <li key={index}>{image}</li>
            ))}
          </ul>
        </div>
      )}
      {data.tables.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold">Relevant Tables:</h3>
          <ul className="list-disc pl-5">
            {data.tables.map((table, index) => (
              <li key={index}>{table}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await axios.post('http://localhost:5000/scrape', { url, query });
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comprehensive Web Content Analyzer</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to analyze"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          required
          className="w-full p-2 border rounded mb-2"
        />
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" 
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Website'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {analysis && <AnalysisResult data={analysis} />}
    </div>
  );
};

export default App;