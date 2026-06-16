import type { Attachment } from '@gmail-clone/shared';
import { Icon } from './Icon';
import './AttachmentCard.css';

const ICON_BY_KIND: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'picture_as_pdf', color: '#d93025' },
  docx: { icon: 'description', color: '#1a73e8' },
  doc: { icon: 'description', color: '#1a73e8' },
  xlsx: { icon: 'table_chart', color: '#188038' },
  png: { icon: 'image', color: '#34a853' },
  jpg: { icon: 'image', color: '#34a853' },
  jpeg: { icon: 'image', color: '#34a853' },
};

const isImage = (kind: string) => kind === 'png' || kind === 'jpg' || kind === 'jpeg';

/** Gmail's open-thread attachment tile: a preview area over a footer with file type + name. */
export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const meta = ICON_BY_KIND[attachment.kind] ?? { icon: 'insert_drive_file', color: '#5f6368' };
  return (
    <div className="gm-attachment-card" title={attachment.name}>
      <div className={`gm-attachment-preview${isImage(attachment.kind) ? ' gm-attachment-preview--image' : ''}`}>
        <Icon name={meta.icon} size={44} color={meta.color} />
        <div className="gm-attachment-hover">
          <button className="gm-attachment-hbtn" aria-label="Download"><Icon name="download" size={20} color="#fff" /></button>
          <button className="gm-attachment-hbtn" aria-label="Add to Drive"><Icon name="add_to_drive" size={20} color="#fff" /></button>
        </div>
      </div>
      <div className="gm-attachment-footer">
        <Icon name={meta.icon} size={18} color={meta.color} />
        <div className="gm-attachment-info">
          <span className="gm-attachment-name">{attachment.name}</span>
          <span className="gm-attachment-size">{attachment.size}</span>
        </div>
      </div>
    </div>
  );
}
