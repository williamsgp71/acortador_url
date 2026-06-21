import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createShortUrl, listUrls, deleteUrl } from '../api/urls';

export default function UrlsPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [total, setTotal] = useState(0);
  const [originalUrl, setOriginalUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadUrls();
  }, []);

  async function loadUrls() {
    setLoading(true);
    try {
      const data = await listUrls(user.access_token);
      setUrls(data.urls);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const newUrl = await createShortUrl(user.access_token, originalUrl);
      setUrls([newUrl, ...urls]);
      setTotal(total + 1);
      setOriginalUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(shortCode) {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      await deleteUrl(user.access_token, shortCode);
      setUrls(urls.filter((u) => u.short_code !== shortCode));
      setTotal(total - 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyToClipboard(shortCode) {
    const url = `${window.location.origin}/s/${shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  }

  function truncateUrl(url, maxLength = 50) {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-2xl font-bold mb-6">URL Shortener</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">{error}</div>
        )}

        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url..."
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? 'Creating...' : 'Shorten URL'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">My URLs ({total})</h2>
          <button
            onClick={loadUrls}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {urls.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No URLs yet. Create your first short URL above!</p>
        ) : (
          <div className="space-y-4">
            {urls.map((url) => (
              <div
                key={url.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => copyToClipboard(url.short_code)}
                        className="text-indigo-600 hover:text-indigo-700 font-mono text-sm font-semibold"
                        title="Click to copy"
                      >
                        {window.location.origin}/s/{url.short_code}
                      </button>
                      {copied === url.short_code && (
                        <span className="text-green-600 text-xs">Copied!</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm truncate" title={url.original_url}>
                      → {truncateUrl(url.original_url)}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Clicks: <strong className="text-gray-700">{url.clicks}</strong></span>
                      <span>Last accessed: {formatDate(url.last_accessed_at)}</span>
                      <span>Created: {formatDate(url.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(url.short_code)}
                    className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}