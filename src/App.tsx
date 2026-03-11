import React, { useState } from 'react';
import { Search, Copy, CheckCircle2, AlertCircle, Facebook } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/extract-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }

      setResult(data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <Facebook size={40} className="text-white" />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-lg flex items-center justify-center h-[72px]">
                <img 
                  src="https://www.yam112003.com/wp-content/themes/yam112003-theme/assets/img/logo/yam112003-logo-light.svg" 
                  alt="YAM112003 Logo" 
                  className="h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Trova ID Pagine o Profili Facebook</h1>
            <p className="text-blue-100 font-medium">Inserisci l'URL della pagina o del profilo per estrarre il suo ID numerico</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-slate-700 mb-2">
                URL della Pagina o del Profilo Facebook
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="es. https://www.facebook.com/cocacola"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-blue-600/20"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Estrazione in corso...</span>
                </div>
              ) : (
                <span>Estrai ID</span>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <p className="text-emerald-800 text-sm font-semibold uppercase tracking-wider mb-2">ID Estratto con Successo</p>
              <div className="text-4xl font-mono font-bold text-emerald-950 mb-6 tracking-tight">
                {result}
              </div>
              
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-2 bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-700 px-6 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia ID</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
