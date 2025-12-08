import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedDrawer from '../components/AnimatedDrawer';
import { useNavigation } from '@react-navigation/native';

const STATUS_OPTIONS = [
  { label: 'Disponível', value: 'disponivel', icon: 'check-circle', color: '#4CAF50' },
  { label: 'Em atendimento', value: 'atendimento', icon: 'fire-truck', color: '#FF9800' },
  { label: 'Em deslocamento', value: 'deslocamento', icon: 'car', color: '#2196F3' },
  { label: 'Fora de serviço', value: 'fora', icon: 'close-circle', color: '#C3002F' },
];

export default function PerfilScreen() {
  const drawerRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Botão de emergência
  const handleEmergencia = () => {
    Alert.alert(
      "Emergência",
      "Deseja acionar o alerta de emergência?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Acionar", style: "destructive", onPress: () => {
            Alert.alert("Alerta enviado para a central!");
          }
        }
      ]
    );
  };

  
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };


  const handleAlterarSenha = () => {
    navigation.navigate('AlterarSenha');
  };

 
  const handleAvatarPress = () => {
   
  };

  return (
    <View style={styles.container}>
      {/* Menu */}
      <TouchableOpacity style={styles.menuIcon} onPress={() => drawerRef.current?.open()}>
        <Icon name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Perfil</Text>

      {/* Botão de Emergência */}
      <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencia}>
        <Icon name="alert" size={28} color="#fff" />
        <Text style={styles.emergencyTxt}>Emergência</Text>
      </TouchableOpacity>

      {/* Perfil */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
          <Avatar.Text 
            size={60} 
            label="C" 
            style={styles.avatar}
            color="#fff"
          />
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Carla Nunes</Text>
          <Text style={styles.role}>Administrador</Text>
        </View>
      </View>

      {/* Status Operacional */}
      <TouchableOpacity style={styles.statusBtn} onPress={() => setShowStatusModal(true)}>
        <Icon name={STATUS_OPTIONS.find(opt => opt.value === status)?.icon || "account"} size={22} color="#fff" />
        <Text style={styles.statusTxt}>
          Status: {STATUS_OPTIONS.find(opt => opt.value === status)?.label}
        </Text>
        <Icon name="chevron-down" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Status */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusModal(false)}>
          <View style={styles.statusModal}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusOption,
                  status === opt.value && { backgroundColor: opt.color + '33' }
                ]}
                onPress={() => {
                  setStatus(opt.value);
                  setShowStatusModal(false);
                }}
              >
                <Icon name={opt.icon} size={22} color={opt.color} />
                <Text style={[styles.statusOptionTxt, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Dados */}
      <View style={styles.dataRow}>
        <View>
          <Text style={styles.dataLabel}>Esquadrão</Text>
          <Text style={styles.dataValue}>0001</Text>
        </View>
        <View style={{marginLeft: 24}}>
          <Text style={styles.dataLabel}>Unidade</Text>
          <Text style={styles.dataValue}>2 Companhia</Text>
        </View>
      </View>

      {/* Relatórios */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Relatórios</Text>
          <Text style={styles.reportItem}>Finalizados: <Text style={styles.bold}>18</Text></Text>
          <Text style={styles.reportItem}>Em aberto: <Text style={styles.bold}>3</Text></Text>
          <Text style={styles.reportItem}>Em andamento: <Text style={styles.bold}>1</Text></Text>
        </Card.Content>
      </Card>

      {/* Alterar Senha */}
      <TouchableOpacity style={styles.changePwdBtn} onPress={handleAlterarSenha}>
        <Icon name="lock-reset" size={22} color="#fff" />
        <Text style={{color:'#fff', marginLeft:8}}>Alterar Senha</Text>
      </TouchableOpacity>

      {/* Sair */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={28} color="#C3002F" />
        <Text style={styles.logoutTxt}>Sair</Text>
      </TouchableOpacity>

      {/* Drawer */}
      <AnimatedDrawer ref={drawerRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232222',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  menuIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 4,
    backgroundColor: '#232222',
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 18,
    marginLeft: 0,
  },
  emergencyBtn:{
    flexDirection:'row',
    alignItems:'center',
    alignSelf:'flex-end',
    backgroundColor:'#C3002F',
    borderRadius:8,
    paddingVertical:6,
    paddingHorizontal:16,
    marginBottom:12
  },
  emergencyTxt:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:17,
    marginLeft:8
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#181818',
  },
  avatar: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    marginLeft: 14,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  role: {
    color: '#bdbdbd',
    fontSize: 13,
  },
  statusBtn:{
    flexDirection:'row',
    alignItems:'center',
    alignSelf:'flex-start',
    backgroundColor:'#35343a',
    borderRadius:8,
    paddingVertical:6,
    paddingHorizontal:16,
    marginBottom:10
  },
  statusTxt:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:15,
    marginLeft:8,
    marginRight:4
  },
  modalOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.4)',
    justifyContent:'center',
    alignItems:'center'
  },
  statusModal:{
    backgroundColor:'#232222',
    borderRadius:12,
    paddingVertical:12,
    width:'80%',
    alignItems:'stretch'
  },
  statusOption:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:10,
    paddingHorizontal:18
  },
  statusOptionTxt:{
    fontWeight:'bold',
    fontSize:16,
    marginLeft:10
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 18,
    marginLeft: 4,
  },
  dataLabel: {
    color: '#bdbdbd',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dataValue: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#35343a',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fff',
    marginVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:16,
    marginBottom:8
  },
  reportItem:{
    color:'#e0e0e0',
    fontSize:14,
    marginBottom:2
  },
  bold:{
    fontWeight:'bold',
    color:'#fff'
  },
  changePwdBtn:{
    flexDirection:'row',
    alignItems:'center',
    alignSelf:'flex-start',
    backgroundColor:'#35343a',
    borderRadius:8,
    paddingVertical:6,
    paddingHorizontal:16,
    marginBottom:10
  },
  logoutBtn:{
    flexDirection:'row',
    alignItems:'center',
    position:'absolute',
    bottom:32,
    left:24,
    borderWidth:1.5,
    borderColor:'#C3002F',
    borderRadius:8,
    paddingVertical:6,
    paddingHorizontal:16,
    backgroundColor:'#232222'
  },
  logoutTxt:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:17,
    marginLeft:8
  }
});