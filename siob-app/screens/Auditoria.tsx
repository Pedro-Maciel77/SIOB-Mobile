import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { Text, Card, Divider, IconButton, Button } from 'react-native-paper';
import { darkTheme } from '../theme/darkTheme';

const { width } = Dimensions.get('window');

// Dados da auditoria
const LOGS_AUDITORIA = [
  { 
    id: 99, 
    name: 'Eduardo Borges', 
    evento: 'Abertura de ocorrência', 
    data: '09/10/26',
    tipo: 'Criação',
    detalhes: 'Nova ocorrência registrada no sistema'
  },
  { 
    id: 56, 
    name: 'José Pereira', 
    evento: 'Registro de atendimento', 
    data: '04/11/25',
    tipo: 'Atualização',
    detalhes: 'Atualização de status da ocorrência'
  },
  { 
    id: 73, 
    name: 'João Lima', 
    evento: 'Usuário criado', 
    data: '01/11/25',
    tipo: 'Criação',
    detalhes: 'Novo usuário cadastrado no sistema'
  },
  { 
    id: 16, 
    name: 'Cláudia Pereira', 
    evento: 'Remoção de usuário', 
    data: '20/05/25',
    tipo: 'Exclusão',
    detalhes: 'Usuário removido do sistema'
  },
  { 
    id: 42, 
    name: 'Mariana Silva', 
    evento: 'Atualização de perfil', 
    data: '15/04/25',
    tipo: 'Atualização',
    detalhes: 'Perfil de usuário atualizado'
  },
  { 
    id: 88, 
    name: 'Carlos Santos', 
    evento: 'Relatório gerado', 
    data: '10/03/25',
    tipo: 'Consulta',
    detalhes: 'Relatório de estatísticas exportado'
  },
  { 
    id: 31, 
    name: 'Ana Oliveira', 
    evento: 'Login no sistema', 
    data: '28/02/25',
    tipo: 'Autenticação',
    detalhes: 'Acesso realizado com sucesso'
  },
  { 
    id: 64, 
    name: 'Roberto Alves', 
    evento: 'Alteração de senha', 
    data: '12/01/25',
    tipo: 'Segurança',
    detalhes: 'Senha do usuário alterada'
  },
];

// Tipos de evento para filtro
const TIPOS_EVENTO = [
  'Todos',
  'Criação',
  'Atualização',
  'Exclusão',
  'Consulta',
  'Autenticação',
  'Segurança'
];

