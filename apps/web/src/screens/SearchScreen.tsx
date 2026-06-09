import { byNewest, searchEmails } from '@gmail-clone/shared';
import { useMailbox } from '../store/MailboxContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Route } from '../router';
import { EmailRow } from '../components/EmailRow';
import { Icon } from '../components/Icon';
import '../components/EmailRow.css';
import './MailList.css';

export function SearchScreen({ route }: { route: Extract<Route, { view: 'search' }> }) {
  const { emails } = useMailbox();
  const query = route.query;
  useDocumentTitle(query ? 'Search results' : 'Search');

  const results = searchEmails(emails, query).sort(byNewest);

  return (
    <div className="gm-list-screen">
      <div className="gm-search-header">
        <span className="gm-search-header-text">
          {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
        </span>
      </div>

      <div className="gm-list">
        {results.length === 0 ? (
          <div className="gm-list-empty">
            <Icon name="search_off" size={48} color="var(--gm-color-outline-variant)" />
            <p>No messages matched your search</p>
          </div>
        ) : (
          results.map((email) => <EmailRow key={email.id} email={email} />)
        )}
      </div>
    </div>
  );
}
