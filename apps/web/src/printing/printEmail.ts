import type { Contact, Email } from '@gmail-clone/shared';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[character];
  });

const contacts = (items: Contact[] | undefined) =>
  (items ?? [])
    .map((contact) => `${escapeHtml(contact.name)} &lt;${escapeHtml(contact.email)}&gt;`)
    .join(', ');

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

function messageMarkup(email: Email) {
  const cc = contacts(email.cc);
  const bcc = contacts(email.bcc);
  const attachments = email.attachments.length
    ? `
      <div class="attachments">
        <strong>${email.attachments.length} attachment${email.attachments.length === 1 ? '' : 's'}</strong>
        ${email.attachments
          .map(
            (attachment) => `
              <div class="attachment">
                <span class="paperclip" aria-hidden="true"></span>
                <span>${escapeHtml(attachment.name)}</span>
                <span class="attachment-size">${escapeHtml(attachment.size)}</span>
              </div>`,
          )
          .join('')}
      </div>`
    : '';

  return `
    <article class="message">
      <header class="message-header">
        <div class="sender">
          <strong>${escapeHtml(email.from.name)}</strong>
          <span>&lt;${escapeHtml(email.from.email)}&gt;</span>
        </div>
        <time>${escapeHtml(fullDate(email.date))}</time>
        <div class="recipients"><span>To:</span> ${contacts(email.to)}</div>
        ${cc ? `<div class="recipients"><span>Cc:</span> ${cc}</div>` : ''}
        ${bcc ? `<div class="recipients"><span>Bcc:</span> ${bcc}</div>` : ''}
      </header>
      <div class="message-body">${escapeHtml(email.body)}</div>
      ${attachments}
    </article>`;
}

function printDocument(subject: string, messages: Email[]) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
    <style>
      @page { size: auto; margin: 16mm 18mm; }
      * { box-sizing: border-box; }
      html { color: #202124; background: #fff; }
      body {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        line-height: 1.45;
      }
      .print-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid #dadce0;
      }
      .subject {
        margin: 0;
        font-size: 20px;
        font-weight: 400;
        line-height: 1.3;
      }
      .print-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid #dadce0;
        border-radius: 4px;
        background: #fff;
        color: #3c4043;
        cursor: pointer;
      }
      .print-button:hover { background: #f1f3f4; }
      .print-button svg { width: 18px; height: 18px; fill: currentColor; }
      .message {
        break-inside: auto;
        padding: 0 0 24px;
      }
      .message + .message {
        padding-top: 24px;
        border-top: 1px solid #dadce0;
      }
      .message-header {
        display: grid;
        grid-template-columns: 1fr max-content;
        gap: 2px 20px;
        margin-bottom: 20px;
        color: #5f6368;
        font-size: 12px;
      }
      .sender {
        min-width: 0;
        color: #202124;
        font-size: 13px;
      }
      .sender strong { margin-right: 5px; }
      .sender span { color: #5f6368; }
      time {
        grid-column: 2;
        grid-row: 1;
        white-space: nowrap;
        color: #5f6368;
      }
      .recipients {
        grid-column: 1 / -1;
        overflow-wrap: anywhere;
      }
      .recipients span { color: #5f6368; }
      .message-body {
        min-height: 24px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: #202124;
        font-size: 14px;
        line-height: 1.5;
      }
      .attachments {
        margin-top: 24px;
        color: #3c4043;
        font-size: 12px;
      }
      .attachment {
        display: flex;
        align-items: center;
        gap: 7px;
        width: max-content;
        max-width: 100%;
        margin-top: 8px;
        padding: 7px 10px;
        border: 1px solid #dadce0;
        border-radius: 3px;
      }
      .paperclip {
        width: 8px;
        height: 15px;
        border: 1.5px solid #5f6368;
        border-top: 0;
        border-radius: 0 0 6px 6px;
        transform: rotate(35deg);
      }
      .attachment-size { color: #5f6368; }
      @media print {
        body { max-width: none; }
        .print-button { display: none; }
        .print-header { margin-bottom: 20px; }
      }
      @media screen {
        body { padding: 32px; }
      }
    </style>
  </head>
  <body>
    <header class="print-header">
      <h1 class="subject">${escapeHtml(subject)}</h1>
      <button class="print-button" onclick="window.print()" aria-label="Print" title="Print">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 8H5a3 3 0 0 0-3 3v4h4v4h12v-4h4v-4a3 3 0 0 0-3-3Zm-3 9H8v-5h8v5Zm3-5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM18 3H6v4h12V3Z"/>
        </svg>
      </button>
    </header>
    <main>${messages.map(messageMarkup).join('')}</main>
    <script>
      window.addEventListener('load', () => {
        window.setTimeout(() => window.print(), 150);
      });
    </script>
  </body>
</html>`;
}

export function printEmails(subject: string, messages: Email[]) {
  const popup = window.open('', '_blank', 'width=900,height=720');
  if (!popup) return false;

  popup.opener = null;
  popup.document.open();
  popup.document.write(printDocument(subject, messages));
  popup.document.close();
  return true;
}
