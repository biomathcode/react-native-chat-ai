import { router } from 'expo-router';

import { MedicineSchedulesScreen } from '@/features/medicine-schedules/MedicineSchedulesScreen';

export default function MedicineSchedulesRoute() {
  return <MedicineSchedulesScreen showChatToggle onChatPress={() => router.replace('/')} />;
}
