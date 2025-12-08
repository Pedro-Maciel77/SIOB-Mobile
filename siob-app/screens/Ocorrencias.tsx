import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { Text, Card, IconButton, Button, TextInput, Divider, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme } from '../theme/darkTheme';
import AnimatedDrawer from '../components/AnimatedDrawer';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

type Ocorrencia = {
  id: string;
  tipo: string;
  local: string;
  data: string; // formato dd/MM/yy ou dd/MM/yyyy
  status: string;
};

const EXAMPLE_DATA: Ocorrencia[] = [
  { id: '1', tipo: 'Acidente', local: 'Olinda', data: '10/11/2025', status: 'Finalizada' },
  { id: '2', tipo: 'Resgate', local: 'Recife', data: '13/11/2025', status: 'Aberta' },
  { id: '3', tipo: 'Incêndio', local: 'Olinda', data: '11/11/2025', status: 'Finalizada' },
  { id: '4', tipo: 'Inundação', local: 'São Lourenço da Mata', data: '10/11/2025', status: 'Finalizada' },
];

const STATUS_OPTIONS = ['Aberta', 'Em Andamento', 'Finalizada', 'Cancelada'];
const TIPOS = ['Acidente', 'Incêndio', 'Resgate', 'Desastre Natural', 'Outros'];

