import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  ImageBackground,
  PanResponder,
} from 'react-native';
import Modal from 'react-native-modal';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {RootStackParamList} from '../../navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {initNotes, getNotes, NotesByDate} from '../../utils/dummyStore';

// Locale
LocaleConfig.locales['id'] = {
  monthNames: [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ],
  dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  dayNamesShort: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  today: 'Hari ini',
};
LocaleConfig.defaultLocale = 'id';

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function PlanCalendar() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  // data notes (dummy) dari local store
  const [notesData, setNotesData] = useState<NotesByDate>({});
  useEffect(() => {
    initNotes().then(setNotesData);
  }, []);
  // refresh saat screen fokus (habis submit dari form)
  useEffect(() => {
    if (isFocused) {
      getNotes().then(setNotesData);
    }
  }, [isFocused]);

  const eventDates = useMemo(() => Object.keys(notesData), [notesData]);

  // state kalender
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(todayStr);
  const [modalVisible, setModalVisible] = useState(false);

  const getMonthDateString = (y: number, m: number) => `${y}-${pad2(m + 1)}-01`;
  const [calendarKey, setCalendarKey] = useState(0);

  const screenPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 50) changeMonth(-1);
        else if (g.dx < -50) changeMonth(1);
      },
    }),
  ).current;

  const changeMonth = (diff: number) => {
    let newMonth = month + diff;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    setCalendarKey(k => k + 1);
  };

  const renderHeader = () => {
    const monthNames = LocaleConfig.locales['id'].monthNames!;
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.arrowButton}>
          <Image
            source={require('../../assets/images/chevron-back.png')}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.monthText}>{monthNames[month]}</Text>
          <Text style={styles.yearText}>{year}</Text>
        </View>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.arrowButton}>
          <Image
            source={require('../../assets/images/chevron-forward.png')}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleMonthChange = (dateObj: any) => {
    const [y, m] = dateObj.dateString.split('-');
    setYear(Number(y));
    setMonth(Number(m) - 1);
    setCalendarKey(k => k + 1);
  };

  const renderDay = ({date, state}: any) => {
    const dateStr = date.dateString;
    const isEvent = eventDates.includes(dateStr);
    const isSelected = selected === dateStr;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSelected(dateStr);
          if (notesData[dateStr]) setModalVisible(true);
        }}
        style={{
          alignItems: 'center',
          width: 44,
          minHeight: 52,
          justifyContent: 'flex-start',
        }}>
        <View
          style={[
            isEvent ? styles.eventSquare : null,
            isSelected && styles.selectedSquare,
          ]}>
          <Text
            style={[
              styles.dayText,
              state === 'disabled' && {color: '#e0e4e9'},
              (isEvent || isSelected) && {color: 'white', fontWeight: 'bold'},
            ]}>
            {date.day}
          </Text>
        </View>
        {isEvent && notesData[dateStr] && (
          <View style={{width: '100%', alignItems: 'flex-start'}}>
            {notesData[dateStr].map((note, idx) => (
              <ImageBackground
                key={idx}
                source={require('../../assets/images/frame-notes-date.png')}
                style={styles.noteTagBG}
                imageStyle={styles.noteTagBGImage}
                resizeMode="contain">
                <Text style={styles.noteTagText} numberOfLines={1}>
                  {note.title}
                </Text>
              </ImageBackground>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper} {...screenPanResponder.panHandlers}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 120}}>
        <Calendar
          key={calendarKey}
          current={getMonthDateString(year, month)}
          onDayPress={d => setSelected(d.dateString)}
          onMonthChange={handleMonthChange}
          markingType={'custom'}
          renderHeader={renderHeader}
          dayComponent={renderDay}
          markedDates={
            selected
              ? {
                  [selected]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: '#D33838',
                    selectedTextColor: '#fff',
                  },
                }
              : {}
          }
          theme={{
            backgroundColor: '#fafaf9',
            calendarBackground: '#fafaf9',
            textSectionTitleColor: '#B2B9C6',
            textSectionTitleDisabledColor: '#e0e4e9',
            monthTextColor: '#222',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
            textMonthFontSize: 24,
            textDayHeaderFontSize: 14,
          }}
          hideArrows
          hideExtraDays={false}
          disableMonthChange={false}
          firstDay={1}
        />
      </ScrollView>

      {/* Modal detail */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection={['down']}
        style={{margin: 0, justifyContent: 'flex-end'}}
        onBackButtonPress={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(false)}
              style={styles.modalBar}
            />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingHorizontal: '3%',
              }}>
              <View style={styles.redDot} />
              <Text style={styles.modalDate}>
                {selected &&
                  new Date(selected).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                height: 600,
              }}>
              <ScrollView style={{marginTop: 8}}>
                {notesData[selected]?.length ? (
                  notesData[selected].map((note, idx) => (
                    <ImageBackground
                      key={idx}
                      source={require('../../assets/images/frameDetailNotes.png')}
                      style={styles.notesCardBG}
                      imageStyle={styles.notesCardBGImage}
                      resizeMode="stretch">
                      <TouchableOpacity style={styles.cardMoreBtn}>
                        <Text style={styles.cardMoreText}>⋮</Text>
                      </TouchableOpacity>
                      <Text style={styles.cardTitle}>{note.title}</Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {note.desc || '-'}
                      </Text>
                      <View style={styles.cardUserRow}>
                        <Image
                          source={require('../../assets/icons/ic-stackeHolder-disable.png')}
                          style={styles.cardUserIcon}
                        />
                        <Text style={styles.cardUserText}>
                          {note.user || '-'}
                        </Text>
                      </View>
                    </ImageBackground>
                  ))
                ) : (
                  <Text
                    style={{padding: 24, textAlign: 'center', color: '#fff'}}>
                    Tidak ada notes untuk tanggal ini.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* CTA di modal */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: Platform.OS === 'ios' ? 8 : 0,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 14,
            zIndex: 99,
            paddingVertical: '3%',
          }}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigation.navigate('DetailPlanWorker')}>
            <Text style={styles.fabButtonText}>Buat Rencana Kerja</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* CTA bawah */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: Platform.OS === 'ios' ? 8 : 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 14,
          zIndex: 99,
          paddingVertical: '3%',
        }}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('DetailPlanWorker')}>
          <Text style={styles.fabButtonText}>Buat Rencana Kerja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fafaf9',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    width: Dimensions.get('window').width,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '98%',
  },
  monthText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#242A38',
    textAlign: 'center',
    marginBottom: -2,
  },
  yearText: {fontSize: 16, color: '#B2B9C6', textAlign: 'center'},
  arrowButton: {padding: 6, borderRadius: 20},
  arrowIcon: {width: 26, height: 26, tintColor: '#B2B9C6'},
  eventSquare: {
    minWidth: 34,
    minHeight: 34,
    borderRadius: 7,
    backgroundColor: '#D33838',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  selectedSquare: {
    borderWidth: 2,
    borderColor: '#0A67FE',
    backgroundColor: '#D33838',
  },
  dayText: {
    fontSize: 17,
    color: '#242A38',
    textAlign: 'center',
    fontWeight: '500',
  },
  noteTagBG: {
    minWidth: 48,
    maxWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 2,
    marginBottom: 2,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    width: 80,
    height: 30,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 5,
  },
  noteTagBGImage: {borderRadius: 8, width: '100%', height: '100%'},
  noteTagText: {
    color: '#0A67FE',
    fontSize: 10,
    fontWeight: '500',
    maxWidth: 90,
  },
  fabButton: {
    backgroundColor: '#D33838',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  fabButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0007',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: '#D32E36',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 0,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalDate: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    backgroundColor: '#D33838',
    padding: 6,
    borderRadius: 8,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  notesCardBG: {
    width: '95%',
    minHeight: 120,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: '5%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#F7FDFF',
    marginHorizontal: '2%',
    alignSelf: 'center',
    marginVertical: '2%',
  },
  notesCardBGImage: {borderRadius: 16, resizeMode: 'stretch'},
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 5,
    marginRight: 32,
  },
  cardDesc: {fontSize: 14, color: '#222', marginBottom: 10},
  cardUserRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  cardUserIcon: {width: 20, height: 20, tintColor: '#b0b0b0', marginRight: 6},
  cardUserText: {fontSize: 15, color: '#626262', fontWeight: '500'},
  cardMoreBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 5,
    padding: 2,
  },
  cardMoreText: {fontSize: 22, color: '#888', fontWeight: 'bold'},
  redDot: {
    width: 13,
    height: 13,
    borderRadius: 13,
    backgroundColor: '#FFFF',
    marginRight: 10,
  },
});
