import { IChannel } from "./channel";

export interface ICompany {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  channels?: IChannel[];
}