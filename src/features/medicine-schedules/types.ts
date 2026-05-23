export type MedicineType = 'Capsule' | 'Pill' | 'Liquid' | 'Injection' | 'Drops';

export type IntakeRecommendation = 'Nevermind' | 'Before meal' | 'After meal' | 'With meal';

export type MedicineDoseDraft = {
  id: string;
  time: string;
  units: string;
};

export type MedicineDose = {
  id: string;
  time: string;
  units: number;
};

export type MedicineScheduleDraft = {
  medicineType: MedicineType;
  name: string;
  doseMg: string;
  stockAmount: string;
  doses: MedicineDoseDraft[];
  startDate: string;
  endDate: string;
  intakeRecommendation: IntakeRecommendation;
};

export type MedicineSchedule = Omit<MedicineScheduleDraft, 'doses' | 'stockAmount'> & {
  id: string;
  createdAt: string;
  doses: MedicineDose[];
  stockAmount: number;
};

export type MedicineReminder = {
  date: string;
  dose: MedicineDose;
  id: string;
  schedule: MedicineSchedule;
};

export type DoseStatusValue = 'taken' | 'not-taken';

export type DoseStatus = {
  date: string;
  doseId: string;
  scheduleId: string;
  status: DoseStatusValue;
};
