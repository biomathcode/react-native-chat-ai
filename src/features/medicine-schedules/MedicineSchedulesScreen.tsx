import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  type ScrollView as NativeScrollView,
  Vibration,
  View,
} from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import Animated, {
  FadeInUp,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useMedicineSchedules } from '@/features/medicine-schedules/MedicineSchedulesContext';
import { medicineStyles as styles } from '@/features/medicine-schedules/styles';
import type {
  DoseStatus,
  MedicineDose,
  MedicineSchedule,
  MedicineType,
} from '@/features/medicine-schedules/types';

const medicineTypeIcons: Record<MedicineType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Capsule: 'pill',
  Pill: 'circle-slice-8',
  Liquid: 'bottle-tonic-plus-outline',
  Injection: 'needle',
  Drops: 'eyedropper',
};
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullWeekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const fullDateFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const calendarPastDays = 180;
const calendarFutureDays = 180;
const calendarItemWidth = 36;
const calendarItemGap = 4;
const AnimatedGestureScrollView = Animated.createAnimatedComponent(GestureScrollView);

type ScreenArea = {
  height: number;
  width: number;
  x: number;
  y: number;
};

function startOfDay(date: Date) {
  const nextDate = new Date(date);

  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = startOfDay(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function toDateKey(date: Date) {
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

function getSelectedDateParamValue(value: string | string[] | undefined) {
  const selectedDateParam = Array.isArray(value) ? value[0] : value;

  return selectedDateParam ? parseCourseDate(selectedDateParam) : null;
}

function getCalendarDates(centerDate: Date) {
  const firstDate = startOfDay(centerDate);

  firstDate.setDate(firstDate.getDate() - calendarPastDays);

  return Array.from({ length: calendarPastDays + calendarFutureDays + 1 }, (_, index) => {
    const date = new Date(firstDate);

    date.setDate(firstDate.getDate() + index);

    return date;
  });
}

function getDateOffsetFromToday(date: Date) {
  const todayTime = startOfDay(new Date()).getTime();
  const dateTime = startOfDay(date).getTime();

  return Math.round((dateTime - todayTime) / 86400000);
}

function formatRecommendation(value: string) {
  return value
    .split(' ')
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function formatDoseTime(value: string) {
  const [rawHours, rawMinutes] = value.split(':').map(Number);

  if (!Number.isFinite(rawHours) || !Number.isFinite(rawMinutes)) {
    return value || '--:--';
  }

  const period = rawHours >= 12 ? 'PM' : 'AM';
  const hours = rawHours % 12 || 12;
  const minutes = `${rawMinutes}`.padStart(2, '0');

  return `${hours}:${minutes} ${period}`;
}

function getDoseStatus(statuses: DoseStatus[], scheduleId: string, doseId: string, date: string) {
  return (
    statuses.find((status) => status.scheduleId === scheduleId && status.doseId === doseId && status.date === date)
      ?.status ?? 'not-taken'
  );
}

function triggerMedicineCardFeedback() {
  if (Platform.OS === 'web') {
    const navigatorWithVibrate = globalThis.navigator as Navigator & {
      vibrate?: (pattern: number | number[]) => boolean;
    };

    navigatorWithVibrate.vibrate?.(10);
    return;
  }

  Vibration.vibrate(10);
}

function MedicineDoseReminderCard({
  dateKey,
  dose,
  index,
  onToggleStatus,
  schedule,
  status,
}: {
  dateKey: string;
  dose: MedicineDose;
  index: number;
  onToggleStatus: (scheduleId: string, doseId: string, date: string, isTaken: boolean) => void;
  schedule: MedicineSchedule;
  status: 'taken' | 'not-taken';
}) {
  const isTaken = status === 'taken';
  const onPressCard = () => {
    triggerMedicineCardFeedback();
    onToggleStatus(schedule.id, dose.id, dateKey, !isTaken);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(280)}>
      <Pressable
        accessibilityLabel={`${isTaken ? 'Mark dose as not taken' : 'Mark dose as taken'}: ${schedule.name}`}
        accessibilityRole="button"
        accessibilityState={{ checked: isTaken }}
        onPress={onPressCard}
        style={({ pressed }) => [styles.reminderCard, pressed && styles.pressedReminderCard]}>
        <View style={styles.reminderCardTop}>
          <ThemedText style={styles.reminderTime}>{formatDoseTime(dose.time)}</ThemedText>
          <View style={[styles.reminderStatusCircle, isTaken && styles.takenReminderStatusCircle]}>
            {isTaken ? <Ionicons color={Palette.white} name="checkmark" size={15} /> : null}
          </View>
        </View>
        <View style={styles.reminderCardBody}>
          <View style={styles.reminderMedicineIcon}>
            <MaterialCommunityIcons color={Palette.white} name={medicineTypeIcons[schedule.medicineType]} size={23} />
          </View>
          <View style={styles.reminderTextBlock}>
            <View style={styles.reminderNameRow}>
              <ThemedText style={styles.reminderMedicineName}>{schedule.name}</ThemedText>
              <ThemedText style={styles.reminderDoseText}>{schedule.doseMg}mcg</ThemedText>
            </View>
            <View style={styles.reminderUnitsRow}>
              <MaterialCommunityIcons color={Palette.primary} name="scale-balance" size={18} />
              <ThemedText style={styles.reminderUnitsText}>
                {dose.units} {schedule.medicineType.toLowerCase()}
                {dose.units === 1 ? '' : 's'}
              </ThemedText>
              <ThemedText style={styles.reminderMetaSeparator}>-</ThemedText>
              <ThemedText style={styles.reminderMetaText}>
                {formatRecommendation(schedule.intakeRecommendation)}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CalendarDayButton({
  date,
  isSelected,
  onPress,
}: {
  date: Date;
  isSelected: boolean;
  onPress: () => void;
}) {
  const dayButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isSelected ? 1.04 : 1, { duration: 180 }) }],
  }));

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Animated.View style={[styles.calendarDayButton, isSelected && styles.selectedCalendarDayButton, dayButtonStyle]}>
        <Animated.Text style={[styles.calendarDayName, isSelected && styles.selectedCalendarDayText]}>
          {weekdayLabels[date.getDay()]}
        </Animated.Text>
        <Animated.Text style={[styles.calendarDayNumber, isSelected && styles.selectedCalendarDayText]}>
          {date.getDate()}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

