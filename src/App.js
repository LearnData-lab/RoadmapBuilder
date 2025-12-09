import React, { useState, useRef } from 'react';
import { Plus, Download, Trash2, GripVertical, Calendar } from 'lucide-react';

const RoadmapBuilder = () => {
  const [initiatives, setInitiatives] = useState([
    {
      id: 1,
      title: 'Example Initiative',
      description: 'Brief description of what needs to be done',
      quarter: 'Q1 2025',
      owner: 'Team Lead',
      status: 'committed',
      dependencies: '',
      gaps: ''
    }
  ]);

  const [northStar, setNorthStar] = useState('Define your North Star metric or goal');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const timelineRef = useRef(null);

  const quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'];
  const statuses = [
    { value: 'committed', label: 'Committed', color: 'bg-green-100 text-green-800 border-green-300', hexColor: '#22c55e' },
    { value: 'available', label: 'Available to Pick Up', color: 'bg-blue-100 text-blue-800 border-blue-300', hexColor: '#3b82f6' },
    { value: 'needs-decision', label: 'Needs Decision', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', hexColor: '#eab308' },
    { value: 'knowledge-gap', label: 'Knowledge Gap', color: 'bg-red-100 text-red-800 border-red-300', hexColor: '#ef4444' }
  ];

  const addInitiative = () => {
    setInitiatives([...initiatives, {
      id: Date.now(),
      title: '',
      description: '',
      quarter: 'Q1 2026',
      owner: '',
      status: 'available',
      dependencies: '',
      gaps: ''
    }]);
  };

  const updateInitiative = (id, field, value) => {
    setInitiatives(initiatives.map(init => 
      init.id === id ? { ...init, [field]: value } : init
    ));
  };

  const deleteInitiative = (id) => {
    setInitiatives(initiatives.filter(init => init.id !== id));
  };

  const exportToSVG = () => {
    const initiativesByQuarter = getInitiativesByQuarter();
    const width = 1600;
    const headerHeight = 180;
    const legendHeight = 100;
    const quarterHeight = Math.max(400, Math.max(...quarters.map(q => initiativesByQuarter[q].length * 140 + 100)));
    const summaryHeight = 120;
    const height = headerHeight + legendHeight + quarterHeight + summaryHeight;
    
    const statusColorMap = {
      'committed': { bg: '#dcfce7', border: '#86efac', text: '#166534' },
      'available': { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
      'needs-decision': { bg: '#fef3c7', border: '#fde047', text: '#854d0e' },
      'knowledge-gap': { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' }
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Header -->
      <text x="40" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1e3a8a">North Star Roadmap</text>
      <text x="40" y="90" font-family="Arial, sans-serif" font-size="18" fill="#475569" font-style="italic">${escapeXml(northStar)}</text>
      
      <!-- Legend -->
      <text x="40" y="${headerHeight + 25}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#111827">Status Legend:</text>`;
    
    statuses.forEach((status, i) => {
      const x = 40 + (i * 240);
      const y = headerHeight + 40;
      const colors = statusColorMap[status.value];
      svg += `
        <rect x="${x}" y="${y}" width="220" height="35" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2" rx="6"/>
        <text x="${x + 110}" y="${y + 22}" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.text}" text-anchor="middle">${status.label}</text>`;
    });

    // Timeline
    const timelineY = headerHeight + legendHeight;
    svg += `<line x1="40" y1="${timelineY}" x2="${width - 40}" y2="${timelineY}" stroke="#cbd5e1" stroke-width="3"/>`;
    
    quarters.forEach((quarter, i) => {
      const x = 40 + (i * (width - 80) / quarters.length);
      svg += `
        <text x="${x + 120}" y="${timelineY - 15}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1f2937" text-anchor="middle">${quarter}</text>
        <circle cx="${x + 120}" cy="${timelineY}" r="6" fill="#6b7280"/>`;
      
      const quarterInits = initiativesByQuarter[quarter];
      quarterInits.forEach((init, idx) => {
        const cardY = timelineY + 40 + (idx * 140);
        const colors = statusColorMap[init.status];
        
        svg += `
          <rect x="${x + 10}" y="${cardY}" width="220" height="120" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2" rx="8"/>
          <text x="${x + 120}" y="${cardY + 25}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">${escapeXml(init.title || 'Untitled').substring(0, 30)}</text>`;
        
        if (init.owner) {
          svg += `<text x="${x + 20}" y="${cardY + 50}" font-family="Arial, sans-serif" font-size="11" fill="#374151">Owner: ${escapeXml(init.owner).substring(0, 20)}</text>`;
        }
        
        svg += `
          <rect x="${x + 20}" y="${cardY + 65}" width="180" height="24" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" rx="4"/>
          <text x="${x + 110}" y="${cardY + 81}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${colors.text}" text-anchor="middle">${statuses.find(s => s.value === init.status).label}</text>`;
        
        if (init.gaps) {
          svg += `<text x="${x + 20}" y="${cardY + 102}" font-family="Arial, sans-serif" font-size="10" fill="#6b7280" font-style="italic">⚠ ${escapeXml(init.gaps).substring(0, 25)}...</text>`;
        }
      });
    });

    // Summary
    const summaryY = timelineY + quarterHeight + 40;
    svg += `
      <line x1="40" y1="${summaryY - 20}" x2="${width - 40}" y2="${summaryY - 20}" stroke="#e5e7eb" stroke-width="2"/>
      <text x="40" y="${summaryY + 5}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#111827">Summary</text>`;
    
    statuses.forEach((status, i) => {
      const count = initiatives.filter(init => init.status === status.value).length;
      const x = 40 + (i * 240);
      const colors = statusColorMap[status.value];
      svg += `
        <rect x="${x}" y="${summaryY + 20}" width="220" height="70" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2" rx="8"/>
        <text x="${x + 110}" y="${summaryY + 60}" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${colors.text}" text-anchor="middle">${count}</text>
        <text x="${x + 110}" y="${summaryY + 80}" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${colors.text}" text-anchor="middle">${status.label}</text>`;
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'north-star-roadmap.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeXml = (str) => {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const getInitiativesByQuarter = () => {
    const byQuarter = {};
    quarters.forEach(q => {
      byQuarter[q] = initiatives.filter(init => init.quarter === q);
    });
    return byQuarter;
  };

  const TimelineView = () => {
    const initiativesByQuarter = getInitiativesByQuarter();

    return (
      <div ref={timelineRef} className="bg-white rounded-xl shadow-lg p-8" id="timeline-view">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">North Star Roadmap</h1>
          <p className="text-lg text-gray-700 border-l-4 border-blue-500 pl-4">{northStar}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-3">
            {statuses.map(status => (
              <div key={status.value} className={`px-3 py-1.5 rounded-lg border ${status.color} text-sm font-medium`}>
                {status.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Timeline axis */}
          <div className="flex border-b-4 border-gray-300 pb-2 mb-8">
            {quarters.map((quarter, index) => (
              <div key={quarter} className="flex-1 text-center">
                <div className="font-bold text-lg text-gray-800">{quarter}</div>
                <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mt-2"></div>
              </div>
            ))}
          </div>

          {/* Initiatives by quarter */}
          <div className="flex gap-4">
            {quarters.map(quarter => {
              const quarterInitiatives = initiativesByQuarter[quarter];
              return (
                <div key={quarter} className="flex-1 space-y-3">
                  {quarterInitiatives.map(init => {
                    const status = statuses.find(s => s.value === init.status);
                    return (
                      <div
                        key={init.id}
                        className={`p-4 rounded-lg border-2 ${status.color} shadow-sm`}
                        style={{ minHeight: '120px' }}
                      >
                        <h4 className="font-bold text-sm mb-2 line-clamp-2">
                          {init.title || 'Untitled'}
                        </h4>
                        {init.owner && (
                          <p className="text-xs text-gray-700 mb-1">
                            <span className="font-semibold">Owner:</span> {init.owner}
                          </p>
                        )}
                        <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${status.color} border`}>
                          {status.label}
                        </div>
                        {init.gaps && (
                          <p className="text-xs text-gray-600 mt-2 italic">⚠️ {init.gaps}</p>
                        )}
                      </div>
                    );
                  })}
                  {quarterInitiatives.length === 0 && (
                    <div className="text-center text-gray-400 text-sm italic py-8">
                      No initiatives
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {statuses.map(status => {
              const count = initiatives.filter(i => i.status === status.value).length;
              return (
                <div key={status.value} className={`p-3 rounded-lg ${status.color} border text-center`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium">{status.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">North Star Roadmap</h1>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">North Star Goal</label>
            <textarea
              value={northStar}
              onChange={(e) => setNorthStar(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="2"
              placeholder="What's your North Star metric or strategic goal?"
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={addInitiative}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus size={20} />
              Add Initiative
            </button>
            
            <div className="flex gap-2 border-2 border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${
                  viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} />
                Timeline View
              </button>
            </div>

            <button
              onClick={exportToSVG}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <Download size={20} />
              Export Timeline
            </button>
          </div>

          {viewMode === 'list' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Status Legend</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statuses.map(status => (
                  <div key={status.value} className={`px-3 py-2 rounded-lg border ${status.color} text-sm font-medium`}>
                    {status.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {viewMode === 'timeline' ? (
          <TimelineView />
        ) : (
          <div id="roadmap-content">
            <div className="space-y-4">
              {initiatives.map((init, index) => (
                <div key={init.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <GripVertical className="text-gray-400 mt-2 flex-shrink-0" size={20} />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Initiative Title</label>
                        <input
                          type="text"
                          value={init.title}
                          onChange={(e) => updateInitiative(init.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="What needs to be done?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Owner</label>
                        <input
                          type="text"
                          value={init.owner}
                          onChange={(e) => updateInitiative(init.id, 'owner', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="Who owns this?"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                          value={init.description}
                          onChange={(e) => updateInitiative(init.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                          rows="2"
                          placeholder="Brief description of the initiative"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Timeline</label>
                        <select
                          value={init.quarter}
                          onChange={(e) => updateInitiative(init.id, 'quarter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          {quarters.map(q => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                        <select
                          value={init.status}
                          onChange={(e) => updateInitiative(init.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          {statuses.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dependencies</label>
                        <input
                          type="text"
                          value={init.dependencies}
                          onChange={(e) => updateInitiative(init.id, 'dependencies', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="What does this depend on?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Knowledge Gaps / Open Questions</label>
                        <input
                          type="text"
                          value={init.gaps}
                          onChange={(e) => updateInitiative(init.id, 'gaps', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="What do we still need to figure out?"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteInitiative(init.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 mt-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {initiatives.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No initiatives yet. Click "Add Initiative" to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapBuilder;