import React, { useRef } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import Svg, { Circle, G, Path, Rect, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { darkTheme } from '../theme/darkTheme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedDrawer from '../components/AnimatedDrawer';

const { width } = Dimensions.get('window');

const DATA_DONUT = [
  { key: 'Outros', value: 25, color: '#4CAF50' }, // green
  { key: 'Incêndios', value: 25, color: '#EF5350' }, // red
  { key: 'Resgate', value: 25, color: '#FFB74D' }, // orange
  { key: 'Acidentes', value: 25, color: '#29B6F6' }, // blue
];

const SPARKLINE_DATA = [10, 18, 12, 24, 8, 20, 14]; // exemplo Mon..Sun

export default function Relatorios({ navigation }: any) {
  const drawerRef = useRef<any>(null);

  const totalOcorrencias = 22;
  const finalizados = 18;
  const abertas = 3;
  const emAndamento = 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkTheme.colors.background }]}>
      {/* Drawer integrado */}
      <AnimatedDrawer ref={drawerRef} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: darkTheme.colors.surface, borderBottomColor: darkTheme.colors.outline }]}>
        <TouchableOpacity onPress={() => drawerRef.current?.toggle?.()} style={styles.iconButton}>
          <Ionicons name="menu" size={30} color={darkTheme.colors.onSurface} />
        </TouchableOpacity>

        <Text variant="titleMedium" style={[styles.title, { color: darkTheme.colors.onSurface }]}>
          Dashboard
        </Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('EnviarRelatorio')}
          icon="file-download"
          style={styles.generateButton}
          contentStyle={{ height: 36 }}
          labelStyle={{ color: '#fff', fontWeight: '600' }}
        >
          Gerar relatório
        </Button>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Card resumo */}
        <Card style={[styles.card, { backgroundColor: darkTheme.colors.surface, borderColor: darkTheme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: darkTheme.colors.onSurface }]}>
              Total ocorrências: <Text style={{ fontWeight: '700', color: darkTheme.colors.primary }}>{totalOcorrencias}</Text>
            </Text>

            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: darkTheme.colors.onSurfaceVariant }]}>Finalizados:</Text>
                <Text style={[styles.statusValue, { color: darkTheme.colors.onSurface }]}>{finalizados} ⏺</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: darkTheme.colors.onSurfaceVariant }]}>Abertas:</Text>
                <Text style={[styles.statusValue, { color: darkTheme.colors.onSurface }]}>{abertas} ⚪</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: darkTheme.colors.onSurfaceVariant }]}>Em andamento:</Text>
                <Text style={[styles.statusValue, { color: darkTheme.colors.onSurface }]}>{emAndamento} ◐</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 32 }} />

        {/* Donut */}
        <View style={styles.centerColumn}>
          <DonutChart data={DATA_DONUT} size={200} strokeWidth={28} />
          <View style={{ height: 12 }} />
          <Text style={[styles.centerLabel, { color: darkTheme.colors.onSurface }]}>Ocorrências</Text>

          <View style={{ height: 16 }} />

          <View style={styles.legendRow}>
            {DATA_DONUT.map((d) => (
              <View key={d.key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: d.color }]} />
                <Text style={[styles.legendText, { color: darkTheme.colors.onSurface }]}>{d.key}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />

        {/* Sparkline / gráfico semanal */}
        <Card style={[styles.card, { backgroundColor: darkTheme.colors.surface, borderColor: darkTheme.colors.outline }]}>
          <Card.Content>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardSectionTitle, { color: darkTheme.colors.onSurface }]}>Ocorrências</Text>
              <TouchableOpacity style={styles.smallSelect}>
                <Text style={{ color: darkTheme.colors.onSurfaceVariant }}>Sem ▾</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 140, marginTop: 8 }}>
              <SparklineChart data={SPARKLINE_DATA} colorFrom="#E53935" colorTo="#8E2323" />
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* DonutChart: desenha fatias usando strokeDasharray */
function DonutChart({ data, size = 160, strokeWidth = 24 }: { data: { key: string; value: number; color: string }[]; size?: number; strokeWidth?: number; }) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumulative = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${center}, ${center}`}>
        {data.map((slice) => {
          const fraction = slice.value / total;
          const dash = [fraction * circumference, (1 - fraction) * circumference];
          const rotate = cumulative * 360;
          cumulative += fraction;
          return (
            <G key={slice.key} rotation={rotate} origin={`${center}, ${center}`}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={dash}
                fill="transparent"
              />
            </G>
          );
        })}
      </G>

      {/* buraco central */}
      <Circle cx={center} cy={center} r={radius - strokeWidth / 2} fill={darkTheme.colors.surface} />

      {/* Texto central usando SvgText */}
      <SvgText
        x={center}
        y={center - 8}
        fontSize={20}
        fill={darkTheme.colors.onSurface}
        fontWeight="700"
        textAnchor="middle"
      >
        {/* total opcional, ex: {data.reduce((s,d)=>s+d.value,0)} */}
      </SvgText>

      <SvgText
        x={center}
        y={center + 14}
        fontSize={12}
        fill={darkTheme.colors.onSurfaceVariant}
        textAnchor="middle"
      >
        {/* subtítulo */}
      </SvgText>
    </Svg>
  );
}

/* SparklineChart: área + linha + marcador de pico */
function SparklineChart({ data, colorFrom = '#E53935', colorTo = '#8E2323' }: { data: number[]; colorFrom?: string; colorTo?: string; }) {
  const w = width - 64;
  const h = 120;
  const padding = 8;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - padding * 2) + padding;
    const y = h - ((v - min) / (max - min || 1)) * (h - padding * 2) - padding;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${w - padding} ${h - padding} L ${padding} ${h - padding} Z`;

  const peakIndex = data.indexOf(Math.max(...data));
  const peak = points[peakIndex];

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colorFrom} stopOpacity="0.45" />
          <Stop offset="1" stopColor={colorTo} stopOpacity="0.05" />
        </LinearGradient>
      </Defs>

      <Path d={areaPath} fill="url(#grad)" />

      <Path d={linePath} fill="none" stroke={colorFrom} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

      {peak && (
        <>
          <Circle cx={peak.x} cy={peak.y} r={6} fill="#fff" />
          <Circle cx={peak.x} cy={peak.y} r={4} fill={colorFrom} />
        </>
      )}

      <Rect x={0} y={0} width={w} height={h} rx={12} ry={12} fill="transparent" stroke={darkTheme.colors.outline} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  generateButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusItem: {
    width: '32%',
  },
  statusLabel: {
    fontSize: 12,
  },
  statusValue: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  centerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  legendRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  smallSelect: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});