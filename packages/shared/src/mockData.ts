import type { Account, Email, Label } from './types';
import { avatarColorFor } from './theme/tokens';

export const account: Account = {
  name: 'Lalit Kumar',
  email: 'lalitkofficial@gmail.com',
  initial: 'L',
  avatarColor: '#1a73e8',
};

export const labels: Label[] = [
  { id: 'work', name: 'Work', color: '#1a73e8' },
  { id: 'personal', name: 'Personal', color: '#188038' },
  { id: 'travel', name: 'Travel', color: '#e37400' },
  { id: 'finance', name: 'Finance', color: '#9334e6' },
];

type Sender = { name: string; email: string };

const contact = (s: Sender) => ({
  name: s.name,
  email: s.email,
  initial: s.name.charAt(0).toUpperCase(),
  avatarColor: avatarColorFor(s.email),
});

const me = contact({ name: account.name, email: account.email });

let seq = 0;
type Seed = {
  from: Sender;
  subject: string;
  snippet: string;
  body: string;
  ago: number; // hours ago
  read?: boolean;
  starred?: boolean;
  important?: boolean;
  category?: Email['category'];
  folder?: Email['folder'];
  labels?: string[];
  attachments?: { name: string; kind: string; size: string }[];
};

function make(seed: Seed): Email {
  const id = `m${++seq}`;
  const date = new Date(Date.now() - seed.ago * 3600_000).toISOString();
  const attachments = (seed.attachments ?? []).map((a, i) => ({
    id: `${id}-a${i}`,
    ...a,
  }));
  return {
    id,
    threadId: `t${seq}`,
    from: contact(seed.from),
    to: [me],
    subject: seed.subject,
    snippet: seed.snippet,
    body: seed.body,
    date,
    read: seed.read ?? false,
    starred: seed.starred ?? false,
    important: seed.important ?? false,
    hasAttachment: attachments.length > 0,
    attachments,
    labels: seed.labels ?? [],
    category: seed.category ?? 'primary',
    folder: seed.folder ?? 'inbox',
    snoozed: false,
  };
}

