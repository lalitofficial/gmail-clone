import type { Attachment } from '@gmail-clone/shared';
import { Icon } from './Icon';
import './AttachmentCard.css';

const ICON_BY_KIND: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'picture_as_pdf', color: '#d93025' },
  docx: { icon: 'description', color: '#1a73e8' },
  doc: { icon: 'description', color: '#1a73e8' },
  xlsx: { icon: 'table_chart', color: '#188038' },
  png: { icon: 'image', color: '#e37400' },
  jpg: { icon: 'image', color: '#e37400' },
};

export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const meta = ICON_BY_KIND[attachment.kind] ?? { icon: 'insert_drive_file', color: '#5f6368' };
  return (
    <div className="gm-attachment-card">
      <div className="gm-attachment-preview">
        <Icon name={meta.icon} size={28} color={meta.color} />
      </div>
      <div className="gm-attachment-info">
        <span className="gm-attachment-name">{attachment.name}</span>
        <span className="gm-attachment-size">{attachment.size}</span>
      </div>
    </div>
  );
}
