import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useMedicineSchedules } from '@/features/medicine-schedules/MedicineSchedulesContext';
import { medicineStyles as styles } from '@/features/medicine-schedules/styles';
import type {
  IntakeRecommendation,
  MedicineDoseDraft,
  MedicineScheduleDraft,
  MedicineType,
} from '@/features/medicine-schedules/types';

const medicineTypes: MedicineType[] = ['Capsule', 'Pill', 'Liquid', 'Injection', 'Drops'];
const intakeRecommendations: IntakeRecommendation[] = ['Nevermind', 'Before meal', 'After meal', 'With meal'];
const medicineTypeIcons: Record<MedicineType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Capsule: 'pill',
  Pill: 'circle-slice-8',
  Liquid: 'bottle-tonic-plus-outline',
  Injection: 'needle',
  Drops: 'eyedropper',
};

const initialDraft: MedicineScheduleDraft = {
  medicineType: 'Capsule',
  name: '',
  doseMg: '',
  stockAmount: '',
  doses: [{ id: 'dose-1', time: '', units: '' }],
  startDate: '',
  endDate: '',
  intakeRecommendation: 'Nevermind',
};

function updateDose(doses: MedicineDoseDraft[], id: string, field: keyof Omit<MedicineDoseDraft, 'id'>, value: string) {
  return doses.map((dose) => (dose.id === id ? { ...dose, [field]: value } : dose));
}

function timeFromString(value: string) {
  const date = new Date();
  const [hours = '8', minutes = '0'] = value.split(':');

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date;
}

function dateFromString(value: string) {
  const parsedDate = value ? new Date(`${value}T00:00:00`) : new Date();

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function formatTime(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseCourseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getCourseDayCount(startDateValue: string, endDateValue: string) {
  const startDate = parseCourseDate(startDateValue);
  const endDate = parseCourseDate(endDateValue);

  if (!startDate || !endDate) {
    return 0;
  }

  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
}

function getRunOutDate(startDateValue: string, dailyUnits: number, stockAmount: number) {
  const startDate = parseCourseDate(startDateValue);

  if (!startDate || dailyUnits <= 0 || stockAmount <= 0) {
    return '';
  }

  const coveredDays = Math.ceil(stockAmount / dailyUnits);
  const runOutDate = new Date(startDate);

  runOutDate.setDate(startDate.getDate() + Math.max(0, coveredDays - 1));

  return formatDate(runOutDate);
}

function MedicineTypeOption({
  isSelected,
  medicineType,
  onPress,
}: {
  isSelected: boolean;
  medicineType: MedicineType;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isSelected ? Palette.primary : Palette.border, { duration: 160 }),
    backgroundColor: withTiming(isSelected ? Palette.primarySoft : Palette.surface, { duration: 160 }),
    transform: [{ scale: withSpring(isSelected ? 1.04 : 1, { dampingRatio: 0.82, duration: 260 }) }],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.medicineTypeButton, animatedStyle]}>
        <View style={[styles.medicineTypeIcon, isSelected && styles.selectedMedicineTypeIcon]}>
          <MaterialCommunityIcons
            color={isSelected ? Palette.white : Palette.primary}
            name={medicineTypeIcons[medicineType]}
            size={22}
          />
        </View>
        <ThemedText style={[styles.optionText, isSelected && styles.selectedOptionText]}>{medicineType}</ThemedText>
      </Animated.View>
    </Pressable>
  );
}

function Field({
  label,
  onChangeText,
  placeholder,
  value,
  hint,
  keyboardType = 'default',
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
  hint?: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.formGroup}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.textHint}
        style={styles.input}
        value={value}
      />
      {hint ? <ThemedText style={styles.inputHint}>{hint}</ThemedText> : null}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <ThemedText style={styles.reviewLabel}>{label}</ThemedText>
      <ThemedText style={styles.reviewValue}>{value || 'Not set'}</ThemedText>
    </View>
  );
}

