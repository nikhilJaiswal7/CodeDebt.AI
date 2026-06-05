import { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Activity, AlertTriangle, FileText, Send, ShieldCheck, 
  Cpu, Zap, Users, BarChart3, ChevronRight, Terminal, Search
} from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000/api';

interface HealthData {
  health_score: number;
  total_files_analyzed: number;
  high_risk_files: number;
  debt_score: number;
}

interface TrendData {
  month: string;
  actual: number | null;
  predicted: number | null;
}

interface FileRisk {
  path: string;
  riskScore: number;
  busFactor: number;
  complexity: number;
}

interface MapNode {
  name: string;
  riskLevel: string;
  size: number;
}

function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [files, setFiles] = useState<FileRisk[]>([]);
  const [riskMap, setRiskMap] = useState<MapNode[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: 'Operational. I am the Technical Debt Detective. Analyzing your repository pulse... How can I assist your engineering strategy today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, t, f, m] = await Promise.all([
          fetch(`${API_BASE}/health`).then(r => r.json()),
          fetch(`${API_BASE}/debt-trend`).then(r => r.json()),
          fetch(`${API_BASE}/dangerous-files`).then(r => r.json()),
          fetch(`${API_BASE}/risk-map`).then(r => r.json())
        ]);
        setHealth(h);
        setTrend(t);
        setFiles(f);
        setRiskMap(m);
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const res = await fetch(`${API_BASE}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
        setIsTyping(false);
      }, 800);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Connection interrupt. AI node unreachable.' }]);
      setIsTyping(false);
    }
  };

  const getColorForRisk = (level: string) => {
    switch(level) {
      case 'Critical': return 'var(--danger)';
      case 'High': return 'var(--warning)';
      case 'Medium': return 'var(--brand)';
      case 'Low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="header">
        <h1>
          <Zap className="brand-icon" size={28} color="var(--brand)" fill="var(--brand)" />
          <span>DEBT<span style={{color: 'var(--brand)'}}>INTEL</span>.AI</span>
        </h1>
        <div className="header-meta">
          <div className="system-status">
            <div className="status-dot"></div>
            SYSTEM OPERATIONAL
          </div>
          <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500}}>
            LAST SYNC: JUST NOW
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="dashboard-scroll">
          {/* Top KPIs */}
          <div className="top-cards">
            <div className="card">
              <h3>Health Index <ShieldCheck size={18} color="var(--success)" /></h3>
              <div className={`value ${health?.health_score && health.health_score > 80 ? 'success' : 'warning'}`}>
                {health?.health_score ?? '--'}<span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>/100</span>
              </div>
              <div className="card-footer">
                <BarChart3 size={12} /> +2.4% from last sprint
              </div>
            </div>
            <div className="card">
              <h3>Debt Velocity <Activity size={18} color="var(--danger)" /></h3>
              <div className="value danger">
                {health?.debt_score ?? '--'}
              </div>
              <div className="card-footer">
                <AlertTriangle size={12} /> Critical threshold reached
              </div>
            </div>
            <div className="card">
              <h3>Artifacts <FileText size={18} color="var(--brand)" /></h3>
              <div className="value">
                {health?.total_files_analyzed ?? '--'}
              </div>
              <div className="card-footer">
                <ChevronRight size={12} /> 14 new modules identified
              </div>
            </div>
            <div className="card">
              <h3>Risk Vectors <AlertTriangle size={18} color="var(--warning)" /></h3>
              <div className="value warning">
                {health?.high_risk_files ?? '--'}
              </div>
              <div className="card-footer">
                <Users size={12} /> Bus factor alert in 3 modules
              </div>
            </div>
          </div>

          <div className="charts-row">
            {/* Main Chart */}
            <div className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3>Technical Debt Projection</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                  <span style={{fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--success)'}}></div> ACTUAL</span>
                  <span style={{fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)'}}></div> PREDICTED</span>
                </div>
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border)', borderRadius: '12px', border: '1px solid var(--border)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                    <Area type="monotone" dataKey="predicted" stroke="var(--danger)" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPred)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Map */}
            <div className="card">
              <h3>Engineering Risk Map</h3>
              <div className="risk-map-container">
                {riskMap.map((node, i) => (
                  <div key={i} className="risk-node" style={{
                    backgroundColor: `rgba(${levelToRgb(node.riskLevel)}, 0.15)`,
                    borderColor: getColorForRisk(node.riskLevel),
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}>
                    <div className="risk-node-icon">
                      <Zap size={16} color={getColorForRisk(node.riskLevel)} />
                    </div>
                    <div className="risk-node-label" style={{ color: getColorForRisk(node.riskLevel) }}>
                      {node.name}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                Nodes sized by cyclomatic complexity and code churn.
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h3>Risk Intelligence: Targeted Refactoring</h3>
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Search size={14} color="var(--text-muted)" />
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Filter files...</span>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Module / Path</th>
                    <th>Risk Score</th>
                    <th>Bus Factor</th>
                    <th>Complexity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, i) => (
                    <tr key={i}>
                      <td>
                        <div className="file-path">{f.path}</div>
                      </td>
                      <td>
                        <span className={`badge ${f.riskScore > 90 ? 'Critical' : f.riskScore > 80 ? 'High' : 'Medium'}`}>
                          {f.riskScore > 90 ? <AlertTriangle size={12} /> : <Activity size={12} />}
                          {f.riskScore}%
                        </span>
                      </td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <div style={{display: 'flex'}}>
                            {[...Array(3)].map((_, idx) => (
                              <Users key={idx} size={14} color={idx < f.busFactor ? 'var(--text-primary)' : 'var(--text-muted)'} style={{marginLeft: idx > 0 ? -4 : 0}} />
                            ))}
                          </div>
                          <span style={{fontSize: '0.8rem', color: f.busFactor === 1 ? 'var(--danger)' : 'var(--text-secondary)'}}>
                             {f.busFactor === 1 ? 'CRITICAL' : `${f.busFactor} devs`}
                          </span>
                        </div>
                      </td>
                      <td className="complexity-value">{f.complexity}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
                          <div style={{width: 6, height: 6, borderRadius: '50%', background: f.riskScore > 90 ? 'var(--danger)' : 'var(--warning)'}}></div>
                          Refactor Recommended
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Copilot */}
        <div className="copilot-panel">
          <div className="copilot-header">
            <Cpu size={22} color="var(--purple)" style={{filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))'}} />
            COGNITIVE COPILOT
          </div>
          <div className="chat-history">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-container">
            <div className="input-wrapper">
              <Terminal size={18} color="var(--text-muted)" style={{marginLeft: '8px'}} />
              <input 
                type="text" 
                placeholder="Query repository intelligence..." 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              />
              <button onClick={sendChatMessage}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function levelToRgb(level: string) {
  switch(level) {
    case 'Critical': return '239, 68, 68';
    case 'High': return '245, 158, 11';
    case 'Medium': return '59, 130, 246';
    case 'Low': return '16, 185, 129';
    default: return '148, 163, 184';
  }
}

export default App;
