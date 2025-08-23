// Simple local "DB" untuk kalender & rencana kerja (tanpa API)
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NoteItem = {
  title: string;
  desc?: string;
  user?: string;
};
export type NotesByDate = Record<string, NoteItem[]>;

const STORAGE_KEY = '@plans_calendar_notes_v1';

// helper tanggal lokal -> YYYY-MM-DD (tanpa timezone shift)
export function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- Dummy awal untuk kalender ---
const DEFAULT_NOTES: NotesByDate = {
  '2025-07-02': [
    {
      title: 'Business Development Discussion',
      desc: 'A discussion on business development strategies with the team. The app has seamlessly adjusted the time for all members.',
      user: 'Priya',
    },
    {
      title: 'Business Development Discussion',
      desc: 'A discussion on business development strategies with the team. The app has seamlessly adjusted the time for all members.',
      user: 'Priya',
    },
  ],
  '2025-07-09': [
    {title: 'POC : Angel | Juli', desc: 'Kickoff POC', user: 'Ilham'},
    {title: 'POC : Angel | Juli 2', desc: 'Follow up legal', user: 'Narnia'},
  ],
  '2025-07-16': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
  '2025-07-23': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
  '2025-07-30': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
};

// panggil sekali saat app/screen masuk
export async function initNotes(): Promise<NotesByDate> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json) return JSON.parse(json) as NotesByDate;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTES));
  return DEFAULT_NOTES;
}

export async function getNotes(): Promise<NotesByDate> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? (JSON.parse(json) as NotesByDate) : {};
}

export async function setNotes(notes: NotesByDate) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// dipakai saat submit form rencana kerja
export async function addPlansToNotes(args: {
  plans: {
    date: Date;
    title: string;
    description?: string;
    pics?: string[];
  }[];
  userMap?: Record<string, string>;
}): Promise<NotesByDate> {
  const {plans, userMap = {}} = args;
  const notes = await getNotes();

  for (const p of plans) {
    const key = toYMD(new Date(p.date));
    if (!notes[key]) notes[key] = [];
    const userNames =
      (p.pics || []).map(id => userMap[id] || id).join(', ') || '-';
    notes[key].push({
      title: p.title || '(Tanpa judul)',
      // simpan string-nya apa adanya; render nanti yg fallback '-'
      desc: (p.description ?? '').trim(),
      user: userNames,
    });
  }

  await setNotes(notes);
  return notes;
}