export default function AuditoriaLogs({ navigation }: any) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.7))[0];
  const overlayAnim = useState(new Animated.Value(0))[0];
  
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('Todos');
  const [logsFiltrados, setLogsFiltrados] = useState(LOGS_AUDITORIA);

  // Função para abrir/fechar o drawer
  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width * 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    let filtrados = LOGS_AUDITORIA;

    // Filtro por tipo
    if (tipoSelecionado !== 'Todos') {
      filtrados = filtrados.filter(log => log.tipo === tipoSelecionado);
    }

    // Filtro por usuário
    if (filtroUsuario.trim() !== '') {
      filtrados = filtrados.filter(log => 
        log.name.toLowerCase().includes(filtroUsuario.toLowerCase())
      );
    }

    // Filtro por evento
    if (filtroEvento.trim() !== '') {
      filtrados = filtrados.filter(log => 
        log.evento.toLowerCase().includes(filtroEvento.toLowerCase())
      );
    }

    // Filtro por data
    if (filtroData.trim() !== '') {
      filtrados = filtrados.filter(log => 
        log.data.includes(filtroData)
      );
    }

    setLogsFiltrados(filtrados);
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltroUsuario('');
    setFiltroEvento('');
    setFiltroData('');
    setTipoSelecionado('Todos');
    setLogsFiltrados(LOGS_AUDITORIA);
  };

  // Renderizar item da tabela
  const renderLogItem = ({ item }: any) => (
    <View style={[styles.tableRow, { backgroundColor: darkTheme.colors.surface }]}>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.id}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.name}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.evento}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.data}
        </Text>
      </View>
    </View>
  );

  // Renderizar tipo de filtro
  const renderTipoFiltro = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.tipoFiltroButton,
        tipoSelecionado === item && { backgroundColor: darkTheme.colors.primary }
      ]}
      onPress={() => {
        setTipoSelecionado(item);
        setTimeout(aplicarFiltros, 100);
      }}
    >
      <Text style={[
        styles.tipoFiltroText,
        tipoSelecionado === item 
          ? { color: '#FFFFFF' } 
          : { color: darkTheme.colors.onSurface }
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.colors.background }}>
      {/* Overlay quando o drawer está aberto */}
      {drawerVisible && (
        <Animated.View 
          style={[
            styles.overlay, 
            { 
              opacity: overlayAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.7)' 
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={toggleDrawer}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Drawer/Sidebar */}
      <Animated.View 
        style={[
          styles.drawer,
          { 
            transform: [{ translateX: slideAnim }],
            backgroundColor: darkTheme.colors.surface,
            borderRightColor: darkTheme.colors.outline
          }
        ]}
      >
        <View style={styles.drawerHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: darkTheme.colors.primary }]}>
              <Text style={styles.avatarText}>CN</Text>
            </View>
            <View>
              <Text style={[styles.userName, { color: darkTheme.colors.onSurface }]}>
                Carla Nunes
              </Text>
              <Text style={[styles.userRole, { color: darkTheme.colors.onSurfaceVariant }]}>
                Administrador
              </Text>
            </View>
          </View>
          <IconButton
            icon="close"
            iconColor={darkTheme.colors.onSurface}
            size={24}
            onPress={toggleDrawer}
            style={styles.closeButton}
          />
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleDrawer();
              navigation.navigate('Ocorrencias');
            }}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.onSurface }]}>
              Ocorrências
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleDrawer();
              navigation.navigate('Usuarios');
            }}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.onSurface }]}>
              Usuários
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleDrawer();
              navigation.navigate('Relatorios');
            }}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.onSurface }]}>
              Relatórios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.activeMenuItem]}
            onPress={toggleDrawer}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.primary }]}>
              Auditoria
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.drawerFooter}>
          <Button
            mode="outlined"
            icon="logout"
            onPress={() => {
              toggleDrawer();
              // Adicionar lógica de logout
            }}
            style={[styles.logoutButton, { borderColor: darkTheme.colors.error }]}
            labelStyle={{ color: darkTheme.colors.error }}
          >
            Sair
          </Button>
        </View>
      </Animated.View>

      {/* Conteúdo principal */}
      <View style={{ flex: 1 }}>
        {/* Header com botão do menu */}
        <View style={[styles.header, { backgroundColor: darkTheme.colors.surface }]}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <View style={styles.hamburgerIcon}>
              <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
              <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
              <View style={[styles.hamburgerLine, { backgroundColor: darkTheme.colors.onSurface }]} />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: darkTheme.colors.onSurface }]}>
            Auditoria & Logs
          </Text>
          
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Conteúdo da auditoria */}
        <ScrollView 
          style={[styles.container, { backgroundColor: darkTheme.colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Seção de Filtros */}
          <Card style={[styles.cardSection, { backgroundColor: darkTheme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.sectionTitle, { color: darkTheme.colors.primary }]}>
                Filtros de Busca
              </Text>

              {/* Filtros por tipo */}
              <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface }]}>
                Tipo de Evento
              </Text>
              <FlatList
                data={TIPOS_EVENTO}
                renderItem={renderTipoFiltro}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tiposList}
              />

              {/* Filtro de usuário */}
              <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface }]}>
                Usuário
              </Text>
              <TextInput
                placeholder="Digitar o nome do usuário"
                value={filtroUsuario}
                onChangeText={setFiltroUsuario}
                style={[styles.input, { 
                  backgroundColor: darkTheme.colors.background,
                  color: darkTheme.colors.onSurface,
                  borderColor: darkTheme.colors.outline
                }]}
                placeholderTextColor={darkTheme.colors.onSurfaceVariant}
              />

              {/* Filtro de evento */}
              <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface }]}>
                Evento
              </Text>
              <TextInput
                placeholder="Relacionar o evento"
                value={filtroEvento}
                onChangeText={setFiltroEvento}
                style={[styles.input, { 
                  backgroundColor: darkTheme.colors.background,
                  color: darkTheme.colors.onSurface,
                  borderColor: darkTheme.colors.outline
                }]}
                placeholderTextColor={darkTheme.colors.onSurfaceVariant}
              />

              {/* Filtro de data */}
              <Text style={[styles.subTitle, { color: darkTheme.colors.onSurface }]}>
                Data
              </Text>
              <TextInput
                placeholder="DD/MM/AA"
                value={filtroData}
                onChangeText={setFiltroData}
                style={[styles.input, { 
                  backgroundColor: darkTheme.colors.background,
                  color: darkTheme.colors.onSurface,
                  borderColor: darkTheme.colors.outline
                }]}
                placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                keyboardType="numbers-and-punctuation"
              />

              {/* Botões de ação dos filtros */}
              <View style={styles.filtroButtons}>
                <Button
                  mode="contained"
                  onPress={aplicarFiltros}
                  style={[styles.filtroButton, { backgroundColor: darkTheme.colors.primary }]}
                >
                  Aplicar Filtros
                </Button>
                <Button
                  mode="outlined"
                  onPress={limparFiltros}
                  style={[styles.filtroButton, { borderColor: darkTheme.colors.outline }]}
                  labelStyle={{ color: darkTheme.colors.onSurface }}
                >
                  Limpar
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Tabela de Logs */}
          <Card style={[styles.cardSection, { backgroundColor: darkTheme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    ID
                  </Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    Nome
                  </Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    Evento
                  </Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    Data
                  </Text>
                </View>
              </View>

              <Divider style={[styles.tableDivider, { backgroundColor: darkTheme.colors.outline }]} />

              {logsFiltrados.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: darkTheme.colors.onSurfaceVariant }]}>
                    Nenhum log encontrado com os filtros aplicados
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={logsFiltrados}
                  renderItem={renderLogItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}

              {/* Informações do resultado */}
              <View style={styles.resultInfo}>
                <Text style={[styles.resultText, { color: darkTheme.colors.onSurfaceVariant }]}>
                  Mostrando {logsFiltrados.length} de {LOGS_AUDITORIA.length} registros
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Botões de ação */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="download"
              style={[styles.actionButton, { backgroundColor: darkTheme.colors.primary }]}
              onPress={() => {
                // Lógica para exportar logs
                console.log('Exportar logs');
              }}
            >
              Exportar Logs
            </Button>
            <Button
              mode="outlined"
              icon="refresh"
              style={[styles.actionButton, { borderColor: darkTheme.colors.primary }]}
              labelStyle={{ color: darkTheme.colors.primary }}
              onPress={limparFiltros}
            >
              Atualizar
            </Button>
          </View>

          <View style={styles.spacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos do drawer/sidebar
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.7,
    zIndex: 999,
    borderRightWidth: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    opacity: 0.8,
  },
  closeButton: {
    margin: 0,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activeMenuItem: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 6,
  },

  // Header principal
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    fontWeight: '600',
  },
  headerRightPlaceholder: {
    width: 40,
  },

  // Estilos do conteúdo
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  cardSection: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 0,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },

  // Estilos para filtros
  tiposList: {
    marginBottom: 16,
  },
  tipoFiltroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  tipoFiltroText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filtroButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  filtroButton: {
    flex: 1,
    marginHorizontal: 4,
  },

  // Estilos da tabela
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableDivider: {
    height: 1,
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Estados vazios
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Informações do resultado
  resultInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 12,
  },

  // Botões de ação
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },

  // Espaçamento
  spacing: {
    height: 30,
  },
});