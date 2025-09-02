import React, { useState } from 'react';
import { PropagateLoader } from 'react-spinners';

interface ParsedCoverLetterResponse {
  coverLetter: string;
}

const Dashboard = () => {
  const [coverLetter, setCoverLetter] = useState('');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCoverLetter('');

    try {
      const coverLetterResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ naturalLanguageQuery }),
      });

      if (coverLetterResponse.status !== 200) {
        const parsedError: { err: string } = await coverLetterResponse.json();
        setError(parsedError.err);
      } else {
        const parsedCoverLetterResponse: ParsedCoverLetterResponse =
          await coverLetterResponse.json();
        setCoverLetter(parsedCoverLetterResponse.coverLetter);
      }
    } catch (_err) {
      setError('Error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = () => {
    return (
      <div className="markdown-viewer">
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {coverLetter}
        </pre>
      </div>
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={naturalLanguageQuery}
          onChange={(e) => setNaturalLanguageQuery(e.target.value)}
          placeholder="Enter the job description here..."
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Executing...' : 'Execute'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="result">
        <h2>Cover Letter:</h2>
        {renderMarkdown()}

        <div className="result-loader">
          <PropagateLoader color="#63a4ff" loading={loading} />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleCopy}
          aria-label="Copy content to clipboard"
        >
          {!copied ? 'Copy' : 'Copied'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
