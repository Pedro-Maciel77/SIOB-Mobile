import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { darkTheme } from '../theme/darkTheme'; // ajuste o path se necessário

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEntrar = async () => {
    setLoading(true);
    // aqui você faria autenticação real (API)
    setTimeout(() => {
      setLoading(false);
      // navegar para a tela principal (ajuste o nome da rota)
      navigation.replace('Relatorios');
    }, 900);
  };

  const handleEsqueciSenha = () => {
    // navegar para tela de recuperação de senha ou abrir modal
    navigation.navigate('RecuperarSenha');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: darkTheme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* logo no topo (posicionado absolute para ficar no topo centralizado) */}
        <View style={styles.logoWrap}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* card centralizado */}
        <View style={[styles.card, { backgroundColor: darkTheme.colors.surface, borderColor: darkTheme.colors.outline }]}>
          <Text style={[styles.cardTitle, { color: darkTheme.colors.onSurface }]}>Login</Text>

          <TextInput
            mode="outlined"
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input]}
            theme={darkTheme}
            outlineColor="transparent"
            activeOutlineColor={darkTheme.colors.primary}
            placeholderTextColor={darkTheme.colors.onSurfaceVariant}
          />

          <TextInput
            mode="outlined"
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={[styles.input]}
            theme={darkTheme}
            outlineColor="transparent"
            activeOutlineColor={darkTheme.colors.primary}
            placeholderTextColor={darkTheme.colors.onSurfaceVariant}
          />

          <Button
            mode="contained"
            onPress={handleEntrar}
            loading={loading}
            disabled={loading || !email || !senha}
            contentStyle={styles.buttonContent}
            style={[styles.button, { backgroundColor: darkTheme.colors.primary }]}
            labelStyle={{ color: '#fff', fontWeight: '700' }}
          >
            Entrar
          </Button>
        </View>

        {/* esqueceu a senha no rodapé */}
        <TouchableOpacity style={styles.forgotWrap} onPress={handleEsqueciSenha}>
          <Text style={[styles.forgotText, { color: darkTheme.colors.onSurfaceVariant }]}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // centraliza o card verticalmente
    paddingHorizontal: 28,
  },
  logoWrap: {
    position: 'absolute',
    top: 64, // ajuste conforme quiser mais/menos distância do topo
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 140,
    height: 80,
  },
  card: {
    width: '86%',
    maxWidth: 360,
    borderRadius: 14,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  button: {
    marginTop: 6,
    borderRadius: 20,
    alignSelf: 'center',
    width: 140,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotWrap: {
    bottom: 28,
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: 13,
    top: 40
  },
});