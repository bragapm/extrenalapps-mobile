import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import {Picker} from '@react-native-picker/picker';
import {getUsers} from '../../services/apiServices';
import {addPlansToNotes} from '../../utils/dummyStore';

const {width} = Dimensions.get('window');

// ---- helpers ----
const MONTHS_ID = [
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
];
const fmtDate = (d?: Date | null) => {
  if (!d) return '';
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = MONTHS_ID[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

// ---- konstanta ----
const STATUS_OPTIONS = [
  {label: 'Open', value: 'open'},
  {label: 'Waiting', value: 'waiting'},
  {label: 'Closed', value: 'closed'},
  {label: 'In Progress', value: 'in_progress'},
  {label: 'Approved', value: 'approved'},
  {label: 'Rejected', value: 'reject'},
  {label: 'Draft', value: 'draft'},
];

// ---- tipe data rencana ----
type PlanItem = {
  date: Date | null;
  pics: string[]; // id user
  status: string;
  title: string;
  description: string;
};

const DetailPlanWorker = () => {
  const navigation = useNavigation();

  // daftar user untuk PIC
  const [userList, setUserList] = useState<any[]>([]);
  useEffect(() => {
    // ambil daftar user (kalau error, biarin kosong aja)
    getUsers()
      .then(setUserList)
      .catch(() => setUserList([]));
  }, []);

  // state rencana kerja (bisa banyak)
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      date: new Date(),
      pics: [], // contoh: ['userId1', 'userId2']
      status: 'open',
      title: '',
      description: '',
    },
  ]);

  // Date picker per index
  const [datePickerIndex, setDatePickerIndex] = useState<number | null>(null);

  // PIC modal per index
  const [picModalIndex, setPicModalIndex] = useState<number | null>(null);
  const [picModalTemp, setPicModalTemp] = useState<string[]>([]);

  // nama user map cache
  const userMap = useMemo(() => {
    const m: Record<string, string> = {};
    userList.forEach(u => {
      const name = [u?.first_name, u?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      m[u?.id] = name || u?.email || String(u?.id);
    });
    return m;
  }, [userList]);

  const displayPIC = (ids: string[]) =>
    ids
      .map(id => userMap[id])
      .filter(Boolean)
      .join(', ');

  const updatePlan = (idx: number, patch: Partial<PlanItem>) => {
    setPlans(prev => {
      const copy = [...prev];
      copy[idx] = {...copy[idx], ...patch};
      return copy;
    });
  };

  const addPlan = () =>
    setPlans(p => [
      ...p,
      {date: new Date(), pics: [], status: 'open', title: '', description: ''},
    ]);

  const removePlan = (idx: number) =>
    setPlans(p => p.filter((_, i) => i !== idx));

  // submit sementara: tanpa loading dan tanpa call API (sesuai request “hide dulu”)
  const handleSubmit = async () => {
    // map user list -> nama
    const userMap: Record<string, string> = {};
    userList.forEach(u => {
      const name = [u?.first_name, u?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      userMap[u?.id] = name || u?.email || String(u?.id);
    });

    // hanya yang ada tanggalnya
    const payload = plans
      .filter(p => p.date)
      .map(p => ({
        date: p.date as Date,
        title: p.title || '(Tanpa judul)',
        description: p.description, // <— ini yang jadi note.desc
        pics: p.pics,
      }));

    await addPlansToNotes({plans: payload, userMap});
    navigation.goBack();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
        <AppHeader detail={true} home={false} label="Buat Rencana Kerja" />

        <ScrollView
          contentContainerStyle={{padding: 16, paddingBottom: 170}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {plans.map((p, idx) => (
            <View key={idx} style={{marginBottom: 18}}>
              {/* Tanggal kerja */}
              <Text style={s.label}>Tanggal kerja</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={s.selectBox}
                onPress={() => setDatePickerIndex(idx)}>
                <Text style={s.selectText}>
                  {p.date ? fmtDate(p.date) : 'Pilih tanggal'}
                </Text>
                <Text style={s.caret}>▾</Text>
              </TouchableOpacity>
              {datePickerIndex === idx && (
                <DateTimePicker
                  value={p.date || new Date()}
                  mode="date"
                  display={
                    Platform.select({ios: 'spinner', android: 'default'}) as any
                  }
                  onChange={(_, d) => {
                    setDatePickerIndex(null);
                    if (d) updatePlan(idx, {date: d});
                  }}
                />
              )}

              {/* PIC */}
              <Text style={s.label}>PIC</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={s.selectBox}
                onPress={() => {
                  setPicModalTemp(p.pics);
                  setPicModalIndex(idx);
                }}>
                <Text style={s.selectText}>
                  {p.pics.length ? displayPIC(p.pics) : 'Pilih PIC'}
                </Text>
                <Text style={s.caret}>▾</Text>
              </TouchableOpacity>

              {/* Status */}
              <Text style={s.label}>Status</Text>
              <View style={s.pickerWrap}>
                <Picker
                  selectedValue={p.status}
                  onValueChange={v => updatePlan(idx, {status: String(v)})}
                  style={s.picker}
                  dropdownIconColor="#6F6F6F">
                  {STATUS_OPTIONS.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Judul Aktivitas */}
              <Text style={s.label}>Judul Aktivitas</Text>
              <TextInput
                value={p.title}
                onChangeText={t => updatePlan(idx, {title: t})}
                placeholder="Pembebasan Lahan"
                style={s.input}
              />

              {/* Deskripsi */}
              <Text style={s.label}>Deskripsi</Text>
              <View style={s.textAreaBox}>
                <Text style={s.textAreaTopLabel}>Text Area Label</Text>
                <TextInput
                  value={p.description}
                  onChangeText={t => updatePlan(idx, {description: t})}
                  placeholder="Input Text or Placeholder"
                  multiline
                  textAlignVertical="top"
                  style={s.textArea}
                />
                <Text style={s.textAreaHandle}>⋮⋮</Text>
              </View>

              {/* Hapus (opsional) */}
              {plans.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePlan(idx)}
                  style={{alignSelf: 'flex-end', marginTop: 6}}>
                  <Text style={{color: '#C43F47', fontWeight: '600'}}>
                    Hapus Rencana
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Tambah Rencana Kerja */}
          <TouchableOpacity style={s.btnAdd} onPress={addPlan}>
            <Text style={s.btnAddText}>Tambah Rencana Kerja</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom actions (sticky) */}
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.btnPrimary} onPress={handleSubmit}>
            {/* loading disembunyikan sesuai request */}
            <Text style={s.btnPrimaryText}>Simpan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnOutline}
            onPress={() => navigation.goBack()}>
            <Text style={s.btnOutlineText}>Batal</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Multi-Select PIC */}
        <Modal
          transparent
          animationType="slide"
          visible={picModalIndex !== null}
          onRequestClose={() => setPicModalIndex(null)}>
          <View style={s.modalMask}>
            <View style={s.modalSheet}>
              <Text style={s.modalTitle}>Pilih PIC</Text>
              <ScrollView style={{maxHeight: 350}}>
                {userList.map(u => {
                  const id = u?.id;
                  const name =
                    [u?.first_name, u?.last_name]
                      .filter(Boolean)
                      .join(' ')
                      .trim() ||
                    u?.email ||
                    String(id);
                  const checked = picModalTemp.includes(id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={s.checkRow}
                      onPress={() => {
                        setPicModalTemp(prev =>
                          checked ? prev.filter(x => x !== id) : [...prev, id],
                        );
                      }}>
                      <View style={[s.checkbox, checked && s.checkboxChecked]}>
                        {checked ? (
                          <Text style={{color: '#fff'}}>✓</Text>
                        ) : null}
                      </View>
                      <Text style={s.checkLabel}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={{flexDirection: 'row', gap: 10, marginTop: 12}}>
                <TouchableOpacity
                  style={[s.btnOutline, {flex: 1}]}
                  onPress={() => setPicModalIndex(null)}>
                  <Text style={s.btnOutlineText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimary, {flex: 1}]}
                  onPress={() => {
                    if (picModalIndex !== null) {
                      updatePlan(picModalIndex, {pics: picModalTemp});
                    }
                    setPicModalIndex(null);
                  }}>
                  <Text style={s.btnPrimaryText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const s = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#4B4749',
    marginBottom: 6,
    marginTop: 8,
  },
  selectBox: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#181818',
    flexShrink: 1,
  },
  caret: {fontSize: 16, color: '#6F6F6F', marginLeft: 8},

  pickerWrap: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    width: '100%',
  },

  input: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#181818',
    marginBottom: 12,
  },

  textAreaBox: {
    borderWidth: 1.2,
    borderColor: '#D2D2D2',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    position: 'relative',
  },
  textAreaTopLabel: {
    color: '#9B9B9B',
    fontSize: 12,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 96,
    fontSize: 16,
    color: '#181818',
  },
  textAreaHandle: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    color: '#9B9B9B',
  },

  btnAdd: {
    borderWidth: 1.5,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddText: {
    color: '#D22C32',
    fontWeight: '600',
    fontSize: 16,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 18 + 8 : 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  btnPrimary: {
    backgroundColor: '#D22C32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {color: '#fff', fontSize: 18, fontWeight: '600'},
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#D22C32',
    backgroundColor: '#fff',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnOutlineText: {color: '#D22C32', fontSize: 18, fontWeight: '600'},

  // PIC modal
  modalMask: {
    flex: 1,
    backgroundColor: '#0007',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.4,
    borderColor: '#777',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#D22C32',
    borderColor: '#D22C32',
  },
  checkLabel: {fontSize: 15, color: '#222'},
});

export default DetailPlanWorker;
