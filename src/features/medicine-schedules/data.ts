import * as SecureStore from 'expo-secure-store';

import type { DoseStatus, DoseStatusValue, MedicineReminder, MedicineSchedule } from '@/features/medicine-schedules/types';

const SCHEDULES_STORAGE_KEY = 'react-native-chat-ai:medicine-schedules';
const DOSE_STATUSES_STORAGE_KEY = 'react-native-chat-ai:medicine-dose-statuses';

let medicineSchedulesCache: MedicineSchedule[] = [];
let medicineRemindersCache: MedicineReminder[] = [];
let doseStatusesCache: DoseStatus[] = [];

function readWebStoredValue(key: string) {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

async function readStoredValue(key: string) {
  const webValue = readWebStoredValue(key);

  if (webValue) {
    return webValue;
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeStoredValue(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Native Expo Go does not provide localStorage by default.
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore can be unavailable on web or unsupported runtimes.
  }
}

function parseSchedules(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const schedules = parsed.filter(
      (schedule): schedule is MedicineSchedule =>
        typeof schedule?.id === 'string' &&
        typeof schedule.createdAt === 'string' &&
        typeof schedule.medicineType === 'string' &&
        typeof schedule.name === 'string' &&
        typeof schedule.doseMg === 'string' &&
        typeof schedule.stockAmount === 'number' &&
        Array.isArray(schedule.doses) &&
        schedule.doses.every(
          (dose: unknown) =>
            typeof (dose as { id?: unknown })?.id === 'string' &&
            typeof (dose as { time?: unknown })?.time === 'string' &&
            typeof (dose as { units?: unknown })?.units === 'number'
        ) &&
        typeof schedule.startDate === 'string' &&
        typeof schedule.endDate === 'string' &&
        typeof schedule.intakeRecommendation === 'string'
    );

    return schedules;
  } catch {
    return [];
  }
}

function parseDoseStatuses(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (status): status is DoseStatus =>
        typeof status?.scheduleId === 'string' &&
        typeof status.doseId === 'string' &&
        typeof status.date === 'string' &&
        (status.status === 'taken' || status.status === 'not-taken')
    );
  } catch {
    return [];
  }
}

function parseCourseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatCourseDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createMedicineRemindersForSchedule(schedule: MedicineSchedule) {
  const startDate = parseCourseDate(schedule.startDate);
  const endDate = parseCourseDate(schedule.endDate);

  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
    return [];
  }

  const reminders: MedicineReminder[] = [];
  const currentDate = new Date(startDate);

  while (currentDate.getTime() <= endDate.getTime()) {
    const dateKey = formatCourseDate(currentDate);

    schedule.doses.forEach((dose) => {
      reminders.push({
        date: dateKey,
        dose,
        id: `${schedule.id}:${dateKey}:${dose.id}`,
        schedule,
      });
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return reminders;
}

function createMedicineReminders(schedules: MedicineSchedule[]) {
  return schedules.flatMap(createMedicineRemindersForSchedule);
}

export async function readMedicineScheduleStore() {
  const [storedSchedules, storedDoseStatuses] = await Promise.all([
    readStoredValue(SCHEDULES_STORAGE_KEY),
    readStoredValue(DOSE_STATUSES_STORAGE_KEY),
  ]);

  medicineSchedulesCache = parseSchedules(storedSchedules);
  medicineRemindersCache = createMedicineReminders(medicineSchedulesCache);
  doseStatusesCache = parseDoseStatuses(storedDoseStatuses);

  return {
    doseStatuses: doseStatusesCache,
    reminders: medicineRemindersCache,
    schedules: medicineSchedulesCache,
  };
}

export function buildMedicineReminders(schedules: MedicineSchedule[]) {
  return createMedicineReminders(schedules);
}

export async function writeMedicineSchedules(schedules: MedicineSchedule[]) {
  medicineSchedulesCache = schedules;
  medicineRemindersCache = createMedicineReminders(medicineSchedulesCache);
  await writeStoredValue(SCHEDULES_STORAGE_KEY, JSON.stringify(medicineSchedulesCache));

  return medicineRemindersCache;
}

export async function writeDoseStatuses(doseStatuses: DoseStatus[]) {
  doseStatusesCache = doseStatuses;
  await writeStoredValue(DOSE_STATUSES_STORAGE_KEY, JSON.stringify(doseStatusesCache));

  return doseStatusesCache;
}

export function upsertDoseStatus(
  doseStatuses: DoseStatus[],
  {
    date,
    doseId,
    scheduleId,
    status,
  }: {
    date: string;
    doseId: string;
    scheduleId: string;
    status: DoseStatusValue;
  }
) {
  const nextStatus: DoseStatus = { date, doseId, scheduleId, status };

  return [
    nextStatus,
    ...doseStatuses.filter(
      (item) => item.scheduleId !== scheduleId || item.doseId !== doseId || item.date !== date
    ),
  ];
}
