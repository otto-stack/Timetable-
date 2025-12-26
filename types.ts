
export enum BookingType {
  MONTHLY = 'MONTHLY',
  TEMPORARY = 'TEMPORARY'
}

export interface Location {
  id: 'yl' | 'mk';
  name: string;
  chineseName: string;
}

export const LOCATIONS: Location[] = [
  { id: 'yl', name: 'Yuen Long', chineseName: '元朗' },
  { id: 'mk', name: 'Mong Kok', chineseName: '旺角' }
];

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  color: string;
  lightColor: string;
  textColor: string;
  borderColor: string;
}

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'dsechinese.man', subject: '中文', color: 'bg-rose-600', lightColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  { id: 't2', name: 'englishtutor.dse', subject: '英文', color: 'bg-blue-600', lightColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  { id: 't3', name: 'atlas.englishdse', subject: '英文', color: 'bg-indigo-600', lightColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  { id: 't4', name: 'dsephysics.whale', subject: '物理', color: 'bg-cyan-600', lightColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  { id: 't5', name: 'dselion.math', subject: '數學', color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { id: 't6', name: 'deerdse.econ', subject: '經濟', color: 'bg-orange-600', lightColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  { id: 't7', name: 'bondingeducation', subject: '化學', color: 'bg-fuchsia-600', lightColor: 'bg-fuchsia-50', textColor: 'text-fuchsia-700', borderColor: 'border-fuchsia-200' },
  { id: 't8', name: 'dsebio.penguin', subject: '生物', color: 'bg-emerald-600', lightColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
];

export interface Booking {
  id: string;
  title: string;
  teacherId: string;
  teacherName: string;
  locationId: 'yl' | 'mk';
  date: string;
  startTime: string;
  endTime: string;
  type: BookingType;
  description?: string;
}
