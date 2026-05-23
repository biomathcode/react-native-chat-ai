import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildMedicineReminders,
  readMedicineScheduleStore,
  upsertDoseStatus,
  writeDoseStatuses,
  writeMedicineSchedules,
} from '@/features/medicine-schedules/data';
import type { DoseStatus, DoseStatusValue, MedicineReminder, MedicineSchedule } from '@/features/medicine-schedules/types';

type MedicineSchedulesContextValue = {
  addSchedule: (schedule: MedicineSchedule) => Promise<MedicineReminder[]>;
  doseStatuses: DoseStatus[];
  isHydrating: boolean;
  reminders: MedicineReminder[];
  schedules: MedicineSchedule[];
  setDoseStatus: (input: {
    date: string;
    doseId: string;
    scheduleId: string;
    status: DoseStatusValue;
  }) => Promise<DoseStatus[]>;
};

const MedicineSchedulesContext = createContext<MedicineSchedulesContextValue | null>(null);

export function MedicineSchedulesProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [doseStatuses, setDoseStatuses] = useState<DoseStatus[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const hasMutatedState = useRef(false);

  useEffect(() => {
    let isMounted = true;

    readMedicineScheduleStore().then((storedState) => {
      if (!isMounted || hasMutatedState.current) {
        return;
      }

      setSchedules(storedState.schedules);
      setReminders(storedState.reminders);
      setDoseStatuses(storedState.doseStatuses);
      setIsHydrating(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addSchedule = useCallback(async (schedule: MedicineSchedule) => {
    hasMutatedState.current = true;

    const nextSchedules = [schedule, ...schedules.filter((item) => item.id !== schedule.id)];
    const nextReminders = buildMedicineReminders(nextSchedules);

    setSchedules(nextSchedules);
    setReminders(nextReminders);
    setIsHydrating(false);
    await writeMedicineSchedules(nextSchedules);

    return nextReminders;
  }, [schedules]);

  const setDoseStatus = useCallback(
    async (input: {
      date: string;
      doseId: string;
      scheduleId: string;
      status: DoseStatusValue;
    }) => {
      hasMutatedState.current = true;

      const nextDoseStatuses = upsertDoseStatus(doseStatuses, input);

      setDoseStatuses(nextDoseStatuses);
      setIsHydrating(false);
      await writeDoseStatuses(nextDoseStatuses);

      return nextDoseStatuses;
    },
    [doseStatuses]
  );

  const value = useMemo(
    () => ({
      addSchedule,
      doseStatuses,
      isHydrating,
      reminders,
      schedules,
      setDoseStatus,
    }),
    [addSchedule, doseStatuses, isHydrating, reminders, schedules, setDoseStatus]
  );

  return <MedicineSchedulesContext.Provider value={value}>{children}</MedicineSchedulesContext.Provider>;
}

export function useMedicineSchedules() {
  const value = useContext(MedicineSchedulesContext);

  if (!value) {
    throw new Error('useMedicineSchedules must be used inside MedicineSchedulesProvider');
  }

  return value;
}
