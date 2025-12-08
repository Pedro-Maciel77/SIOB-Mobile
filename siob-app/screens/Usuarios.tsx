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
  Modal,
} from 'react-native';
import { Text, Card, Divider, IconButton, Button, TextInput as PaperInput } from 'react-native-paper';
import { darkTheme } from '../theme/darkTheme';

const { width } = Dimensions.get('window');

// Dados de usuários
const USUARIOS = [
  { 
    id: 34, 
    nome: 'Maria Silva', 
    email: 'maria.silva@gmail.com', 
    cargo: 'ADM',
    status: 'Ativo',
    dataCadastro: '15/03/2024'
  },
  { 
    id: 78, 
    nome: 'Pedro Santos', 
    email: 'pedro.santos@gmail.com', 
    cargo: 'Analista',
    status: 'Ativo',
    dataCadastro: '22/02/2024'
  },
  { 
    id: 110, 
    nome: 'Ana Oliveira', 
    email: 'ana.oliveira@gmail.com', 
    cargo: 'Supervisor',
    status: 'Inativo',
    dataCadastro: '10/01/2024'
  },
  { 
    id: 3, 
    nome: 'Carlos Lima', 
    email: 'carlos.lima@gmail.com', 
    cargo: 'Analista',
    status: 'Ativo',
    dataCadastro: '05/04/2024'
  },
  { 
    id: 56, 
    nome: 'Julia Costa', 
    email: 'julia.costa@gmail.com', 
    cargo: 'Gerente',
    status: 'Ativo',
    dataCadastro: '18/03/2024'
  },
  { 
    id: 89, 
    nome: 'Roberto Alves', 
    email: 'roberto.alves@gmail.com', 
    cargo: 'ADM',
    status: 'Ativo',
    dataCadastro: '30/01/2024'
  },
  { 
    id: 12, 
    nome: 'Fernanda Rocha', 
    email: 'fernanda.rocha@gmail.com', 
    cargo: 'Analista',
    status: 'Inativo',
    dataCadastro: '12/02/2024'
  },
  { 
    id: 45, 
    nome: 'Lucas Pereira', 
    email: 'lucas.pereira@gmail.com', 
    cargo: 'Supervisor',
    status: 'Ativo',
    dataCadastro: '25/03/2024'
  },
];

// Cargos disponíveis
const CARGOS = ['ADM', 'Analista', 'Supervisor', 'Gerente', 'Operador'];

// Status disponíveis
const STATUS = ['Ativo', 'Inativo'];

