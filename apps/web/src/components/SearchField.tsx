import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { hrefSearch, navigate, useRoute } from '../router';
import './SearchField.css';

export function SearchField() {
  const route = useRoute();
  const routeQuery = route.view === 'search' ? route.query : '';
  const [value, setValue] = useState(routeQuery);
  const [focused, setFocused] = useState(false);

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
      <button type="button" className="gm-search-icon gm-icon-btn" aria-label="Show search options">
        <Icon name="tune" size={20} />
      </button>
    </form>
  );
}
