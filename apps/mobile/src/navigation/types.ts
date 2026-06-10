export type RootStackParamList = {
  MailList: undefined;
  Thread: { id: string };
  Compose: { to?: string; subject?: string; body?: string; threadId?: string } | undefined;
  Search: undefined;
};
