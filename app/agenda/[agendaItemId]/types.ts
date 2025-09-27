import { ItemId, ThoughtId } from '@timothyw/pat-common';

// Route parameter types for the agenda detail and form screens
export interface AgendaItemDetailParams {
  agendaItemId: ItemId;
}

export type AgendaItemFormParams = {
  agendaItemId?: ItemId;
  isEditing?: string;
  initialName?: string;
  thoughtId?: ThoughtId;
}