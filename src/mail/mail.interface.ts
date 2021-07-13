export interface MailOptions {
  apiKey: string;
  domain: string;
  fromEmail: string;
}

export type EmailVariables = {
  key: string;
  value: string;
};
