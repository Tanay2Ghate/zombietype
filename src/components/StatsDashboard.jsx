import React from 'react';
import { RotateCcw, Award, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function StatsDashboard({
  mode,
  limit,
  wpm,
  accuracy,
  rawWpm,
  correctChars,
  incorrectChars,
  extraChars,
  missedChars,
  chartData,
  onRestart
}) {
  // Generate coordinates for SVG chart
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 'auto' }}>
          No graph data available
        </div>
      );
    }

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 25;

    const dataPoints = chartData;
    const maxWpm = Math.max(...dataPoints.map((d) => d.wpm), 80); // baseline scale of 80 WPM
    const pointsCount = dataPoints.length;

    // Calculate scaling
    const xScale = (svgWidth - 2 * paddingX) / Math.max(pointsCount - 1, 1);
    const yScale = (svgHeight - 2 * paddingY) / maxWpm;

    // Build path coordinates
    const points = dataPoints.map((d, index) => {
      const x = paddingX + index * xScale;
      const y = svgHeight - paddingY - d.wpm * yScale;
      return { x, y, raw: d };
    });

    const pathD = points.reduce(
      (acc, p, index) => `${acc} ${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
      ''
    );

    // Area path (closed polygon under the curve)
    const lastX = paddingX + (pointsCount - 1) * xScale;
    const bottomY = svgHeight - paddingY;
    const areaD = pointsCount > 0 
      ? `${pathD} L ${lastX} ${bottomY} L ${paddingX} ${bottomY} Z`
      : '';

    // Y grid values (3 intervals)
    const gridIntervals = [
      Math.round(maxWpm * 0.25),
      Math.round(maxWpm * 0.5),
      Math.round(maxWpm * 0.75),
      maxWpm
    ];

    return (
      <svg className="chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
          <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {gridIntervals.map((val) => {
          const y = svgHeight - paddingY - val * yScale;
          return (
            <g key={val}>
              <line
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                className="chart-grid-line"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                className="chart-axis-text"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && <path d={areaD} className="chart-area" />}

        {/* Chart line */}
        {pathD && <path d={pathD} className="chart-line" />}

        {/* Data points (dots) */}
        {pointsCount < 40 && points.map((p, index) => (
          <circle
            key={index}
            cx={p.x}
            cy={p.y}
            r="4"
            className="chart-dot"
          >
            <title>Time: {p.raw.time}s | WPM: {p.raw.wpm}</title>
          </circle>
        ))}

        {/* X-axis indicators */}
        <line
          x1={paddingX}
          y1={bottomY}
          x2={svgWidth - paddingX}
          y2={bottomY}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        
        {/* X-axis labels (render every 2s or 5s depending on duration) */}
        {points.filter((_, idx) => {
          if (pointsCount <= 15) return true;
          if (pointsCount <= 30) return idx % 2 === 0;
          if (pointsCount <= 60) return idx % 5 === 0;
          return idx % 10 === 0;
        }).map((p) => (
          <text
            key={p.raw.time}
            x={p.x}
            y={bottomY + 15}
            className="chart-axis-text"
            textAnchor="middle"
          >
            {p.raw.time}s
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', color: 'var(--text-bright)', marginBottom: '2rem' }}>
        <Award style={{ color: 'var(--accent-cyan)' }} /> performance summary
      </h2>

      <div className="results-container">
        {/* Statistics Panels */}
        <div className="results-stats-panel">
          <div className="stat-box glass-panel large">
            <span className="stat-label">wpm</span>
            <span className="stat-value hero">{wpm}</span>
            <span className="stat-subvalue">net typing speed</span>
          </div>

          <div className="stat-box glass-panel">
            <span className="stat-label">accuracy</span>
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-subvalue">correct keys</span>
          </div>

          <div className="stat-box glass-panel">
            <span className="stat-label">raw wpm</span>
            <span className="stat-value">{rawWpm}</span>
            <span className="stat-subvalue">speed with errors</span>
          </div>

          <div className="stat-box glass-panel" style={{ gridColumn: 'span 2' }}>
            <span className="stat-label">characters breakdown</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: 'var(--correct)' }} title="Correct chars">
                <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                <span>{correctChars}</span>
              </div>
              <div style={{ color: 'var(--incorrect)' }} title="Incorrect chars">
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                <span>{incorrectChars}</span>
              </div>
              <div style={{ color: 'var(--extra)' }} title="Extra typed chars">
                <span>+{extraChars}</span> extra
              </div>
              <div style={{ color: 'var(--text-muted)' }} title="Missed letters">
                <span>{missedChars}</span> missed
              </div>
            </div>
          </div>
        </div>

        {/* Visual Graph */}
        <div className="glass-panel chart-panel">
          <div className="chart-title-row">
            <span className="chart-title">words per minute over time</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> test limit: {limit} {mode === 'time' ? 'seconds' : 'words'}
            </span>
          </div>
          <div className="chart-container">
            {renderChart()}
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="results-actions">
          <button className="btn-primary" onClick={onRestart}>
            <RotateCcw size={16} /> try again
          </button>
        </div>
      </div>
    </div>
  );
}
