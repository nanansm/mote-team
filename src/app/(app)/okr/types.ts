export type OkrRow = {
  id: string;
  objective: string;
  keyResult: string | null;
  clientId: string | null;
  clientName: string | null;
  period: string;
  target: number;
  progress: number;
};

export type ClientOption = { id: string; name: string };
