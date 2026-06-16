import type { Contact, Email } from '@gmail-clone/shared';

export interface PrintAccount {
  name: string;
  email: string;
}

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

/** Gmail print date: "Mon, Jun 8, 2026 at 1:50 AM". */
const fullDate = (iso: string) => {
  const date = new Date(iso);
  const day = date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} at ${time}`;
};

/** The multicolor Gmail "M" mark, inlined so the print window needs no assets. */
const gmailLogo = `
  <span class="brand">
    <svg viewBox="0 0 256 193" width="40" height="30" aria-hidden="true">
      <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z" fill="#4285F4"/>
      <path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798z" fill="#34A853"/>
      <path d="M58.182 93.14l-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504z" fill="#EA4335"/>
      <path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z" fill="#FBBC04"/>
      <path d="M0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.231z" fill="#C5221F"/>
    </svg>
    <span class="brand-word">Gmail</span>
  </span>`;

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

function printDocument(subject: string, messages: Email[], account: PrintAccount) {
  const count = `${messages.length} message${messages.length === 1 ? '' : 's'}`;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject || 'Gmail')}</title>
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
      /* Brand row: Gmail logo (left) + account identity (right). */
      .account-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid #cccccc;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .brand-word {
        font-size: 22px;
        color: #5f6368;
        letter-spacing: -0.5px;
      }
      .account-id {
        font-size: 13px;
        font-weight: bold;
        color: #202124;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .subject {
        margin: 24px 0 2px;
        font-size: 22px;
        font-weight: bold;
        line-height: 1.3;
        color: #202124;
      }
      .message-count {
        margin: 0 0 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid #cccccc;
        color: #5f6368;
        font-size: 13px;
      }
      .message {
        break-inside: auto;
        padding: 0 0 24px;
      }
      .message + .message {
        padding-top: 24px;
        border-top: 1px solid #e0e0e0;
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
      .sender span { color: #5f6368; font-weight: normal; }
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
      @media screen {
        body { padding: 32px; }
      }
    </style>
  </head>
  <body>
    <header class="account-row">
      ${gmailLogo}
      <span class="account-id">${escapeHtml(account.name)} &lt;${escapeHtml(account.email)}&gt;</span>
    </header>
    <h1 class="subject">${escapeHtml(subject)}</h1>
    <div class="message-count">${count}</div>
    <main>${messages.map(messageMarkup).join('')}</main>
    <script>
      window.addEventListener('load', () => {
        window.setTimeout(() => window.print(), 150);
      });
    </script>
  </body>
</html>`;
}

export function printEmails(subject: string, messages: Email[], account: PrintAccount) {
  const popup = window.open('', '_blank', 'width=900,height=720');
  if (!popup) return false;

  popup.opener = null;
  popup.document.open();
  popup.document.write(printDocument(subject, messages, account));
  popup.document.close();
  return true;
}
