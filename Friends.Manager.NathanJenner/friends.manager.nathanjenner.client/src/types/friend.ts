export const contactTypes = ['Unknown', 'Text', 'Phone', 'Video', 'InPerson', 'Email', 'Other'] as const;

export type ContactType = typeof contactTypes[number];
export type FriendInput = Omit<Friend, 'id'>;

export type Friend = {
    id: number;
    name: string;
    lastContactDate: string;
    lastContactType: ContactType;
    desiredContactFrequencyDays: number;
    categoryId: number;
};