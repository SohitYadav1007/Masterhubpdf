import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../../components/ToolLayout';

function countLocally(text) {
  if (!text.trim()) return { words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readTime: 0 };
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return {
    words, chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim().length > 0).length || 1,
    readTime: Math.max(1, Math.ceil(words / 200))
  };
}

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({ words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readTime: 0 });

  useEffect(() => {
    const t = setTimeout(() => setStats(countLocally(text)), 100);
    return () => clearTimeout(t);
  }, [text]);

  const STATS = [
    { label: 'Words', value: stats.words.toLocaleString(), icon: '📝', color: 'bg-primary-50 text-primary-700' },
    { label: 'Characters', value: stats.chars.toLocaleString(), icon: '🔤', color: 'bg-purple-50 text-purple-700' },
    { label: 'No Spaces', value: stats.charsNoSpace.toLocaleString(), icon: '🔡', color: 'bg-pink-50 text-pink-700' },
    { label: 'Sentences', value: stats.sentences.toLocaleString(), icon: '📖', color: 'bg-green-50 text-green-700' },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString(), icon: '📄', color: 'bg-orange-50 text-orange-700' },
    { label: 'Read Time', value: `~${stats.readTime} min`, icon: '⏱️', color: 'bg-teal-50 text-teal-700' },
  ];

  return (
    <ToolLayout title="Word Counter" description="Count words, characters, sentences and paragraphs. Estimate reading time instantly." keywords="word counter, character counter, word count tool, text analyzer">
      <div className="tool-page-container max-w-4xl">
        <div className="tool-header">
          <div className="tool-icon-wrapper bg-amber-100"><span className="text-3xl">🔢</span></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Word Counter</h1>
          <p className="text-gray-500 text-sm">Count words, characters, sentences and get reading time — updates as you type.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label} layout className={`rounded-2xl p-4 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{s.icon}</span>
                <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{s.label}</p>
              </div>
              <p className="text-2xl font-extrabold">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="input h-72 resize-none leading-relaxed"
          style={{ minHeight: '280px', fontFamily: 'inherit' }}
        />
        {text && (
          <div className="mt-2 flex justify-end">
            <button onClick={() => setText('')} className="text-sm text-gray-400 hover:text-red-500 transition-colors">🗑️ Clear</button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
