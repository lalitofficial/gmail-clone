import { useMailbox } from '../../store/MailboxContext';
import { ComposeWindow } from './ComposeWindow';
import './Compose.css';

export function ComposeManager() {
  const { composeWindows } = useMailbox();
  if (composeWindows.length === 0) return null;
  return (
    <div className="gm-compose-layer">
      {composeWindows.map((w, i) => (
        <ComposeWindow key={w.id} window={w} index={i} />
      ))}
    </div>
  );
}
