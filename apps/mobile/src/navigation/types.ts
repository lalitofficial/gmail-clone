export type RootStackParamList = {
  MailList: undefined;
  Thread: { id: string };
  Compose: { to?: string; subject?: string; body?: string } | undefined;
  Search: undefined;
};