export default function GestaoUsuarios({ navigation }: any) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-width * 0.7))[0];
  const overlayAnim = useState(new Animated.Value(0))[0];
  
  const [busca, setBusca] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState(USUARIOS);
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  
  // Estado para novo usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    cargo: '',
    senha: '',
    confirmarSenha: '',
  });

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

  // Função para buscar usuários
  const buscarUsuarios = (texto: string) => {
    setBusca(texto);
    if (texto.trim() === '') {
      setUsuariosFiltrados(USUARIOS);
    } else {
      const filtrados = USUARIOS.filter(usuario =>
        usuario.nome.toLowerCase().includes(texto.toLowerCase()) ||
        usuario.email.toLowerCase().includes(texto.toLowerCase()) ||
        usuario.cargo.toLowerCase().includes(texto.toLowerCase())
      );
      setUsuariosFiltrados(filtrados);
    }
  };

  // Função para abrir modal de edição
  const abrirEditarUsuario = (usuario: any) => {
    setUsuarioSelecionado(usuario);
    setModalEditarUsuario(true);
  };

  // Função para deletar usuário
  const deletarUsuario = (id: number) => {
    setUsuariosFiltrados(usuariosFiltrados.filter(user => user.id !== id));
    // Em uma aplicação real, aqui você faria uma chamada à API
  };

  // Função para adicionar novo usuário
  const adicionarUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.cargo || !novoUsuario.senha) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (novoUsuario.senha !== novoUsuario.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    const novoId = Math.max(...USUARIOS.map(u => u.id)) + 1;
    const novoUsuarioObj = {
      id: novoId,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      cargo: novoUsuario.cargo,
      status: 'Ativo',
      dataCadastro: new Date().toLocaleDateString('pt-BR')
    };

    // Aqui você adicionaria à API
    console.log('Novo usuário:', novoUsuarioObj);
    
    setModalNovoUsuario(false);
    setNovoUsuario({
      nome: '',
      email: '',
      cargo: '',
      senha: '',
      confirmarSenha: '',
    });
    
    // Atualizar lista local
    setUsuariosFiltrados([...usuariosFiltrados, novoUsuarioObj]);
  };

  // Renderizar item da tabela
  const renderUsuarioItem = ({ item }: any) => (
    <View style={[styles.tableRow, { backgroundColor: darkTheme.colors.surface }]}>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.id}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.nome}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.cellText, { color: darkTheme.colors.onSurface }]}>
          {item.email}
        </Text>
      </View>
      <View style={styles.tableCell}>
        <View style={[
          styles.cargoBadge,
          { backgroundColor: getCargoColor(item.cargo) }
        ]}>
          <Text style={styles.cargoText}>
            {item.cargo}
          </Text>
        </View>
      </View>
      <View style={styles.actionsCell}>
        <IconButton
          icon="pencil"
          size={18}
          iconColor={darkTheme.colors.primary}
          onPress={() => abrirEditarUsuario(item)}
        />
        <IconButton
          icon="delete"
          size={18}
          iconColor="#EF5350"
          onPress={() => deletarUsuario(item.id)}
        />
      </View>
    </View>
  );

  // Função para obter cor do cargo
  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'ADM': return '#E53935';
      case 'Gerente': return '#7B1FA2';
      case 'Supervisor': return '#1976D2';
      case 'Analista': return '#388E3C';
      default: return '#757575';
    }
  };

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
            style={[styles.menuItem, styles.activeMenuItem]}
            onPress={toggleDrawer}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.primary }]}>
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
            style={styles.menuItem}
            onPress={() => {
              toggleDrawer();
              navigation.navigate('Auditoria');
            }}
          >
            <Text style={[styles.menuItemText, { color: darkTheme.colors.onSurface }]}>
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
            Gestão de Usuários
          </Text>
          
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Conteúdo da gestão de usuários */}
        <ScrollView 
          style={[styles.container, { backgroundColor: darkTheme.colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Barra de busca e ações */}
          <Card style={[styles.cardSection, { backgroundColor: darkTheme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Buscar usuário"
                  value={busca}
                  onChangeText={buscarUsuarios}
                  style={[styles.searchInput, { 
                    backgroundColor: darkTheme.colors.background,
                    color: darkTheme.colors.onSurface,
                    borderColor: darkTheme.colors.outline
                  }]}
                  placeholderTextColor={darkTheme.colors.onSurfaceVariant}
                />
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => setModalNovoUsuario(true)}
                  style={[styles.addButton, { backgroundColor: darkTheme.colors.primary }]}
                >
                  Novo Usuário
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Tabela de Usuários */}
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
                    Email
                  </Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    Cargo
                  </Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={[styles.headerText, { color: darkTheme.colors.primary }]}>
                    Ações
                  </Text>
                </View>
              </View>

              <Divider style={[styles.tableDivider, { backgroundColor: darkTheme.colors.outline }]} />

              {usuariosFiltrados.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: darkTheme.colors.onSurfaceVariant }]}>
                    Nenhum usuário encontrado
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={usuariosFiltrados}
                  renderItem={renderUsuarioItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}

              {/* Informações do resultado */}
              <View style={styles.resultInfo}>
                <Text style={[styles.resultText, { color: darkTheme.colors.onSurfaceVariant }]}>
                  {usuariosFiltrados.length} usuário(s) encontrado(s)
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Estatísticas */}
          <Card style={[styles.cardSection, { backgroundColor: darkTheme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.sectionTitle, { color: darkTheme.colors.primary }]}>
                Estatísticas
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: darkTheme.colors.primary }]}>
                    {USUARIOS.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: darkTheme.colors.onSurfaceVariant }]}>
                    Total de Usuários
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                    {USUARIOS.filter(u => u.status === 'Ativo').length}
                  </Text>
                  <Text style={[styles.statLabel, { color: darkTheme.colors.onSurfaceVariant }]}>
                    Usuários Ativos
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#EF5350' }]}>
                    {USUARIOS.filter(u => u.status === 'Inativo').length}
                  </Text>
                  <Text style={[styles.statLabel, { color: darkTheme.colors.onSurfaceVariant }]}>
                    Usuários Inativos
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.spacing} />
        </ScrollView>
      </View>

      {/* Modal para Novo Usuário */}
      <Modal
        visible={modalNovoUsuario}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalNovoUsuario(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>
                Novo Usuário
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalNovoUsuario(false)}
                iconColor={darkTheme.colors.onSurface}
              />
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <PaperInput
                label="Nome completo *"
                value={novoUsuario.nome}
                onChangeText={(text) => setNovoUsuario({...novoUsuario, nome: text})}
                style={styles.modalInput}
                theme={darkTheme}
                mode="outlined"
              />
              
              <PaperInput
                label="Email *"
                value={novoUsuario.email}
                onChangeText={(text) => setNovoUsuario({...novoUsuario, email: text})}
                style={styles.modalInput}
                theme={darkTheme}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.modalSelectContainer}>
                <Text style={[styles.modalLabel, { color: darkTheme.colors.onSurfaceVariant }]}>
                  Cargo *
                </Text>
                <View style={styles.cargosContainer}>
                  {CARGOS.map((cargo) => (
                    <TouchableOpacity
                      key={cargo}
                      style={[
                        styles.cargoOption,
                        novoUsuario.cargo === cargo && { 
                          backgroundColor: getCargoColor(cargo),
                          borderColor: getCargoColor(cargo)
                        }
                      ]}
                      onPress={() => setNovoUsuario({...novoUsuario, cargo})}
                    >
                      <Text style={[
                        styles.cargoOptionText,
                        novoUsuario.cargo === cargo && { color: '#FFFFFF' }
                      ]}>
                        {cargo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <PaperInput
                label="Senha *"
                value={novoUsuario.senha}
                onChangeText={(text) => setNovoUsuario({...novoUsuario, senha: text})}
                style={styles.modalInput}
                theme={darkTheme}
                mode="outlined"
                secureTextEntry
              />
              
              <PaperInput
                label="Confirmar Senha *"
                value={novoUsuario.confirmarSenha}
                onChangeText={(text) => setNovoUsuario({...novoUsuario, confirmarSenha: text})}
                style={styles.modalInput}
                theme={darkTheme}
                mode="outlined"
                secureTextEntry
              />
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setModalNovoUsuario(false)}
                style={[styles.modalButton, { borderColor: darkTheme.colors.outline }]}
                labelStyle={{ color: darkTheme.colors.onSurface }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={adicionarUsuario}
                style={[styles.modalButton, { backgroundColor: darkTheme.colors.primary }]}
              >
                Criar Usuário
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Usuário */}
      <Modal
        visible={modalEditarUsuario}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditarUsuario(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: darkTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: darkTheme.colors.onSurface }]}>
                Editar Usuário
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalEditarUsuario(false)}
                iconColor={darkTheme.colors.onSurface}
              />
            </View>
            
            {usuarioSelecionado && (
              <View style={styles.modalBody}>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  ID: {usuarioSelecionado.id}
                </Text>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  Nome: {usuarioSelecionado.nome}
                </Text>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  Email: {usuarioSelecionado.email}
                </Text>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  Cargo: {usuarioSelecionado.cargo}
                </Text>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  Status: {usuarioSelecionado.status}
                </Text>
                <Text style={[styles.userInfoText, { color: darkTheme.colors.onSurface }]}>
                  Data de Cadastro: {usuarioSelecionado.dataCadastro}
                </Text>
              </View>
            )}
            
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setModalEditarUsuario(false)}
                style={[styles.modalButton, { backgroundColor: darkTheme.colors.primary }]}
              >
                Fechar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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

  // Barra de busca
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 12,
  },
  addButton: {
    borderRadius: 6,
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
  actionsCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
  },
  cargoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  cargoText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
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

  // Estatísticas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Espaçamento
  spacing: {
    height: 30,
  },

  // Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  modalSelectContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  cargosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cargoOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  cargoOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userInfoText: {
    fontSize: 14,
    marginBottom: 8,
  },
});