import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/chat/styles';
import type { Medicine } from '@/features/chat/types';

type MedicineCardsProps = {
  medicines: Medicine[];
};

export function MedicineCards({ medicines }: MedicineCardsProps) {
  return (
    <View style={styles.medicineCards}>
      {medicines.map((medicine) => (
        <View key={medicine.id} style={styles.medicineCard}>
          <View style={styles.medicineIcon}>
            <ThemedText style={styles.medicineIconText}>
              {medicine.name.slice(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.medicineCardText}>
            <ThemedText style={styles.medicineName}>{medicine.name}</ThemedText>
            <ThemedText style={styles.medicineLabel}>Current medicine</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}
