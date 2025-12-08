import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput, Button, Card, Divider, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { darkTheme } from '../theme/darkTheme';
import AnimatedDrawer from '../components/AnimatedDrawer';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string | null;
}

// Tipos de ocorrência disponíveis
const TIPOS_OCORRENCIA = [
  { id: 1, nome: 'Acidente' },
  { id: 2, nome: 'Incêndio' },
  { id: 3, nome: 'Resgate' },
  { id: 4, nome: 'Desastre Natural' },
  { id: 5, nome: 'Emergência Médica' },
];

// Status da ocorrência
const STATUS_OCORRENCIA = [
  { id: 1, nome: 'Aberta', cor: '#FFA726' },
  { id: 2, nome: 'Em Andamento', cor: '#29B6F6' },
  { id: 3, nome: 'Fechada', cor: '#66BB6A' },
  { id: 4, nome: 'Cancelada', cor: '#EF5350' },
];

export default function EnviarRelatorio({ navigation }: any) {
  const drawerRef = useRef<any>(null);

  // Estados do formulário (municipio e bairro removidos)
  const [nomeVitima, setNomeVitima] = useState('');
  const [viatura, setViatura] = useState('');
  const [contatoVitima, setContatoVitima] = useState('');
  const [descricao, setDescricao] = useState('');

  // Seleções
  const [tipoOcorrencia, setTipoOcorrencia] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Datas e horário
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);

  // Imagens / localização
  const [fotoOcorrencia, setFotoOcorrencia] = useState<string | null>(null);
  const [imagensAnexadas, setImagensAnexadas] = useState<string[]>([]);
  const [localizacao, setLocalizacao] = useState<LocationData | null>(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Modais
  const [modalTipoVisible, setModalTipoVisible] = useState(false);
  const [modalStatusVisible, setModalStatusVisible] = useState(false);

  // Solicitar permissões e obter localização inicial (opcional)
  useEffect(() => {
    (async () => {
      try {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus === 'granted');

        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasMediaPermission(mediaStatus === 'granted');

        if (locationStatus === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          // tentar preencher endereço inicial
          setLocalizacao({ ...coords, address: null });
          try {
            const addresses = await Location.reverseGeocodeAsync(coords);
            if (addresses && addresses.length > 0) {
              const addr = buildAddressString(addresses[0]);
              setEndereco(addr);
              setLocalizacao({ ...coords, address: addr });
            }
          } catch (e) {
            console.warn('Reverse geocode inicial falhou', e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Helper para formar string de endereço a partir do objeto do expo-location
  const buildAddressString = (addr: Location.LocationGeocodedAddress): string => {
    const parts = [
      addr.name,
      addr.street,
      addr.subregion || addr.city,
      addr.region,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Formatação de data/hora
  const formatarData = (date: Date) => {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (date: Date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  // Seleções diversas
  const selecionarTipoOcorrencia = (tipo: string) => {
    setTipoOcorrencia(tipo);
    setModalTipoVisible(false);
  };

  const selecionarStatus = (status: string) => {
    setStatus(status);
    setModalStatusVisible(false);
  };

  // Imagens
  const selecionarFoto = async () => {
    if (!hasMediaPermission) {
      Alert.alert('Permissão necessária', 'Precisa conceder permissão para acessar a galeria');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0].uri) {
        setFotoOcorrencia(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
      console.error(error);
    }
  };

  const anexarImagem = async () => {
    if (!hasMediaPermission) {
      Alert.alert('Permissão necessária', 'Precisa conceder permissão para acessar a galeria');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        const novasImagens = result.assets.map((asset) => asset.uri);
        setImagensAnexadas([...imagensAnexadas, ...novasImagens]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar as imagens');
      console.error(error);
    }
  };

  // Obter localização atual e preencher endereço automaticamente
  const preencherEnderecoComMinhaLocalizacao = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Permissão necessária', 'Ative permissão de localização nas configurações');
      return;
    }
    try {
      setLoadingAddress(true);
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      try {
        const addresses = await Location.reverseGeocodeAsync(coords);
        if (addresses && addresses.length > 0) {
          const addr = buildAddressString(addresses[0]);
          setEndereco(addr);
          setLocalizacao({ ...coords, address: addr });
        } else {
          setEndereco('');
          setLocalizacao({ ...coords, address: null });
        }
      } catch (e) {
        console.warn('Reverse geocode falhou', e);
        setEndereco('');
        setLocalizacao({ ...coords, address: null });
      } finally {
        setLoadingAddress(false);
      }
    } catch (err) {
      setLoadingAddress(false);
      Alert.alert('Erro', 'Não foi possível obter sua localização agora');
      console.error(err);
    }
  };

  // Remover imagem anexada
  const removerImagem = (index: number) => {
    const novasImagens = [...imagensAnexadas];
    novasImagens.splice(index, 1);
    setImagensAnexadas(novasImagens);
  };

  // Enviar relatório (validação sem municipio/bairro)
  const enviarRelatorio = async () => {
    if (!nomeVitima || !tipoOcorrencia || !status) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (*)');
      return;
    }

    const relatorioData = {
      nomeVitima,
      tipoOcorrencia,
      dataOcorrencia: formatarData(dataSelecionada),
      horaOcorrencia: formatarHora(horaSelecionada),
      viatura,
      status,
      contatoVitima,
      descricao,
      fotoOcorrencia,
      imagensAnexadas,
      localizacao: {
        latitude: localizacao?.latitude,
        longitude: localizacao?.longitude,
        address: endereco || localizacao?.address || null,
      },
      dataEnvio: new Date().toISOString(),
    };

    console.log('Dados do relatório:', relatorioData);

    Alert.alert('Sucesso', 'Relatório enviado com sucesso!');
    navigation.goBack();
  };

  // Render item tipo/status
  const renderTipoItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.tipoItem, tipoOcorrencia === item.nome && { backgroundColor: darkTheme.colors.primary + '20' }]} onPress={() => selecionarTipoOcorrencia(item.nome)}>
      <Text style={[styles.tipoItemText, { color: tipoOcorrencia === item.nome ? darkTheme.colors.primary : darkTheme.colors.onSurface }]}>{item.nome}</Text>
      {tipoOcorrencia === item.nome && <IconButton icon="check" size={20} iconColor={darkTheme.colors.primary} />}
    </TouchableOpacity>
  );

  const renderStatusItem = ({ item }: any) => (
    <TouchableOpacity style={[styles.statusItem, status === item.nome && { backgroundColor: item.cor + '20' }]} onPress={() => selecionarStatus(item.nome)}>
      <View style={[styles.statusDot, { backgroundColor: item.cor }]} />
      <Text style={[styles.statusItemText, { color: status === item.nome ? darkTheme.colors.onSurface : darkTheme.colors.onSurfaceVariant }]}>{item.nome}</Text>
      {status === item.nome && <IconButton icon="check" size={20} iconColor={item.cor} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.colors.background }}>
      {/* Drawer reutilizável */}
      <AnimatedDrawer ref={drawerRef} />

      {/* Header com hambúrguer */}
      <View style={[styles.header, { backgroundColor: darkTheme.colors.surface }]}>
        <TouchableOpacity onPress={() => drawerRef.current?.toggle?.()} style={styles.menuButton}>
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: darkTheme.colors.onSurface }]}>Enviar relatório</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={[styles.container, { backgroundColor: darkTheme.colors.background }]} showsVerticalScrollIndicator={false}>
        <Card style={[styles.cardSection, { backgroundColor: darkTheme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            {/* Data da ocorrência (agora ocupa a linha superior) */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Data da ocorrência</Text>
              <TouchableOpacity style={[styles.selectButton, { borderColor: darkTheme.colors.outline }]} onPress={() => setMostrarDatePicker(true)}>
                <Text style={[styles.selectButtonText, { color: darkTheme.colors.onSurface }]}>📅 {formatarData(dataSelecionada)}</Text>
                <IconButton icon="calendar" size={20} iconColor={darkTheme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Tipo</Text>
                <TouchableOpacity style={[styles.selectButton, { borderColor: tipoOcorrencia ? darkTheme.colors.primary : darkTheme.colors.outline }]} onPress={() => setModalTipoVisible(true)}>
                  <Text style={[styles.selectButtonText, { color: tipoOcorrencia ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant }]}>{tipoOcorrencia || 'Selecione o tipo de ocorrência'}</Text>
                  <IconButton icon="chevron-down" size={20} iconColor={tipoOcorrencia ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={{ width: 140 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Status</Text>
                <TouchableOpacity style={[styles.selectButton, { borderColor: status ? darkTheme.colors.primary : darkTheme.colors.outline }]} onPress={() => setModalStatusVisible(true)}>
                  <Text style={[styles.selectButtonText, { color: status ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant }]}>{status || 'Selecione o status'}</Text>
                  <IconButton icon="chevron-down" size={20} iconColor={status ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Nome da vítima *</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Digite o nome da vítima"
                  value={nomeVitima}
                  onChangeText={setNomeVitima}
                  style={styles.input}
                  theme={darkTheme}
                  outlineColor={darkTheme.colors.outline}
                  activeOutlineColor={darkTheme.colors.primary}
                  placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                />
              </View>

              <View style={{ width: 140 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Viatura</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Digite o número"
                  value={viatura}
                  onChangeText={setViatura}
                  style={styles.input}
                  theme={darkTheme}
                  outlineColor={darkTheme.colors.outline}
                  activeOutlineColor={darkTheme.colors.primary}
                  placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Contato da vítima</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Digite o contato"
                  value={contatoVitima}
                  onChangeText={setContatoVitima}
                  style={styles.input}
                  theme={darkTheme}
                  outlineColor={darkTheme.colors.outline}
                  activeOutlineColor={darkTheme.colors.primary}
                  placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ width: 140 }}>
                <Text style={[styles.sectionTitle, { color: darkTheme.colors.onSurface }]}>Horário</Text>
                <TouchableOpacity style={[styles.selectButton, { borderColor: darkTheme.colors.outline }]} onPress={() => setMostrarTimePicker(true)}>
                  <Text style={[styles.selectButtonText, { color: darkTheme.colors.onSurface }]}>⏰ {formatarHora(horaSelecionada)}</Text>
                  <IconButton icon="clock" size={20} iconColor={darkTheme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Imagens */}
            <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface, marginTop: 8 }]}>Imagens</Text>
            <Button
              mode="outlined"
              icon={fotoOcorrencia ? 'check' : 'camera'}
              style={[styles.outlinedButton, { borderColor: darkTheme.colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, { color: darkTheme.colors.primary }]}
              theme={darkTheme}
              onPress={selecionarFoto}
            >
              {fotoOcorrencia ? 'Foto selecionada' : 'Enviar imagens da ocorrência'}
            </Button>

            <Button
              mode="outlined"
              icon="image"
              style={[styles.outlinedButton, { borderColor: darkTheme.colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, { color: darkTheme.colors.primary }]}
              theme={darkTheme}
              onPress={anexarImagem}
            >
              Anexar outras imagens ({imagensAnexadas.length})
            </Button>

            {/* Endereço (campo único) */}
            <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface, marginTop: 8 }]}>Endereço</Text>

            {loadingAddress ? (
              <ActivityIndicator color={darkTheme.colors.primary} />
            ) : (
              <>
                <TextInput
                  mode="outlined"
                  label="Endereço"
                  placeholder="Digite o endereço ou use 'Usar minha localização'"
                  value={endereco || ''}
                  onChangeText={(text) => {
                    setEndereco(text);
                    setLocalizacao((prev) => (prev ? { ...prev, address: text } : { address: text }));
                  }}
                  style={styles.addressInput}
                  theme={darkTheme}
                  outlineColor={darkTheme.colors.outline}
                  activeOutlineColor={darkTheme.colors.primary}
                  placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                />

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Button
                    mode="outlined"
                    icon="crosshairs-gps"
                    onPress={preencherEnderecoComMinhaLocalizacao}
                    style={[styles.mapButton, { borderColor: darkTheme.colors.primary }]}
                    labelStyle={{ color: darkTheme.colors.primary }}
                  >
                    Usar minha localização
                  </Button>

                  <View style={{ width: 8 }} />

                  <Button
                    mode="text"
                    onPress={() => {
                      setEndereco('');
                      setLocalizacao(null);
                    }}
                    labelStyle={{ color: darkTheme.colors.onSurfaceVariant }}
                  >
                    Limpar
                  </Button>
                </View>
              </>
            )}

            <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface, marginTop: 12 }]}>Descrição do relatório</Text>
            <TextInput
              mode="outlined"
              placeholder="Digite a descrição aqui"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={6}
              style={styles.textAreaLarge}
              theme={darkTheme}
              outlineColor={darkTheme.colors.outline}
              activeOutlineColor={darkTheme.colors.primary}
              placeholderTextColor={darkTheme.colors.onSurfaceVariant}
            />

            <View style={{ height: 10 }} />

            <Button
              mode="contained"
              onPress={enviarRelatorio}
              style={[styles.primaryButton, { backgroundColor: darkTheme.colors.primary }]}
              contentStyle={styles.primaryButtonContent}
              theme={darkTheme}
              disabled={!nomeVitima || !tipoOcorrencia || !status}
            >
              Enviar relatório
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.spacing} />
      </ScrollView>

      {/* Modais de seleção tipo/status */}
      <Modal visible={modalTipoVisible} animationType="slide" transparent onRequestClose={() => setModalTipoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Selecione o Tipo de Ocorrência</Text>
              <IconButton icon="close" size={24} onPress={() => setModalTipoVisible(false)} iconColor={darkTheme.colors.onSurface} />
            </View>
            <FlatList data={TIPOS_OCORRENCIA} renderItem={renderTipoItem} keyExtractor={(item) => item.id.toString()} style={styles.modalList} />
          </View>
        </View>
      </Modal>

      <Modal visible={modalStatusVisible} animationType="slide" transparent onRequestClose={() => setModalStatusVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>Selecione o Status</Text>
              <IconButton icon="close" size={24} onPress={() => setModalStatusVisible(false)} iconColor={darkTheme.colors.onSurface} />
            </View>
            <FlatList data={STATUS_OCORRENCIA} renderItem={renderStatusItem} keyExtractor={(item) => item.id.toString()} style={styles.modalList} />
          </View>
        </View>
      </Modal>

      {/* Pickers */}
      {mostrarDatePicker && (
        <DateTimePicker
          value={dataSelecionada}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setMostrarDatePicker(false);
            if (selectedDate) setDataSelecionada(selectedDate);
          }}
        />
      )}

      {mostrarTimePicker && (
        <DateTimePicker
          value={horaSelecionada}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setMostrarTimePicker(false);
            if (selectedTime) setHoraSelecionada(selectedTime);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuButton: {
    padding: 8,
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightPlaceholder: { width: 40 },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardSection: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 0,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  input: {
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  textAreaLarge: {
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: 'transparent',
  },
  outlinedButton: {
    borderWidth: 1,
    borderRadius: 6,
    marginVertical: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },

  // Adições pedidas (evita erro)
  selectButtonText: {
    fontSize: 14,
    flex: 1,
  },
  mapButton: {
    marginVertical: 4,
    borderRadius: 6,
  },

  addressInput: {
    marginBottom: 6,
  },

  // modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.6,
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
  modalList: {
    paddingHorizontal: 12,
  },

  // seleção
  tipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tipoItemText: { fontSize: 16 },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusItemText: { fontSize: 16, marginLeft: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  spacing: { height: 40 },

  // botões
  primaryButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  primaryButtonContent: {
    paddingVertical: 10,
  },
});