import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { hrefSearch, navigate, useRoute } from '../router';
import './SearchField.css';

export function SearchField() {
  const route = useRoute();
  const routeQuery = route.view === 'search' ? route.query : '';
  const [value, setValue] = useState(routeQuery);
  const [focused, setFocused] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [advanced, setAdvanced] = useState({ from: '', to: '', subject: '', words: '', excludes: '', attachment: false });

  // Keep the field in sync when navigating to #search/...
  useEffect(() => {
    setValue(routeQuery);
  }, [routeQuery]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) navigate(hrefSearch(value.trim()));
  };

  const clear = () => {
    setValue('');
    navigate('#inbox');
  };

  const runAdvanced = () => {
    const parts = [
      advanced.from && `from:${advanced.from}`,
      advanced.to && `to:${advanced.to}`,
      advanced.subject && `subject:${advanced.subject}`,
      advanced.words,
      advanced.excludes && `-${advanced.excludes}`,
      advanced.attachment && 'has:attachment',
    ].filter(Boolean);
    const query = parts.join(' ');
    setValue(query);
    setOptionsOpen(false);
    if (query) navigate(hrefSearch(query));
  };

  return (
    <form className={`gm-search${focused ? ' gm-search--focused' : ''}`} onSubmit={submit}>
      <button type="submit" className="gm-search-icon gm-icon-btn" aria-label="Search">
        <Icon name="search" size={20} />
      </button>
      <input
        className="gm-search-input"
        placeholder="Search mail"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button type="button" className="gm-search-icon gm-icon-btn" onClick={clear} aria-label="Clear">
          <Icon name="close" size={20} />
        </button>
      )}
      <button type="button" className="gm-search-icon gm-icon-btn" aria-label="Show search options" aria-expanded={optionsOpen} onClick={() => setOptionsOpen((open) => !open)}>
        <Icon name="tune" size={20} />
      </button>
      {optionsOpen && (
        <div className="gm-search-options">
          {[
            ['from', 'From'],
            ['to', 'To'],
            ['subject', 'Subject'],
            ['words', 'Has the words'],
            ['excludes', "Doesn't have"],
          ].map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                value={advanced[key as keyof typeof advanced] as string}
                onChange={(event) => setAdvanced((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          <label className="gm-search-check">
            <input type="checkbox" checked={advanced.attachment} onChange={(event) => setAdvanced((current) => ({ ...current, attachment: event.target.checked }))} />
            <span>Has attachment</span>
          </label>
          <div className="gm-search-options-actions">
            <button type="button" onClick={() => setOptionsOpen(false)}>Create filter</button>
            <button type="button" className="gm-search-options-submit" onClick={runAdvanced}>Search</button>
          </div>
        </div>
      )}
    </form>
  );
}
