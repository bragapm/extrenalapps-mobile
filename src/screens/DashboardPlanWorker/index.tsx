import React, {useState} from 'react';
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
} from 'react-native';
import Modal from 'react-native-modal';
import {Calendar, LocaleConfig} from 'react-native-calendars';

// Calendar Locale
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

// Data Notes
const notesData = {
  '2025-01-02': [
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
  '2025-01-09': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
  '2025-01-16': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
  '2025-01-23': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
  '2025-01-30': [
    {title: 'POC : Angel | Juli'},
    {title: 'POC : Angel | Juli 2'},
  ],
};

const eventDates = Object.keys(notesData);

export default function PlanCalendar() {
  const [current, setCurrent] = useState('2025-01-01');
  const [selected, setSelected] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Custom day rendering
  const renderDay = ({date, state}) => {
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
              isEvent && {color: 'white', fontWeight: 'bold'},
              isSelected && {color: 'white', fontWeight: 'bold'},
            ]}>
            {date.day}
          </Text>
        </View>
        {/* Notes kecil biru */}
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
  // Custom Header with image arrow
  const renderHeader = dateObj => {
    // dateObj bentuknya bisa Date atau {dateString, day, month, year, ...}
    // Pakai dateString kalau ada, fallback ke Date JS
    let year, monthNum;
    if (dateObj.dateString) {
      // Format "2025-01-01"
      [year, monthNum] = dateObj.dateString.split('-');
      monthNum = parseInt(monthNum, 10) - 1; // 0-indexed
    } else if (dateObj.getMonth) {
      year = dateObj.getFullYear();
      monthNum = dateObj.getMonth();
    }

    // Pilih nama bulan sesuai kebutuhan (en/indo)
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

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
          <Text style={styles.monthText}>{monthNames[monthNum]}</Text>
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

  // Ganti bulan
  const changeMonth = direction => {
    const date = new Date(current);
    date.setMonth(date.getMonth() + direction);
    setCurrent(date.toISOString().split('T')[0].slice(0, 7) + '-01');
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 120}}>
        <Calendar
          current={current}
          onMonthChange={m => setCurrent(m.dateString)}
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
      {/* Modal detail notes */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)} // Tap luar modal
        onSwipeComplete={() => setModalVisible(false)} // Swipe down
        swipeDirection={['down']} // Swipe ke bawah
        style={{margin: 0, justifyContent: 'flex-end'}}
        onBackButtonPress={() => setModalVisible(false)} // Android back button
      >
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
                {notesData[selected]?.length > 0 ? (
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
            <View
              style={{
                backgroundColor: '#FFFFFF',
                flex: 1,
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}></View>
            <ScrollView
              style={{marginTop: 8}}
              contentContainerStyle={{
                backgroundColor: '#FFFFFF',
                flex: 1,
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}></ScrollView>
            {/* <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Tutup</Text>
            </TouchableOpacity> */}
          </View>
        </View>
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
          <TouchableOpacity style={styles.fabButton}>
            <Text style={styles.fabButtonText}>Buat Rencana Kerja</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Tombol buat rencana */}
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
        <TouchableOpacity style={styles.fabButton}>
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
  yearText: {
    fontSize: 16,
    color: '#B2B9C6',
    textAlign: 'center',
  },
  arrowButton: {
    padding: 6,
    borderRadius: 20,
  },
  arrowIcon: {
    width: 26,
    height: 26,
    tintColor: '#B2B9C6',
  },
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
  noteTag: {
    // backgroundColor: '#E8F3FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    marginBottom: 1,
    minWidth: 36,
    maxWidth: 110,
    alignSelf: 'flex-start',
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
  noteTagBGImage: {
    borderRadius: 8, // samakan dengan shape png kamu
    width: '100%',
    height: '100%',
  },
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

  // Modal
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
    fontSize: 17,
    backgroundColor: 'transparent',
    padding: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginBottom: 6,
  },
  modalBar: {
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#eee',
    alignSelf: 'center',
    marginBottom: 8,
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
  modalNoteCard: {
    backgroundColor: '#E8F3FF',
    marginVertical: 8,
    borderRadius: 10,
    padding: 12,
  },
  modalNoteTitle: {
    color: '#0A67FE',
    fontWeight: 'bold',
    fontSize: 17,
  },
  modalClose: {
    backgroundColor: '#D33838',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 16,
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
    backgroundColor: '#F7FDFF', // fallback jika image transparent
    marginHorizontal: '2%',
    alignSelf: 'center',
    marginVertical: '2%',
  },
  notesCardBGImage: {
    borderRadius: 16,
    resizeMode: 'stretch',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 5,
    marginRight: 32, // space for the more button
  },
  cardDesc: {
    fontSize: 14,
    color: '#222',
    marginBottom: 10,
  },
  cardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cardUserIcon: {
    width: 20,
    height: 20,
    tintColor: '#b0b0b0',
    marginRight: 6,
  },
  cardUserText: {
    fontSize: 15,
    color: '#626262',
    fontWeight: '500',
  },
  cardMoreBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 5,
    padding: 2,
  },
  cardMoreText: {
    fontSize: 22,
    color: '#888',
    fontWeight: 'bold',
  },
  modalDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 4,
  },
  redDot: {
    width: 13,
    height: 13,
    borderRadius: 13,
    backgroundColor: '#FFFF',
    marginRight: 10,
  },
});
