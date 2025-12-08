import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Dimensions, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { darkTheme } from '../theme/darkTheme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type DrawerHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AnimatedDrawer = forwardRef<DrawerHandle>((_props, ref) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    open: () => toggle(true),
    close: () => toggle(false),
    toggle: () => toggle(),
  }));

  const toggle = (force?: boolean) => {
    const willOpen = force === undefined ? !visible : force;
    if (willOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -width * 0.7, duration: 300, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
            backgroundColor: 'rgba(0,0,0,0.7)',
          },
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={() => toggle(false)} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            backgroundColor: darkTheme.colors.surface,
            borderRightColor: darkTheme.colors.outline,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => {
                toggle(false); // Fecha o drawer
                navigation.navigate('Perfil'); // Vai para a tela de perfil
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: darkTheme.colors.primary }]}>
                <Text style={styles.avatarText}>CN</Text>
              </View>
            </TouchableOpacity>
            <View>
              <Text style={[styles.userName, { color: darkTheme.colors.onSurface }]}>Carla Nunes</Text>
              <Text style={[styles.userRole, { color: darkTheme.colors.onSurfaceVariant }]}>Administrador</Text>
            </View>
          </View>

          <IconButton
            icon="close"
            iconColor={darkTheme.colors.onSurface}
            size={24}
            onPress={() => toggle(false)}
            style={styles.closeButton}
          />
        </View>

        <TouchableOpacity
  style={styles.menuItem}
  onPress={() => {
    toggle(false);
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
    toggle(false);
    navigation.navigate('Usuarios');
  }}
>
  <Text style={styles.menuItemText}>Usuários</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.menuItem}
  onPress={() => {
    toggle(false);
    navigation.navigate('Relatorios');
  }}
>
  <Text style={styles.menuItemText}>Relatórios</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.menuItem}
  onPress={() => {
    toggle(false);
    navigation.navigate('Auditoria');
  }}
>
  <Text style={styles.menuItemText}>Auditoria</Text>
</TouchableOpacity>


        <View style={styles.drawerFooter}>
                  <Button
                      mode="outlined"
                      icon="logout"
                      onPress={() => {
                        toggle(false);

                        setTimeout(() => {
                          navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                          });
                        }, 300); // tempo da animação
                      }}
                    >
                      Sair
                  </Button>

        </View>
      </Animated.View>
    </>
  );
});

export default AnimatedDrawer;

const styles = StyleSheet.create({
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
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: '700' },
  userName: { fontSize: 16, fontWeight: '600' },
  userRole: { fontSize: 14, opacity: 0.8 },
  closeButton: { margin: 0 },
  menuItems: { paddingTop: 20 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  drawerFooter: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  logoutButton: { borderWidth: 1, borderRadius: 6 },
});