export default function Ocorrencias({ navigation }: any) {
  const drawerRef = useRef<any>(null);

  // filtros
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  // periodo
  const [periodoStart, setPeriodoStart] = useState<Date | null>(null);
  const [periodoEnd, setPeriodoEnd] = useState<Date | null>(null);
  const [periodoModalVisible, setPeriodoModalVisible] = useState(false);
  const [periodoTexto, setPeriodoTexto] = useState<string>('Período');

  // datepicker control
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);

  // modais de seleção
  const [modalStatusVisible, setModalStatusVisible] = useState(false);
  const [modalTipoVisible, setModalTipoVisible] = useState(false);

  // detalhe
  const [selected, setSelected] = useState<Ocorrencia | null>(null);

  // util: parse dd/MM/yy or dd/MM/yyyy
  const parseDateString = (s: string) => {
    const parts = s.split('/');
    if (parts.length < 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (parts[2].length === 2) y += 2000;
    return new Date(y, m, d);
  };

  const formatShort = (d: Date) => {
    const dd = `${d.getDate()}`.padStart(2, '0');
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // aplicar e formatar período
  const applyPeriodo = () => {
    if (periodoStart && periodoEnd) {
      // se invertido, troca
      let start = periodoStart;
      let end = periodoEnd;
      if (start.getTime() > end.getTime()) {
        const tmp = start;
        start = end;
        end = tmp;
      }
      setPeriodoStart(start);
      setPeriodoEnd(end);
      setPeriodoTexto(`${formatShort(start)} - ${formatShort(end)}`);
    } else if (periodoStart && !periodoEnd) {
      setPeriodoTexto(`${formatShort(periodoStart)} - ...`);
    } else if (!periodoStart && periodoEnd) {
      setPeriodoTexto(`... - ${formatShort(periodoEnd)}`);
    } else {
      setPeriodoTexto('Período');
    }
    setPeriodoModalVisible(false);
  };

  const clearFilters = () => {
    setFiltroMunicipio('');
    setFiltroStatus(null);
    setFiltroTipo(null);
    setPeriodoStart(null);
    setPeriodoEnd(null);
    setPeriodoTexto('Período');
  };

  const filtered = EXAMPLE_DATA.filter((o) => {
    if (filtroMunicipio && !o.local.toLowerCase().includes(filtroMunicipio.toLowerCase())) return false;
    if (filtroStatus && o.status !== filtroStatus) return false;
    if (filtroTipo && o.tipo !== filtroTipo) return false;

    if (periodoStart || periodoEnd) {
      const d = parseDateString(o.data);
      if (!d) return false;
      // normalizar início do dia / fim do dia para comparação inclusiva
      if (periodoStart) {
        const s = new Date(periodoStart);
        s.setHours(0, 0, 0, 0);
        if (d < s) return false;
      }
      if (periodoEnd) {
        const e = new Date(periodoEnd);
        e.setHours(23, 59, 59, 999);
        if (d > e) return false;
      }
    }

    return true;
  });

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: darkTheme.colors.surface, borderBottomColor: darkTheme.colors.outline }]}>
      <TouchableOpacity onPress={() => drawerRef.current?.toggle?.()} style={styles.iconButton}>
        <Ionicons name="menu" size={30} color={darkTheme.colors.onSurface} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: darkTheme.colors.onSurface }]}>Ocorrências</Text>

      <View style={{ width: 40 }} />
    </View>
  );

 const renderTableHeader = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, { color: darkTheme.colors.onSurfaceVariant, width: 120 }]}>Tipo</Text>
      <Text style={[styles.tableHeaderText, { color: darkTheme.colors.onSurfaceVariant, width: 160 }]}>Local</Text>
      <Text style={[styles.tableHeaderText, { color: darkTheme.colors.onSurfaceVariant, width: 100 }]}>Data</Text>
      <Text style={[styles.tableHeaderText, { color: darkTheme.colors.onSurfaceVariant, width: 100 }]}>Status</Text>
    </View>
  </ScrollView>
);

  const renderItem = ({ item }: { item: Ocorrencia }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={[styles.tableRow, { backgroundColor: darkTheme.colors.surface }]}>
      <Text style={[styles.tableCell, { color: darkTheme.colors.onSurface, width: 120 }]}>{item.tipo}</Text>
      <Text style={[styles.tableCell, { color: darkTheme.colors.onSurfaceVariant, width: 160 }]}>{item.local}</Text>
      <Text style={[styles.tableCell, { color: darkTheme.colors.onSurfaceVariant, width: 100 }]}>{item.data}</Text>
      <View style={{ width: 100, alignItems: 'flex-start' }}>
        <Chip
          compact
          style={[
            styles.statusChip,
            {
              backgroundColor: getStatusColor(item.status) + '22',
              borderColor: getStatusColor(item.status),
            },
          ]}
          textStyle={{ color: getStatusColor(item.status) }}
          onPress={() => {
            setFiltroStatus(item.status);
          }}
        >
          {item.status}
        </Chip>
      </View>
      {/* Ícone de detalhes */}
      <TouchableOpacity
        style={{ paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="eye-outline" size={22} color={darkTheme.colors.primary} />
      </TouchableOpacity>
    </View>
  </ScrollView>
);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.colors.background }}>
      <AnimatedDrawer ref={drawerRef} />

      {renderHeader()}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={[styles.card, { backgroundColor: darkTheme.colors.surface, borderColor: darkTheme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.legendTitle, { color: darkTheme.colors.onSurface }]}>
              Toque na ocorrência desejada para ver mais informações
            </Text>

            <Divider style={{ marginVertical: 12, backgroundColor: darkTheme.colors.outline }} />

            {renderTableHeader()}

            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(i) => i.id}
              ItemSeparatorComponent={() => <Divider style={{ backgroundColor: darkTheme.colors.outline, marginVertical: 6 }} />}
              style={{ marginTop: 8 }}
            />
          </Card.Content>
        </Card>

        <View style={{ height: 18 }} />

        <Card style={[styles.filtersCard, { backgroundColor: darkTheme.colors.surface, borderColor: darkTheme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: darkTheme.colors.primary }]}>Filtros</Text>

            <View style={{ height: 8 }} />

            <TextInput
              mode="outlined"
              placeholder="Digite o município"
              value={filtroMunicipio}
              onChangeText={setFiltroMunicipio}
              style={styles.input}
              theme={darkTheme}
              outlineColor={darkTheme.colors.outline}
              activeOutlineColor={darkTheme.colors.primary}
              placeholderTextColor={darkTheme.colors.onSurfaceVariant}
            />

            <View style={styles.filtersRow}>
              <TouchableOpacity style={[styles.smallSelect, { borderColor: darkTheme.colors.outline }]} onPress={() => setModalStatusVisible(true)}>
                <Text style={{ color: filtroStatus ? darkTheme.colors.onSurface : darkTheme.colors.onSurfaceVariant }}>
                  {filtroStatus || 'Status'}
                </Text>
                <IconButton icon="chevron-down" size={20} iconColor={darkTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.smallSelect, { borderColor: darkTheme.colors.outline }]} onPress={() => setModalTipoVisible(true)}>
                <Text style={{ color: filtroTipo ? darkTheme.colors.onSurface : darkTheme.colors.onSurfaceVariant }}>
                  {filtroTipo || 'Tipo'}
                </Text>
                <IconButton icon="chevron-down" size={20} iconColor={darkTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.periodBox, { borderColor: darkTheme.colors.outline }]} onPress={() => setPeriodoModalVisible(true)}>
                <Ionicons name="calendar-outline" size={20} color={darkTheme.colors.onSurfaceVariant} />
                <Text style={{ color: darkTheme.colors.onSurfaceVariant, marginLeft: 8 }}>{periodoTexto}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button mode="outlined" onPress={clearFilters} style={styles.clearButton} labelStyle={{ color: darkTheme.colors.onSurface }}>
                Limpar filtros
              </Button>
              {/* espaço direito reservado caso precise adicionar outro botão */}
              <View style={{ width: 8 }} />
              <Button
                mode="contained"
                onPress={() => {
                  // ação de aplicar já é automática — aqui só fecha teclado ou faz nada
                }}
                style={styles.applyButton}
                labelStyle={{ color: '#fff' }}
              >
                Aplicar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal status */}
      <Modal visible={modalStatusVisible} animationType="slide" transparent onRequestClose={() => setModalStatusVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Selecione o status</Text>
              <IconButton icon="close" size={20} iconColor={darkTheme.colors.onSurface} onPress={() => setModalStatusVisible(false)} />
            </View>
            <FlatList
              data={STATUS_OPTIONS}
              keyExtractor={(s) => s}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setFiltroStatus(item); setModalStatusVisible(false); }} style={styles.modalItem}>
                  <Text style={{ color: darkTheme.colors.onSurface }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal tipo */}
      <Modal visible={modalTipoVisible} animationType="slide" transparent onRequestClose={() => setModalTipoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Selecione o tipo</Text>
              <IconButton icon="close" size={20} iconColor={darkTheme.colors.onSurface} onPress={() => setModalTipoVisible(false)} />
            </View>
            <FlatList
              data={TIPOS}
              keyExtractor={(s) => s}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setFiltroTipo(item); setModalTipoVisible(false); }} style={styles.modalItem}>
                  <Text style={{ color: darkTheme.colors.onSurface }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Periodo modal */}
      <Modal visible={periodoModalVisible} animationType="slide" transparent onRequestClose={() => setPeriodoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Escolha o período</Text>
              <IconButton icon="close" size={20} iconColor={darkTheme.colors.onSurface} onPress={() => setPeriodoModalVisible(false)} />
            </View>

            <View style={{ paddingHorizontal: 12, paddingBottom: 18 }}>
              <Text style={{ color: darkTheme.colors.onSurfaceVariant, marginBottom: 8 }}>Data inicial</Text>
              <TouchableOpacity
                style={[styles.periodSelectRow, { borderColor: darkTheme.colors.outline }]}
                onPress={() => {
                  setPickerTarget('start');
                  setShowDatePicker(true);
                }}
              >
                <Text style={{ color: periodoStart ? darkTheme.colors.onSurface : darkTheme.colors.onSurfaceVariant }}>
                  {periodoStart ? formatShort(periodoStart) : 'Selecionar data inicial'}
                </Text>
                <IconButton icon="calendar" size={20} iconColor={darkTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>

              <Text style={{ color: darkTheme.colors.onSurfaceVariant, marginVertical: 8 }}>Data final</Text>
              <TouchableOpacity
                style={[styles.periodSelectRow, { borderColor: darkTheme.colors.outline }]}
                onPress={() => {
                  setPickerTarget('end');
                  setShowDatePicker(true);
                }}
              >
                <Text style={{ color: periodoEnd ? darkTheme.colors.onSurface : darkTheme.colors.onSurfaceVariant }}>
                  {periodoEnd ? formatShort(periodoEnd) : 'Selecionar data final'}
                </Text>
                <IconButton icon="calendar" size={20} iconColor={darkTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <Button mode="outlined" onPress={() => { setPeriodoStart(null); setPeriodoEnd(null); setPeriodoTexto('Período'); }} labelStyle={{ color: darkTheme.colors.onSurface }}>
                  Limpar
                </Button>
                <Button mode="contained" onPress={applyPeriodo} labelStyle={{ color: '#fff' }}>
                  Aplicar
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker (rendered outside modals for Android/iOS compatibility) */}
      {showDatePicker && (
        <DateTimePicker
          value={pickerTarget === 'start' ? (periodoStart || new Date()) : (periodoEnd || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={(event: any, selectedDate?: Date) => {
            // on Android, event.type === 'dismissed' when canceled
            setShowDatePicker(false);
            if (selectedDate) {
              if (pickerTarget === 'start') {
                setPeriodoStart(selectedDate);
              } else if (pickerTarget === 'end') {
                setPeriodoEnd(selectedDate);
              }
            }
            setPickerTarget(null);
          }}
        />
      )}

      {/* Modal detalhe ocorrência */}
      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Detalhes</Text>
              <IconButton icon="close" size={20} iconColor={darkTheme.colors.onSurface} onPress={() => setSelected(null)} />
            </View>

            {selected && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
                <Text style={{ color: darkTheme.colors.primary, fontWeight: '700', marginBottom: 8 }}>{selected.tipo}</Text>
                <Text style={{ color: darkTheme.colors.onSurfaceVariant }}>Local</Text>
                <Text style={{ color: darkTheme.colors.onSurface, marginBottom: 8 }}>{selected.local}</Text>

                <Text style={{ color: darkTheme.colors.onSurfaceVariant }}>Data</Text>
                <Text style={{ color: darkTheme.colors.onSurface, marginBottom: 8 }}>{selected.data}</Text>

                <Text style={{ color: darkTheme.colors.onSurfaceVariant }}>Status</Text>
                <Text style={{ color: darkTheme.colors.onSurface, marginBottom: 12 }}>{selected.status}</Text>

                <Button mode="contained" onPress={() => { setSelected(null); }} style={{ backgroundColor: darkTheme.colors.primary }}>
                  Fechar
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Aberta':
      return '#FFA726';
    case 'Em Andamento':
      return '#29B6F6';
    case 'Finalizada':
      return '#66BB6A';
    case 'Cancelada':
      return '#EF5350';
    default:
      return darkTheme.colors.onSurface;
  }
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 36,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  legendTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
  },
  statusChip: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filtersCard: {
    marginTop: 12,
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  filtersRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    width: (width - 64) / 3,
    justifyContent: 'space-between',
  },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    width: (width - 64) / 3,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: darkTheme.colors.outline,
    backgroundColor: darkTheme.colors.surface,
  },

  // modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalItem: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  periodSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // detalhe
  detailModal: {
    paddingTop: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 320,
  },

  clearButton: {
    borderColor: darkTheme.colors.outline,
  },
  applyButton: {
    backgroundColor: darkTheme.colors.primary,
  },

  spacing: {
    height: 16,
  },
});