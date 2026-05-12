import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import Chart from 'chart.js/auto';
import './PerformancePage.css';

export default function PerformancePage() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const skillChartRef = useRef(null);
  const readinessChartRef = useRef(null);
  const skillChartInstance = useRef(null);
  const readinessChartInstance = useRef(null);

  useEffect(() => {
    fetchFighters();
  }, []);

  useEffect(() => {
    if (fighters.length) {
      renderCharts();
    }
    return () => {
      if (skillChartInstance.current) skillChartInstance.current.destroy();
      if (readinessChartInstance.current) readinessChartInstance.current.destroy();
    };
  }, [fighters]);

  const fetchFighters = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (skillChartInstance.current) skillChartInstance.current.destroy();
    if (readinessChartInstance.current) readinessChartInstance.current.destroy();

    const names = fighters.map(f => f.name);
    
    // Skill Distribution (Radar/Bar)
    skillChartInstance.current = new Chart(skillChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Cardio', 'Striking', 'Grappling'],
        datasets: fighters.slice(0, 5).map((f, i) => ({
          label: f.name,
          data: [f.cardio, f.striking, f.grappling],
          backgroundColor: i === 0 ? '#E8372A' : i === 1 ? '#639922' : i === 2 ? '#c9a84c' : `rgba(255,255,255,${0.1 + i*0.1})`,
          borderWidth: 0
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#7a7670', font: { family: 'Barlow' } } } },
        scales: {
          y: { beginAtZero: true, max: 10, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#7a7670' } },
          x: { grid: { display: false }, ticks: { color: '#7a7670' } }
        }
      }
    });

    // Readiness Scatter/Line
    readinessChartInstance.current = new Chart(readinessChartRef.current, {
      type: 'line',
      data: {
        labels: names,
        datasets: [{
          label: 'Readiness Score',
          data: fighters.map(f => f.readiness_score),
          borderColor: '#E8372A',
          backgroundColor: 'rgba(232,55,42,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#E8372A',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#7a7670' } },
          x: { grid: { display: false }, ticks: { color: '#7a7670' } }
        }
      }
    });
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="performance-wrap">
        <header>
          <span className="page-tag">Analytics Engine</span>
          <h1 className="page-title">Roster <span>Performance</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Visualizing progression across {fighters.length} active fighters</p>
        </header>

        {loading ? (
          <p style={{ marginTop: '40px' }}>Loading analytics...</p>
        ) : (
          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Skill Comparison</h3>
                <p className="chart-sub">Cardio vs Striking vs Grappling (Top 5 Fighters)</p>
              </div>
              <div className="canvas-container">
                <canvas ref={skillChartRef}></canvas>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Readiness Distribution</h3>
                <p className="chart-sub">Combat-readiness score across the entire roster</p>
              </div>
              <div className="canvas-container">
                <canvas ref={readinessChartRef}></canvas>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
