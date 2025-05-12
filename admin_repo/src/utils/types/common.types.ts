export interface Item {
  id: string;
  icon?: string;
  name: string;
  children?: Item[];
}