function MedicineCalendarSlider({
  calendarScrollAreaLayoutKey,
  onCalendarScrollAreaLayout,
  selectedDate,
  onSelectDate,
}: {
  calendarScrollAreaLayoutKey?: unknown;
  onCalendarScrollAreaLayout?: (area: ScreenArea) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const calendarWeekFrameRef = useRef<View>(null);
  const scrollRef = useAnimatedRef<NativeScrollView>();
  const scrollTargetX = useSharedValue(0);
  const shouldAnimateScroll = useSharedValue(false);
  const hasSyncedInitialDate = useRef(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const calendarDates = useMemo(() => getCalendarDates(today), [today]);
  const todayKey = toDateKey(new Date());
  const selectedDateKey = toDateKey(selectedDate);
  const title = selectedDateKey === todayKey ? 'Today' : fullWeekdayFormatter.format(selectedDate);
  const getScrollXForDate = useCallback((date: Date) => {
    const dateIndex = calendarPastDays + getDateOffsetFromToday(date);
    const boundedIndex = Math.min(calendarDates.length - 1, Math.max(0, dateIndex));

    return boundedIndex * (calendarItemWidth + calendarItemGap);
  }, [calendarDates.length]);
  const scrollToDate = useCallback((date: Date, animated = true) => {
    shouldAnimateScroll.value = animated;
    scrollTargetX.value = getScrollXForDate(startOfWeek(date));
  }, [getScrollXForDate, scrollTargetX, shouldAnimateScroll]);
  const reportCalendarScrollAreaLayout = useCallback(() => {
    if (!onCalendarScrollAreaLayout) {
      return;
    }

    requestAnimationFrame(() => {
      calendarWeekFrameRef.current?.measureInWindow((x, y, width, height) => {
        onCalendarScrollAreaLayout({ height, width, x, y });
      });
    });
  }, [onCalendarScrollAreaLayout]);

  useDerivedValue(() => {
    scrollTo(scrollRef, scrollTargetX.value, 0, shouldAnimateScroll.value);
  });

  const returnToToday = () => {
    onSelectDate(today);
    scrollToDate(today);
  };

  useEffect(() => {
    scrollToDate(selectedDate, hasSyncedInitialDate.current);
    hasSyncedInitialDate.current = true;
  }, [scrollToDate, selectedDate, selectedDateKey]);

  useEffect(() => {
    reportCalendarScrollAreaLayout();

    const timeout = setTimeout(reportCalendarScrollAreaLayout, 320);

    return () => clearTimeout(timeout);
  }, [calendarScrollAreaLayoutKey, reportCalendarScrollAreaLayout]);

  return (
    <View style={styles.calendarHeader}>
      <View style={styles.calendarHeaderTop}>
        <View style={styles.calendarHeaderSide} />
        <View style={styles.calendarTitleBlock}>
          <ThemedText style={styles.calendarTitle}>{title}</ThemedText>
          <ThemedText style={styles.calendarDate}>{fullDateFormatter.format(selectedDate)}</ThemedText>
        </View>
        <View style={styles.calendarHeaderSide}>
          <Pressable
            accessibilityLabel="Return to today"
            accessibilityRole="button"
            onPress={returnToToday}
            style={({ pressed }) => [styles.calendarTodayButton, pressed && styles.pressedCalendarTodayButton]}>
            <Ionicons color={Palette.primary} name="calendar-outline" size={18} />
            <ThemedText style={styles.calendarTodayButtonText}>Today</ThemedText>
          </Pressable>
        </View>
      </View>
      <View
        onLayout={reportCalendarScrollAreaLayout}
        ref={calendarWeekFrameRef}
        style={styles.calendarWeekFrame}>
        <AnimatedGestureScrollView
          contentContainerStyle={styles.calendarWeekRow}
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          style={styles.calendarWeekScroller}>
          {calendarDates.map((date) => {
            const dateKey = toDateKey(date);

            return (
              <CalendarDayButton
                date={date}
                isSelected={dateKey === selectedDateKey}
                key={dateKey}
                onPress={() => {
                  onSelectDate(date);
                  scrollToDate(date);
                }}
              />
            );
          })}
        </AnimatedGestureScrollView>
      </View>
    </View>
  );
}

type MedicineSchedulesScreenProps = {
  calendarScrollAreaLayoutKey?: unknown;
  onCalendarScrollAreaLayout?: (area: ScreenArea) => void;
  onChatPress?: () => void;
  showChatToggle?: boolean;
};

export function MedicineSchedulesScreen({
  calendarScrollAreaLayoutKey,
  onCalendarScrollAreaLayout,
  onChatPress,
  showChatToggle = false,
}: MedicineSchedulesScreenProps) {
  const { selectedDate: selectedDateParam } = useLocalSearchParams<{
    selectedDate?: string;
  }>();
  const {
    doseStatuses,
    reminders,
    setDoseStatus,
  } = useMedicineSchedules();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const selectedDateKey = toDateKey(selectedDate);
  const visibleDoseReminders = useMemo(
    () => reminders.filter((reminder) => reminder.date === selectedDateKey),
    [reminders, selectedDateKey]
  );

  useEffect(() => {
    const nextSelectedDate = getSelectedDateParamValue(selectedDateParam);

    if (nextSelectedDate) {
      setSelectedDate(startOfDay(nextSelectedDate));
    }
  }, [selectedDateParam]);

  async function toggleDoseStatus(scheduleId: string, doseId: string, date: string, isTaken: boolean) {
    await setDoseStatus({
      date,
      doseId,
      scheduleId,
      status: isTaken ? 'taken' : 'not-taken',
    });
  }

  const goToChat = () => {
    if (onChatPress) {
      onChatPress();
      return;
    }

    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <GestureScrollView contentContainerStyle={styles.content}>
          {showChatToggle ? (
            <View style={styles.schedulerTopBar}>
              <Pressable accessibilityLabel="Back to chat" onPress={goToChat} style={styles.schedulerChatButton}>
                <Ionicons color={Palette.primary} name="chatbubble-outline" size={18} />
                <ThemedText style={styles.schedulerChatButtonText}>Chat</ThemedText>
              </Pressable>
            </View>
          ) : null}
          <MedicineCalendarSlider
            calendarScrollAreaLayoutKey={calendarScrollAreaLayoutKey}
            onCalendarScrollAreaLayout={onCalendarScrollAreaLayout}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(startOfDay(date))}
          />

          {visibleDoseReminders.length === 0 ? (
            <View style={[styles.card, styles.empty, styles.reminderList]}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons color={Palette.primary} name="pill" size={22} />
              </View>
              <ThemedText style={styles.emptyTitle}>No reminders yet</ThemedText>
              <ThemedText style={styles.emptyText}>Add one to see it here.</ThemedText>
              <Pressable onPress={() => router.push('/medicine-schedules/add')} style={styles.primaryButton}>
                <View style={styles.primaryButtonContent}>
                  <Ionicons color={Palette.white} name="add-circle-outline" size={18} />
                  <ThemedText style={styles.primaryButtonText}>Reminder</ThemedText>
                </View>
              </Pressable>
            </View>
          ) : (
            <View style={styles.reminderList}>
              {visibleDoseReminders.map(({ dose, schedule }, index) => (
                <MedicineDoseReminderCard
                  dateKey={selectedDateKey}
                  dose={dose}
                  index={index}
                  key={`${schedule.id}-${dose.id}`}
                  onToggleStatus={toggleDoseStatus}
                  schedule={schedule}
                  status={getDoseStatus(doseStatuses, schedule.id, dose.id, selectedDateKey)}
                />
              ))}
            </View>
          )}
        </GestureScrollView>
        <Pressable
          accessibilityLabel="Add medicine schedule"
          onPress={() => router.push('/medicine-schedules/add')}
          style={styles.floatingAddButton}>
          <Ionicons color={Palette.white} name="add" size={26} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
