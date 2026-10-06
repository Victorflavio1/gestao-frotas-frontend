import React, { useState, useEffect, useMemo } from 'react';
import { Truck, CheckSquare, Fuel, DollarSign } from 'lucide-react';
import { getVeiculos } from '../services/veiculoService';
import { getAbastecimentos } from '../services/abastecimentoService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CORES_PIE = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7'];

export default function Dashboard() {
  const [veiculos, setVeiculos] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dataVeic, dataAbast] = await Promise.all([
          getVeiculos().catch(() => []),
          getAbastecimentos().catch(() => []),
        ]);
        setVeiculos(dataVeic || []);
        setAbastecimentos(dataAbast || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // CÁLCULO DOS KPIS
  const kpis = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    // Veículos Ativos (Disponível ou Em Uso)
    const ativos = veiculos.filter((v) => {
      const st = (v.status || '').toUpperCase();
      return st.includes('DISP') || st.includes('USO') || st.includes('OCUP');
    }).length;

    // Abastecimentos e Gastos do Mês
    let abastecimentosHoje = 0;
    let totalGastoMes = 0;

    abastecimentos.forEach((a) => {
      const dataRaw = a.data_abastecimento || a.data;
      if (!dataRaw) return;

      const dataIso = dataRaw.toString().split('T')[0];
      if (dataIso === hoje) {
        abastecimentosHoje += 1;
      }

      const d = new Date(dataRaw);
      if (d.getMonth() === mesAtual && d.getFullYear() === anoAtual) {
        totalGastoMes += Number(a.valor_total || a.valor || 0);
      }
    });

    return {
      veiculosAtivos: ativos,
      totalVeiculos: veiculos.length,
      abastecimentosHoje,
      totalAbastecimentos: abastecimentos.length,
      totalGastoMes,
    };
  }, [veiculos, abastecimentos]);

  // GRÁFICO 1: Top 5 Veículos por Maior Gasto
  const dadosGastosPorVeiculo = useMemo(() => {
    const mapa = {};
    abastecimentos.forEach((a) => {
      const placa = a.placa || a.veiculo_placa || `ID ${a.veiculo_id}`;
      const valor = Number(a.valor_total || a.valor || 0);
      mapa[placa] = (mapa[placa] || 0) + valor;
    });

    return Object.keys(mapa)
      .map((placa) => ({ placa, total: mapa[placa] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [abastecimentos]);

  // GRÁFICO 2: Distribuição por Tipo de Combustível
  const dadosCombustivel = useMemo(() => {
    const mapa = {};
    abastecimentos.forEach((a) => {
      const tipo = a.tipo_combustivel || a.combustivel || 'FLEX';
      const valor = Number(a.valor_total || a.valor || 0);
      mapa[tipo] = (mapa[tipo] || 0) + valor;
    });

    return Object.keys(mapa).map((tipo) => ({
      name: tipo,
      value: mapa[tipo],
    }));
  }, [abastecimentos]);

  if (carregando) {
    return (
      <div style={{ padding: '20px', color: 'var(--text-muted)' }}>
        Carregando estatísticas do dashboard...
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Visão Geral da Frota</h1>

      {/* CARDS DE KPIS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <Card
          title="Veículos Ativos"
          value={`${kpis.veiculosAtivos} / ${kpis.totalVeiculos}`}
          icon={<Truck color="#3b82f6" />}
        />
        <Card
          title="Abastecimentos Hoje"
          value={kpis.abastecimentosHoje}
          icon={<CheckSquare color="#22c55e" />}
        />
        <Card
          title="Total Abastecimentos"
          value={kpis.totalAbastecimentos}
          icon={<Fuel color="#eab308" />}
        />
        <Card
          title="Gasto no Mês"
          value={`R$ ${kpis.totalGastoMes.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign color="#a855f7" />}
        />
      </div>

      {/* SEÇÃO DE GRÁFICOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {/* GRÁFICO 1: TOP 5 GASTOS */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '16px',
              color: 'var(--text-main, #fff)',
            }}
          >
            Top 5 Veículos - Maior Gasto (R$)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            {dadosGastosPorVeiculo.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={dadosGastosPorVeiculo}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis dataKey="placa" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val) => [
                      `R$ ${Number(val).toFixed(2)}`,
                      'Gasto Total',
                    ]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Nenhum dado de abastecimento.
              </p>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: POR COMBUSTÍVEL */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              marginTop: 0,
              marginBottom: '16px',
              color: 'var(--text-main, #fff)',
            }}
          >
            Gastos por Tipo de Combustível
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            {dadosCombustivel.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dadosCombustivel}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {dadosCombustivel.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CORES_PIE[index % CORES_PIE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [
                      `R$ ${Number(val).toFixed(2)}`,
                      'Gasto',
                    ]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                Nenhum dado de abastecimento.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const Card = ({ title, value, icon }) => (
  <div
    style={{
      backgroundColor: 'var(--bg-card)',
      padding: '20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
        {title}
      </p>
      <h3 style={{ fontSize: '24px', margin: '5px 0 0 0' }}>{value}</h3>
    </div>
    {icon}
  </div>
);