export const emails: Email[] = [
  make({
    from: { name: 'GitHub', email: 'noreply@github.com' },
    subject: '[gmail-clone] Your build passed ✅',
    snippet: 'The workflow CI run completed successfully on branch main. View the run details and logs.',
    body:
      'Hi Lalit,\n\nYour latest push to gmail-clone triggered a CI run that completed successfully.\n\nBranch: main\nCommit: feat: add inbox row hover actions\nDuration: 1m 42s\n\nView the full run on GitHub.\n\n— GitHub Actions',
    ago: 1,
    important: true,
    labels: ['work'],
  }),
  make({
    from: { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
    subject: 'Lunch tomorrow?',
    snippet: "Hey! Are we still on for lunch tomorrow around 1pm? I was thinking that new place near the office.",
    body:
      "Hey!\n\nAre we still on for lunch tomorrow around 1pm? I was thinking that new Thai place near the office — heard the green curry is incredible.\n\nLet me know if that works.\n\nPriya",
    ago: 2,
    starred: true,
    labels: ['personal'],
  }),
  make({
    from: { name: 'Google', email: 'no-reply@accounts.google.com' },
    subject: 'Security alert',
    snippet: 'A new sign-in on Mac. We noticed a new sign-in to your Google Account on a Mac device.',
    body:
      'New sign-in to your Google Account\n\nlalitkofficial@gmail.com\n\nWe noticed a new sign-in on a Mac. If this was you, you don’t need to do anything. If not, we’ll help you secure your account.\n\nCheck activity',
    ago: 4,
    important: true,
    category: 'updates',
  }),
  make({
    from: { name: 'Figma', email: 'updates@figma.com' },
    subject: 'Arjun shared "Gmail Clone — Design System" with you',
    snippet: 'Arjun invited you to collaborate on a file. Open in Figma to view the components and tokens.',
    body:
      'Arjun shared a file with you.\n\n"Gmail Clone — Design System"\n\nYou now have edit access. Open in Figma to start collaborating on components, tokens, and screens.',
    ago: 6,
    read: true,
    labels: ['work'],
    attachments: [{ name: 'design-tokens.pdf', kind: 'pdf', size: '248 KB' }],
  }),
  make({
    from: { name: 'Medium Daily Digest', email: 'noreply@medium.com' },
    subject: 'Building pixel-perfect UIs with design tokens',
    snippet: 'Stories for you · A deep dive into Material 3, design tokens, and shipping consistent interfaces.',
    body:
      'Today’s highlights\n\n— Building pixel-perfect UIs with design tokens\n— Why Material You changed everything\n— The case for a single source of truth\n\nRead on Medium.',
    ago: 8,
    category: 'promotions',
  }),
  make({
    from: { name: 'LinkedIn', email: 'notifications@linkedin.com' },
    subject: 'You appeared in 11 searches this week',
    snippet: 'See who’s been looking at your profile and which companies found you in search.',
    body: 'You appeared in 11 searches this week.\n\nRecruiters and people in your network found your profile. See the full list on LinkedIn.',
    ago: 10,
    category: 'social',
  }),
  make({
    from: { name: 'Amazon', email: 'shipment-tracking@amazon.com' },
    subject: 'Your package has shipped',
    snippet: 'Arriving tomorrow by 9 PM. "USB-C to USB-C Cable (2-pack)" is on the way.',
    body:
      'Your order is on the way\n\n"USB-C to USB-C Cable (2-pack)"\n\nArriving: Tomorrow by 9 PM\nTrack your package for live updates.',
    ago: 12,
    read: true,
    category: 'updates',
    labels: ['finance'],
  }),
  make({
    from: { name: 'Rahul Verma', email: 'rahul.verma@example.com' },
    subject: 'Re: Q3 roadmap review',
    snippet: 'Thanks for putting this together. A couple of comments on the timeline — see inline. Overall LGTM.',
    body:
      'Thanks for putting this together.\n\nA couple of comments on the timeline:\n\n1. Can we pull the search milestone a week earlier?\n2. The mobile drawer work might need an extra few days.\n\nOverall LGTM. Nice work.\n\nRahul',
    ago: 22,
    starred: true,
    labels: ['work'],
    attachments: [
      { name: 'Q3-roadmap.xlsx', kind: 'xlsx', size: '1.2 MB' },
      { name: 'notes.docx', kind: 'docx', size: '64 KB' },
    ],
  }),
  make({
    from: { name: 'Booking.com', email: 'noreply@booking.com' },
    subject: 'Your stay in Goa is confirmed 🌴',
    snippet: 'Confirmation #4821990 · Check-in Fri, Jun 19. We’re looking forward to hosting you.',
    body:
      'Booking confirmed!\n\nGoa Beach Resort\nCheck-in: Fri, Jun 19\nCheck-out: Mon, Jun 22\nConfirmation: 4821990\n\nManage your booking anytime.',
    ago: 28,
    read: true,
    category: 'promotions',
    labels: ['travel'],
  }),
  make({
    from: { name: 'Stripe', email: 'receipts@stripe.com' },
    subject: 'Your receipt from Acme Inc.',
    snippet: 'Receipt #2043-1182 · $29.00 paid on Jun 7. Thanks for your business.',
    body: 'Receipt from Acme Inc.\n\nAmount paid: $29.00\nDate: Jun 7, 2026\nReceipt #2043-1182\n\nView receipt in your browser.',
    ago: 30,
    read: true,
    category: 'updates',
    labels: ['finance'],
  }),
  make({
    from: { name: 'Ananya Iyer', email: 'ananya.iyer@example.com' },
    subject: 'Photos from the weekend trip!',
    snippet: 'Finally uploaded them all. So many good ones from the hike — sharing the album link below.',
    body: 'Hey everyone!\n\nFinally uploaded all the photos from the weekend. So many good ones from the hike.\n\nHere’s the album link. Download whatever you like!\n\nAnanya',
    ago: 34,
    category: 'social',
    labels: ['personal'],
    attachments: [{ name: 'IMG_2381.jpg', kind: 'png', size: '3.4 MB' }],
  }),
  make({
    from: { name: 'Notion', email: 'team@makenotion.com' },
    subject: 'What’s new in Notion this month',
    snippet: 'New: database automations, faster search, and a refreshed mobile editor.',
    body: 'This month in Notion\n\n— Database automations\n— Faster search\n— Refreshed mobile editor\n\nSee everything that’s new.',
    ago: 40,
    read: true,
    category: 'promotions',
  }),
  make({
    from: { name: 'Vikram Nair', email: 'vikram.nair@example.com' },
    subject: 'Invoice for May consulting',
    snippet: 'Hi Lalit, attaching the invoice for May. Net 15 as usual. Let me know if anything looks off.',
    body: 'Hi Lalit,\n\nAttaching the invoice for May consulting work. Net 15 as usual.\n\nLet me know if anything looks off and I’ll fix it right away.\n\nBest,\nVikram',
    ago: 48,
    read: true,
    labels: ['work', 'finance'],
    attachments: [{ name: 'invoice-may.pdf', kind: 'pdf', size: '92 KB' }],
  }),
  make({
    from: { name: 'YouTube', email: 'noreply@youtube.com' },
    subject: '"Material 3 in 100 seconds" and more',
    snippet: 'Recommended for you based on your activity. New uploads from channels you follow.',
    body: 'Recommended for you\n\n— Material 3 in 100 seconds\n— Building a design system from scratch\n— React Native vs Flutter in 2026\n\nWatch on YouTube.',
    ago: 52,
    read: true,
    category: 'social',
  }),
  make({
    from: { name: 'Zomato', email: 'order@zomato.com' },
    subject: 'How was your order? 🍕',
    snippet: 'Rate your recent order from Pizza Town and help others discover great food.',
    body: 'How was your order from Pizza Town?\n\nTap to rate and leave a quick review. It only takes a few seconds.',
    ago: 60,
    read: true,
    category: 'promotions',
  }),

  // Sent
  make({
    from: { name: account.name, email: account.email },
    subject: 'Re: Lunch tomorrow?',
    snippet: 'Yes! 1pm works great. The Thai place sounds perfect — see you there.',
    body: 'Yes! 1pm works great.\n\nThe Thai place sounds perfect — I’ve been wanting to try it. See you there.\n\nLalit',
    ago: 1.5,
    read: true,
    folder: 'sent',
    labels: ['personal'],
  }),
  make({
    from: { name: account.name, email: account.email },
    subject: 'Design tokens — first pass',
    snippet: 'Sharing the initial token set for the Gmail clone. Colors and type scale are in the doc.',
    body: 'Hi team,\n\nSharing the initial token set for the Gmail clone. Colors, type scale, radii, and spacing are all in the doc.\n\nFeedback welcome before I wire them into the apps.\n\nLalit',
    ago: 20,
    read: true,
    folder: 'sent',
    labels: ['work'],
  }),

  // Drafts
  make({
    from: { name: account.name, email: account.email },
    subject: 'Quarterly update (draft)',
    snippet: 'Hi all, here’s a quick summary of where things stand this quarter…',
    body: 'Hi all,\n\nHere’s a quick summary of where things stand this quarter…',
    ago: 5,
    read: true,
    folder: 'drafts',
  }),

  // Spam
  make({
    from: { name: 'Prize Center', email: 'win@totally-legit-prizes.biz' },
    subject: 'YOU’VE WON a $1000 gift card!!!',
    snippet: 'Congratulations!!! Click here within 24 hours to claim your exclusive reward now!!!',
    body: 'CONGRATULATIONS!!!\n\nYou have been selected to receive a $1000 gift card. Click the link within 24 hours to claim your exclusive prize!!!',
    ago: 16,
    folder: 'spam',
  }),

  // Trash
  make({
    from: { name: 'Old Newsletter', email: 'news@example-news.com' },
    subject: 'Weekly roundup (unsubscribed)',
    snippet: 'Here are this week’s stories you might have missed.',
    body: 'Here are this week’s stories you might have missed.',
    ago: 70,
    read: true,
    folder: 'trash',
  }),
];

/** Convenience: the user's primary account avatar seed. */
export const ACCOUNT_AVATAR_COLOR = account.avatarColor;
