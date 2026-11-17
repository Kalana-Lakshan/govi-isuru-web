import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

// Officers review photos the AI could not match to any known disease: group similar cases,
// confirm a group as a new disease (the AI recognises it immediately) or dismiss it.
const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const CROPS = [
  { id: 'rice', en: 'Paddy', si: 'වී' },
  { id: 'tea', en: 'Tea', si: 'තේ' },
  { id: 'chili', en: 'Chili', si: 'මිරිස්' },
];

const T = {
  en: {
    title: 'Unknown diseases', intro: 'Photos the AI could not match to a known disease. Similar photos are grouped; confirm a group as a new disease or dismiss it.',
    group: 'Group similar cases', groups: 'Groups', ungrouped: 'Not grouped yet', none: 'No pending cases for this crop.',
    confirm: 'Confirm as new disease', dismiss: 'Dismiss', label: 'Disease id (snake_case, e.g. rice_false_smut)',
    cases: 'cases', districts: 'Districts', closest: 'Closest known disease', done: 'Registered', loading: 'Loading…',
  },
  si: {
    title: 'නොදන්නා රෝග', intro: 'AI හට හඳුනාගත නොහැකි වූ ඡායාරූප. සමාන ඡායාරූප කණ්ඩායම් කර ඇත; නව රෝගයක් ලෙස තහවුරු කරන්න හෝ ඉවත් කරන්න.',
    group: 'සමාන අවස්ථා කණ්ඩායම් කරන්න', groups: 'කණ්ඩායම්', ungrouped: 'තවම කණ්ඩායම් කර නැත', none: 'මෙම බෝගය සඳහා අවස්ථා නොමැත.',
    confirm: 'නව රෝගයක් ලෙස තහවුරු කරන්න', dismiss: 'ඉවත් කරන්න', label: 'රෝග හැඳුනුම (උදා: rice_false_smut)',
    cases: 'අවස්ථා', districts: 'දිස්ත්‍රික්ක', closest: 'ආසන්නතම දන්නා රෝගය', done: 'ලියාපදිංචි විය', loading: 'පූරණය වෙමින්…',
  },
};

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function UnknownDiseaseReview({ language = 'en' }) {
  const t = T[language] || T.en;
  const [crop, setCrop] = useState('rice');
  const [cases, setCases] = useState([]);
  const [clusters, setClusters] = useState(null);
  const [labels, setLabels] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    setClusters(null);
    try {
      const r = await axios.get(`${API}/api/ai/unknown-cases`, { ...auth(), params: { crop, status: 'pending' } });
      setCases(r.data.cases || []);
    } catch (e) {
      setMessage(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }, [crop]);

  useEffect(() => { load(); }, [load]);

  const cluster = async () => {
    setBusy(true);
    setMessage('');
    try {
      const r = await axios.post(`${API}/api/ai/unknown-cases/cluster`, { crop, min_size: 2 }, auth());
      setClusters(r.data);
    } catch (e) {
      setMessage(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (kind, group, idx) => {
    const ids = (group.members || []).map((m) => m.id);
    setBusy(true);
    setMessage('');
    try {
      if (kind === 'confirm') {
        const label = (labels[idx] || '').trim();
        const r = await axios.post(`${API}/api/ai/unknown-cases/confirm`, { crop, label, caseIds: ids }, auth());
        setMessage(`${t.done}: ${r.data.registered} (${r.data.cases} ${t.cases})`);
      } else {
        await axios.post(`${API}/api/ai/unknown-cases/dismiss`, { caseIds: ids }, auth());
      }
      await load();
    } catch (e) {
      setMessage(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">{t.title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{t.intro}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {CROPS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCrop(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${crop === c.id ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
          >
            {language === 'si' ? c.si : c.en}
          </button>
        ))}
        <button
          type="button"
          disabled={busy || cases.length < 2}
          onClick={cluster}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold bg-purple-600 text-white disabled:opacity-50"
        >
          {t.group}
        </button>
      </div>

      {message && <p className="mb-3 text-sm text-purple-700 dark:text-purple-300">{message}</p>}
      {busy && <p className="text-sm text-slate-500">{t.loading}</p>}
      {!busy && cases.length === 0 && <p className="text-sm text-slate-500">{t.none}</p>}

      {clusters && (
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">{t.groups} ({clusters.groups.length})</h3>
          {clusters.groups.map((g, i) => (
            <div key={g.representative_id || i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {g.members.slice(0, 8).map((m) => (
                  <img key={m.id} src={`${API}${m.imagePath}`} alt="" className={`w-20 h-20 object-cover rounded-lg ${m.id === g.representative_id ? 'ring-2 ring-purple-500' : ''}`} />
                ))}
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {g.members.length} {t.cases} · {t.districts}: {g.districts.join(', ') || '-'}
                {g.closest_known ? ` · ${t.closest}: ${typeof g.closest_known === 'string' ? g.closest_known : g.closest_known.label || ''}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={labels[i] || ''}
                  onChange={(e) => setLabels({ ...labels, [i]: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  placeholder={t.label}
                  className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-sm"
                />
                <button type="button" disabled={busy || !labels[i]} onClick={() => act('confirm', g, i)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-600 text-white disabled:opacity-50">{t.confirm}</button>
                <button type="button" disabled={busy} onClick={() => act('dismiss', g, i)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-200 dark:bg-slate-700">{t.dismiss}</button>
              </div>
            </div>
          ))}
          {clusters.ungrouped_ids?.length > 0 && (
            <p className="text-xs text-slate-500">{t.ungrouped}: {clusters.ungrouped_ids.length}</p>
          )}
        </div>
      )}

      {!clusters && cases.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
          {cases.map((c) => (
            <figure key={c._id} className="text-[10px] text-slate-500">
              <img src={`${API}${c.imagePath}`} alt="" className="w-full aspect-square object-cover rounded-lg" />
              <figcaption className="truncate">{c.district || '-'} · {new Date(c.createdAt).toLocaleDateString()}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
