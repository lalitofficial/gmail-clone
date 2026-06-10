import { useMailbox } from '../store/MailboxContext';
import { Icon } from './Icon';
import './Snackbar.css';

export function Snackbar() {
  const { toast, hideToast } = useMailbox();
  if (!toast) return null;

  return (
    <div className="gm-snackbar" key={toast.id} role="status">
      <span className="gm-snackbar-text">{toast.message}</span>
      {toast.undo && (
        <button
          className="gm-snackbar-undo"
          onClick={() => {
            toast.undo!();
            hideToast();
          }}
        >
          Undo
        </button>
      )}
      <button className="gm-snackbar-close" onClick={hideToast} aria-label="Dismiss">
        <Icon name="close" size={18} color="currentColor" />
      </button>
    </div>
  );
}