export function MedicineScheduleFormScreen() {
  const { addSchedule } = useMedicineSchedules();
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTimeDoseId, setActiveTimeDoseId] = useState<string | null>(null);
  const [activeDateField, setActiveDateField] = useState<'startDate' | 'endDate' | null>(null);
  const [draft, setDraft] = useState<MedicineScheduleDraft>(initialDraft);
  const progressWidth = `${step * 25}%` as `${number}%`;
  const stepEntering = useMemo(
    () => (stepDirection > 0 ? FadeInRight : FadeInLeft).duration(220),
    [stepDirection]
  );
  const stepExiting = useMemo(
    () => (stepDirection > 0 ? FadeOutLeft : FadeOutRight).duration(160),
    [stepDirection]
  );

  const canContinue = useMemo(() => {
    if (step === 1) {
      return draft.name.trim().length > 0 && draft.doseMg.trim().length > 0 && draft.stockAmount.trim().length > 0;
    }

    if (step === 2) {
      return draft.doses.every((dose) => dose.time.trim().length > 0 && Number(dose.units) > 0);
    }

    if (step === 3) {
      return draft.startDate.trim().length > 0 && draft.endDate.trim().length > 0;
    }

    return true;
  }, [draft, step]);

  function setField<Key extends keyof MedicineScheduleDraft>(field: Key, value: MedicineScheduleDraft[Key]) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  function addDose() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      doses: [
        ...currentDraft.doses,
        {
          id: `dose-${Date.now()}`,
          time: '',
          units: '',
        },
      ],
    }));
  }

  function removeDose(id: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      doses: currentDraft.doses.length === 1 ? currentDraft.doses : currentDraft.doses.filter((dose) => dose.id !== id),
    }));
  }

  async function goNext() {
    if (!canContinue || isSaving) {
      return;
    }

    if (step < 4) {
      setStepDirection(1);
      setStep((currentStep) => currentStep + 1);
      return;
    }

    const savedSchedule = {
      ...draft,
      id: `${draft.name.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      doses: draft.doses.map((dose) => ({
        id: dose.id,
        time: dose.time,
        units: Number(dose.units),
      })),
      stockAmount: Number(draft.stockAmount),
    };

    setIsSaving(true);

    try {
      await addSchedule(savedSchedule);
      router.replace({
        pathname: '/',
        params: {
          medicineSchedules: 'open',
          medicineSchedulesRequest: savedSchedule.id,
          selectedDate: savedSchedule.startDate,
        },
      });
    } finally {
      setIsSaving(false);
    }
  }

  function goBack() {
    if (step === 1) {
      router.back();
      return;
    }

    setStepDirection(-1);
    setStep((currentStep) => currentStep - 1);
  }

  function onDoseTimeChange(doseId: string, event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setActiveTimeDoseId(null);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    setField('doses', updateDose(draft.doses, doseId, 'time', formatTime(selectedDate)));
  }

  function onCourseDateChange(
    field: 'startDate' | 'endDate',
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) {
    if (Platform.OS === 'android') {
      setActiveDateField(null);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    setField(field, formatDate(selectedDate));
  }

  const dailyUnits = draft.doses.reduce((total, dose) => total + (Number(dose.units) || 0), 0);
  const courseDayCount = getCourseDayCount(draft.startDate, draft.endDate);
  const requiredUnits = courseDayCount * dailyUnits;
  const stockAmount = Number(draft.stockAmount) || 0;
  const hasStockShortage = requiredUnits > 0 && stockAmount > 0 && requiredUnits > stockAmount;
  const runOutDate = getRunOutDate(draft.startDate, dailyUnits, stockAmount);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: 'padding', android: 'height' })}
              style={styles.formBody}>
              <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                  <View style={styles.headerRow}>
                    <Pressable accessibilityLabel="Go back" onPress={goBack} style={styles.iconButton}>
                      <Ionicons color={Palette.primary} name="chevron-back" size={22} />
                    </Pressable>
                    <ThemedText style={styles.formTitle}>Reminder</ThemedText>
                    <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={styles.iconButton}>
                      <Ionicons color={Palette.primary} name="close" size={22} />
                    </Pressable>
                  </View>
                  <ThemedText style={styles.stepCaption}>Step {step} of 4</ThemedText>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: progressWidth }]} />
                  </View>
                </View>

                <Animated.View key={step} entering={stepEntering} exiting={stepExiting} style={styles.stepContent}>
                  {step === 1 ? (
                    <>
                      <View style={styles.card}>
                        <ThemedText style={styles.sectionTitle}>General Information</ThemedText>
                        <Field
                          label="Medicine Name"
                          onChangeText={(value) => setField('name', value)}
                          placeholder="Enter Medicine Name"
                          value={draft.name}
                        />
                        <Field
                          keyboardType="number-pad"
                          label="Dose in mg"
                          onChangeText={(value) => setField('doseMg', value)}
                          placeholder="Enter Dose"
                          value={draft.doseMg}
                        />
                        <Field
                          keyboardType="number-pad"
                          label="Stock Amount"
                          onChangeText={(value) => setField('stockAmount', value)}
                          placeholder="Example: 25"
                          value={draft.stockAmount}
                          hint="Total Medicine Units in the Package"
                        />
                      </View>

                      <View style={styles.card}>
                        <ThemedText style={styles.sectionTitle}>Type of Medicine</ThemedText>
                        <ScrollView
                          contentContainerStyle={styles.medicineTypeScroller}
                          horizontal
                          keyboardShouldPersistTaps="handled"
                          showsHorizontalScrollIndicator={false}>
                          {medicineTypes.map((medicineType) => {
                            const isSelected = medicineType === draft.medicineType;

                            return (
                              <MedicineTypeOption
                                isSelected={isSelected}
                                key={medicineType}
                                medicineType={medicineType}
                                onPress={() => setField('medicineType', medicineType)}
                              />
                            );
                          })}
                        </ScrollView>
                      </View>
                    </>
                  ) : null}

                  {step === 2 ? (
                    <View style={styles.card}>
                      <View style={styles.headerRow}>
                        <ThemedText style={styles.sectionTitle}>Time and Schedule</ThemedText>
                        <Pressable onPress={addDose} style={styles.inlineAction}>
                          <Ionicons color={Palette.primary} name="add-circle-outline" size={18} />
                          <ThemedText style={styles.scheduleTime}>Add Dose</ThemedText>
                        </Pressable>
                      </View>
                      {draft.doses.map((dose, index) => (
                        <View key={dose.id} style={styles.doseCard}>
                          <View style={styles.doseHeader}>
                            <ThemedText style={styles.doseTitle}>Dose {index + 1}</ThemedText>
                            <Pressable
                              accessibilityLabel={`Remove Dose ${index + 1}`}
                              onPress={() => removeDose(dose.id)}
                              style={styles.iconActionButton}>
                              <Ionicons color={Palette.danger} name="close" size={18} />
                            </Pressable>
                          </View>
                          <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Select Time</ThemedText>
                            <Pressable onPress={() => setActiveTimeDoseId(dose.id)} style={styles.timePickerButton}>
                              <View style={styles.timePickerIcon}>
                                <Ionicons color={Palette.primary} name="time-outline" size={20} />
                              </View>
                              <ThemedText style={[styles.timePickerText, !dose.time && styles.timePickerPlaceholder]}>
                                {dose.time || 'Choose Time'}
                              </ThemedText>
                            </Pressable>
                            {activeTimeDoseId === dose.id ? (
                              <DateTimePicker
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                mode="time"
                                onChange={(event, selectedDate) => onDoseTimeChange(dose.id, event, selectedDate)}
                                value={timeFromString(dose.time)}
                              />
                            ) : null}
                          </View>
                          <Field
                            keyboardType="number-pad"
                            label="Units per Dose"
                            onChangeText={(value) => setField('doses', updateDose(draft.doses, dose.id, 'units', value))}
                            placeholder="1"
                            value={dose.units}
                          />
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {step === 3 ? (
                    <View style={styles.card}>
                      <ThemedText style={styles.sectionTitle}>Course Duration</ThemedText>
                      <View style={styles.row}>
                        <View style={styles.rowItem}>
                          <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Start Date</ThemedText>
                            <Pressable onPress={() => setActiveDateField('startDate')} style={styles.datePickerButton}>
                              <View style={styles.timePickerIcon}>
                                <Ionicons color={Palette.primary} name="calendar-outline" size={20} />
                              </View>
                              <ThemedText style={[styles.timePickerText, !draft.startDate && styles.timePickerPlaceholder]}>
                                {draft.startDate || 'Choose Date'}
                              </ThemedText>
                            </Pressable>
                            {activeDateField === 'startDate' ? (
                              <DateTimePicker
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                mode="date"
                                onChange={(event, selectedDate) =>
                                  onCourseDateChange('startDate', event, selectedDate)
                                }
                                value={dateFromString(draft.startDate)}
                              />
                            ) : null}
                          </View>
                        </View>
                        <View style={styles.rowItem}>
                          <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>End Date</ThemedText>
                            <Pressable onPress={() => setActiveDateField('endDate')} style={styles.datePickerButton}>
                              <View style={styles.timePickerIcon}>
                                <Ionicons color={Palette.primary} name="calendar-outline" size={20} />
                              </View>
                              <ThemedText style={[styles.timePickerText, !draft.endDate && styles.timePickerPlaceholder]}>
                                {draft.endDate || 'Choose Date'}
                              </ThemedText>
                            </Pressable>
                            {activeDateField === 'endDate' ? (
                              <DateTimePicker
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                mode="date"
                                onChange={(event, selectedDate) => onCourseDateChange('endDate', event, selectedDate)}
                                value={dateFromString(draft.endDate)}
                              />
                            ) : null}
                          </View>
                        </View>
                      </View>
                      <ThemedText style={styles.sectionTitle}>Intake Recommendation</ThemedText>
                      <View style={styles.segmentedRow}>
                        {intakeRecommendations.map((recommendation) => {
                          const isSelected = draft.intakeRecommendation === recommendation;

                          return (
                            <Pressable
                              key={recommendation}
                              onPress={() => setField('intakeRecommendation', recommendation)}
                              style={[styles.segmentedButton, isSelected && styles.selectedSegment]}>
                              <ThemedText style={[styles.optionText, isSelected && styles.selectedSegmentText]}>
                                {recommendation}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {step === 4 ? (
                    <View style={styles.card}>
                      <ThemedText style={styles.sectionTitle}>Review Information</ThemedText>
                      <ReviewRow label="Medicine Type" value={draft.medicineType} />
                      <ReviewRow label="Name" value={draft.name} />
                      <ReviewRow label="Dose" value={draft.doseMg ? `${draft.doseMg} mg` : ''} />
                      <ReviewRow label="Daily Units" value={dailyUnits ? `${dailyUnits}` : ''} />
                      <ReviewRow label="Course Days" value={courseDayCount ? `${courseDayCount}` : ''} />
                      <ReviewRow label="Required Units" value={requiredUnits ? `${requiredUnits}` : ''} />
                      <ReviewRow label="Stock" value={draft.stockAmount} />
                      <ReviewRow
                        label="Doses"
                        value={draft.doses
                          .map(
                            (dose) =>
                              `${dose.time || '--:--'} / ${dose.units || '0'} unit${dose.units === '1' ? '' : 's'}`
                          )
                          .join(', ')}
                      />
                      <ReviewRow label="Duration" value={`${draft.startDate || 'Start'} to ${draft.endDate || 'End'}`} />
                      <ReviewRow label="Intake" value={draft.intakeRecommendation} />
                      {hasStockShortage ? (
                        <View style={styles.stockWarning}>
                          <Ionicons color={Palette.warningText} name="warning-outline" size={18} />
                          <ThemedText style={styles.stockWarningText}>
                            Stock may run out on {runOutDate || 'the course'} before this course is complete.
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </Animated.View>
              </ScrollView>
            </KeyboardAvoidingView>
            <View style={styles.footer}>
              <Pressable onPress={goBack} style={[styles.secondaryButton, styles.footerButton]}>
                <View style={styles.secondaryButtonContent}>
                  <Ionicons color={Palette.inkSoft} name="chevron-back" size={18} />
                  <ThemedText style={styles.secondaryButtonText}>Back</ThemedText>
                </View>
              </Pressable>
              <Pressable
                disabled={!canContinue || isSaving}
                onPress={goNext}
                style={[styles.primaryButton, styles.footerButton, (!canContinue || isSaving) && { opacity: 0.45 }]}>
                <View style={styles.primaryButtonContent}>
                  {isSaving ? <ActivityIndicator color={Palette.white} size="small" /> : null}
                  <ThemedText style={styles.primaryButtonText}>
                    {isSaving ? 'Saving' : step === 4 ? 'Save Reminder' : 'Next'}
                  </ThemedText>
                  {!isSaving ? (
                    <Ionicons
                      color={Palette.white}
                      name={step === 4 ? 'checkmark-circle-outline' : 'chevron-forward'}
                      size={18}
                    />
                  ) : null}
                </View>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
