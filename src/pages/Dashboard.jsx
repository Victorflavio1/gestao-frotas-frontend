import React from 'react';
import { Truck, CheckSquare, Fuel } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <h1 className="page-title">Visão Geral da Frota</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <Card
          title="Veículos Ativos"
          value="0"
          icon={<Truck color="#3b82f6" />}
        />
        <Card
          title="Checklists Hoje"
          value="0"
          icon={<CheckSquare color="#22c55e" />}
        />
        <Card
          title="Abastecimentos"
          value="0"
          icon={<Fuel color="#eab308" />}
        />
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
