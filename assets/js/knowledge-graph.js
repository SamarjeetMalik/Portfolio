'use strict';

/**
 * KNOWLEDGE GRAPH — Samarjeet Malik Career Network
 * D3 v7 force-directed graph, lazy-initialised on first home-tab render.
 */

window.initKnowledgeGraph = function () {

  const wrap = document.getElementById('kg-wrap');
  if (!wrap) return;
  if (wrap.dataset.init === 'true') return;
  wrap.dataset.init = 'true';

  /* ── palette ─────────────────────────────── */
  const C = {
    core:    '#f0c040',
    research:'#2cb5b8',
    policy:  '#ff7043',
    skills:  '#ab47bc',
    outputs: '#42a5f5',
    awards:  '#ec407a',
  };
  const palette = [C.core, C.research, C.policy, C.skills, C.outputs, C.awards];

  /* ── data ────────────────────────────────── */
  const nodes = [
    // 0 — core
    { id:0,  label:'Samarjeet\nMalik',    g:0, r:26, desc:'Predoctoral Researcher · Physics-Informed ML · AI & Tech Policy' },
    // 1-5 — research
    { id:1,  label:'TIFR\nGRAPES-3',      g:1, r:15, desc:'ML Researcher · Astroparticle Physics\nJan 2025 – Feb 2026 · Ooty' },
    { id:2,  label:'IIT Jodhpur',          g:1, r:15, desc:'Predoctoral Research Fellow · PINNs\nDec 2024 – Feb 2026' },
    { id:3,  label:'BARC\nMumbai',         g:1, r:12, desc:'Applied Physics Intern · Nuclear Tech\nJul – Nov 2024' },
    { id:4,  label:'DRDO\nPune',           g:1, r:12, desc:'AI–ML Robotics Intern · Daksh Robot\nDec 2023 – Apr 2024' },
    { id:5,  label:'IASC / NASA\nPan-STARRS', g:1, r:12, desc:'Asteroid Detection Researcher\nSep 2024 – Mar 2026 · Texas' },
    // 6-9 — policy
    { id:6,  label:'ORF CSST',             g:2, r:15, desc:'Research Intern · Security & Tech\nMar 2026 – Present' },
    { id:7,  label:'NITI Aayog',           g:2, r:14, desc:'AI Policy Research Intern\nJan – Mar 2025 · New Delhi' },
    { id:8,  label:'Inclusive\nMinds',     g:2, r:11, desc:'IMPACT Fellow · Data & Political Analytics\nFeb – Apr 2026 · Bengaluru' },
    { id:9,  label:'The\nGeostrata',       g:2, r:10, desc:'Policy Analyst · Defence & Strategic Affairs\nJul – Sep 2024' },
    // 10-14 — skills
    { id:10, label:'Physics-\nInformed ML', g:3, r:14, desc:'PINNs embedding physical laws\nin neural network architectures' },
    { id:11, label:'Graph Neural\nNetworks', g:3, r:13, desc:'Spectral GNNs for detector-topology\naware cosmic-ray reconstruction' },
    { id:12, label:'AI\nGovernance',        g:3, r:13, desc:'Dual-use AI oversight · Regulatory frameworks\nNational Security AI Mechanism' },
    { id:13, label:'Cosmic-Ray\nPhysics',   g:3, r:11, desc:'Air-shower reconstruction\nMuon multiplicity scaling' },
    { id:14, label:'Electoral\nAnalytics',  g:3, r:10, desc:'Political data analysis\nVoter behaviour modelling' },
    // 15-19 — outputs
    { id:15, label:'PhysGraph-3',          g:4, r:12, desc:'β = 0.899 ± 0.001 at 0.03σ of theory\nSpectral GNN · TIFR GRAPES-3' },
    { id:16, label:'ConFIG',               g:4, r:12, desc:'Conflict-Free Inverse Gradient PINN\n30% faster convergence · IIT Jodhpur' },
    { id:17, label:'JetMAE\n(PAI26)',       g:4, r:11, desc:'Quark/gluon jet tagger\nAccepted · Stanford PAI26 2026' },
    { id:18, label:'India AI\nReport 2025', g:4, r:11, desc:'11 strategic recommendations\n6 SDG-aligned models · NITI Aayog' },
    { id:19, label:'Dual-Use AI\nResearch', g:4, r:10, desc:'MoD/NSA AI oversight mechanism\nAfghanistan economic analysis · ORF' },
    // 20-22 — awards
    { id:20, label:'LOGML 2026',           g:5, r:12, desc:'London Geometry & Machine Learning\nImperial College London' },
    { id:21, label:'HPAIR\nHarvard 2025',  g:5, r:10, desc:'Selected Delegate\nHarvard Project for Asian & Int\'l Relations' },
    { id:22, label:'IMO\nGold Medal',       g:5, r:10, desc:'International Mathematics Olympiad\n2× Gold · 97th International Rank' },
  ];

  const links = [
    // center → institutions
    {s:0,t:1,v:3},{s:0,t:2,v:3},{s:0,t:3,v:2},{s:0,t:4,v:2},{s:0,t:5,v:2},
    {s:0,t:6,v:3},{s:0,t:7,v:2},{s:0,t:8,v:2},{s:0,t:9,v:1},
    // research → skills
    {s:1,t:11,v:2},{s:1,t:13,v:2},
    {s:2,t:10,v:2},
    {s:3,t:10,v:1},
    {s:6,t:12,v:2},{s:7,t:12,v:1},
    {s:8,t:14,v:2},
    // skills → outputs
    {s:10,t:16,v:2},{s:11,t:15,v:2},{s:13,t:15,v:1},
    {s:11,t:17,v:1},{s:12,t:19,v:1},
    // institutions → outputs
    {s:1,t:15,v:2},{s:2,t:16,v:2},{s:6,t:19,v:2},{s:7,t:18,v:2},
    // center → awards
    {s:0,t:17,v:1},{s:0,t:20,v:2},{s:0,t:21,v:1},{s:0,t:22,v:1},
    {s:11,t:20,v:1},{s:2,t:20,v:1},
  ].map(l => ({ source: l.s, target: l.t, value: l.v }));

  /* ── SVG setup ───────────────────────────── */
  const W = wrap.clientWidth  || 900;
  const H = wrap.clientHeight || 540;

  const svg = d3.select('#kg-svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Glow filter
  const defs = svg.append('defs');
  const flt  = defs.append('filter').attr('id','kg-glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
  flt.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','4').attr('result','blur');
  const fm = flt.append('feMerge');
  fm.append('feMergeNode').attr('in','blur');
  fm.append('feMergeNode').attr('in','SourceGraphic');

  // Gradient background
  const bg = defs.append('radialGradient').attr('id','kg-bg').attr('cx','50%').attr('cy','50%').attr('r','60%');
  bg.append('stop').attr('offset','0%').attr('stop-color','#0e1520');
  bg.append('stop').attr('offset','100%').attr('stop-color','#060810');
  svg.append('rect').attr('width',W).attr('height',H).attr('fill','url(#kg-bg)');

  /* ── simulation ──────────────────────────── */
  const sim = d3.forceSimulation(nodes)
    .force('link',   d3.forceLink(links).id(d=>d.id).distance(d => 110/d.value + 30).strength(0.45))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(W/2, H/2).strength(0.08))
    .force('collide', d3.forceCollide(d => d.r + 18).strength(0.7));

  /* ── edges ───────────────────────────────── */
  const edgeG = svg.append('g');
  const edgeSel = edgeG.selectAll('line').data(links).join('line')
    .attr('stroke-opacity', 0.22)
    .attr('stroke-width',   d => Math.sqrt(d.value) * 0.9);

  /* ── nodes ───────────────────────────────── */
  const nodeG   = svg.append('g');
  const nodeSel = nodeG.selectAll('g').data(nodes).join('g')
    .style('cursor','pointer')
    .call(
      d3.drag()
        .on('start', (ev,d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
        .on('drag',  (ev,d) => { d.fx=ev.x; d.fy=ev.y; })
        .on('end',   (ev,d) => { if (!ev.active) sim.alphaTarget(0); d.fx=null; d.fy=null; })
    );

  // Outer glow ring
  nodeSel.append('circle')
    .attr('r',   d => d.r + 6)
    .attr('fill','none')
    .attr('stroke', d => palette[d.g])
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.15)
    .style('filter','url(#kg-glow)');

  // Main circle
  nodeSel.append('circle')
    .attr('r',      d => d.r)
    .attr('fill',   d => palette[d.g] + '22')
    .attr('stroke', d => palette[d.g])
    .attr('stroke-width', d => d.g === 0 ? 2.5 : 1.5);

  // Labels (multi-line via tspan)
  nodeSel.each(function(d) {
    const lines = d.label.split('\n');
    const t = d3.select(this).append('text')
      .attr('text-anchor','middle')
      .attr('font-family',"'Syne', sans-serif")
      .attr('font-size',  d.g === 0 ? '11.5px' : '9.5px')
      .attr('font-weight', d.g === 0 ? '800' : '600')
      .attr('fill', palette[d.g])
      .attr('opacity', 0.95)
      .style('pointer-events','none');
    const lh = 12;
    const startDy = -(lines.length - 1) * lh / 2;
    lines.forEach((line, i) => {
      t.append('tspan')
        .attr('x', 0)
        .attr('dy', i === 0 ? startDy + 'px' : lh + 'px')
        .text(line);
    });
  });

  /* ── tooltip ─────────────────────────────── */
  const tip = document.getElementById('kg-tip');

  nodeSel
    .on('mouseenter', function(ev, d) {
      d3.select(this).select('circle:nth-child(2)')
        .transition().duration(180)
        .attr('r', d.r * 1.35)
        .attr('stroke-width', 2.5);

      // highlight connected edges
      edgeSel
        .attr('stroke-opacity', l => (l.source===d || l.target===d) ? 0.85 : 0.06)
        .attr('stroke-width',   l => (l.source===d || l.target===d) ? Math.sqrt(l.value)*2 : 0.5);

      tip.innerHTML = `<strong style="color:${palette[d.g]};display:block;margin-bottom:4px">${d.label.replace('\n',' ')}</strong>${d.desc.replace(/\n/g,'<br>')}`;
      tip.style.setProperty('--kg-color', palette[d.g]);
      tip.style.opacity = 1;
    })
    .on('mousemove', function(ev) {
      const rect = wrap.getBoundingClientRect();
      const tx   = ev.clientX - rect.left;
      const ty   = ev.clientY - rect.top;
      tip.style.left = Math.min(tx + 14, W - 240) + 'px';
      tip.style.top  = Math.max(ty - 10, 6) + 'px';
    })
    .on('mouseleave', function(ev, d) {
      d3.select(this).select('circle:nth-child(2)')
        .transition().duration(180)
        .attr('r', d.r)
        .attr('stroke-width', d.g === 0 ? 2.5 : 1.5);
      edgeSel
        .attr('stroke-opacity', 0.22)
        .attr('stroke-width',   l => Math.sqrt(l.value) * 0.9);
      tip.style.opacity = 0;
    });

  /* ── tick ────────────────────────────────── */
  sim.on('tick', () => {
    // clamp nodes to viewport
    nodes.forEach(d => {
      d.x = Math.max(d.r + 5, Math.min(W - d.r - 5, d.x));
      d.y = Math.max(d.r + 5, Math.min(H - d.r - 5, d.y));
    });

    edgeSel
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      .attr('stroke', d => palette[d.source.g] || '#888');

    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // slow down after 3 s for a calm steady state
  setTimeout(() => sim.alphaTarget(0).alphaDecay(0.05), 3000);
};
