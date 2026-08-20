/* © All rights reserved FinSight prepared by Rudra Nath Sinha
 * Country Intelligence — subtabs under Sector product
 */
(function () {
  const state = {
    rows: [],
    byCountry: new Map(),
    country: null,
    charts: { sector: null, industry: null },
  };

  const $ = (id) => document.getElementById(id);

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  function aggregate(rows) {
    const map = new Map();
    for (const r of rows) {
      const c = (r.Country || 'Unknown').trim() || 'Unknown';
      if (!map.has(c)) {
        map.set(c, {
          name: c,
          stocks: [],
          sectors: new Map(),
          industries: new Map(),
        });
      }
      const g = map.get(c);
      g.stocks.push(r);
      const sec = r.Sector || 'Unknown';
      const ind = r.Industry || 'Unknown';
      g.sectors.set(sec, (g.sectors.get(sec) || 0) + 1);
      const ik = sec + '||' + ind;
      g.industries.set(ik, (g.industries.get(ik) || 0) + 1);
    }
    return map;
  }

  function sortedCountries() {
    return [...state.byCountry.keys()].sort((a, b) => {
      const ca = state.byCountry.get(a).stocks.length;
      const cb = state.byCountry.get(b).stocks.length;
      return cb - ca || a.localeCompare(b);
    });
  }

  function fillSelect(filter) {
    const sel = $('countrySelect');
    const q = (filter || '').toLowerCase();
    const list = sortedCountries().filter((c) => !q || c.toLowerCase().includes(q));
    const cur = state.country;
    sel.innerHTML = list.map((c) => {
      const n = state.byCountry.get(c).stocks.length;
      return `<option value="${esc(c)}"${c === cur ? ' selected' : ''}>${esc(c)} (${n})</option>`;
    }).join('');
    if (!list.includes(cur) && list.length) {
      state.country = list[0];
      sel.value = list[0];
    }
  }

  function setCrossLinks(country) {
    const eq = '/equity/?country_name=' + encodeURIComponent(country);
    const rk = '/country-ranking/';
    ['linkEquity', 'cardEquity'].forEach((id) => {
      const el = $(id);
      if (el) el.href = eq;
    });
    ['linkRanking', 'cardRanking'].forEach((id) => {
      const el = $(id);
      if (el) el.href = rk;
    });
  }

  function destroyCharts() {
    Object.keys(state.charts).forEach((k) => {
      try { state.charts[k]?.destroy(); } catch (_) {}
      state.charts[k] = null;
    });
  }

  function renderOverview(g) {
    const nSec = g.sectors.size;
    const nInd = g.industries.size;
    const nSt = g.stocks.length;
    const topSec = [...g.sectors.entries()].sort((a, b) => b[1] - a[1])[0];
    $('overviewStats').innerHTML = [
      ['Listed names', nSt],
      ['Sectors', nSec],
      ['Industries', nInd],
      ['Top sector', topSec ? topSec[0] : '—'],
    ].map(([lab, val]) => `
      <div class="ci-stat">
        <p class="text-[11px] uppercase tracking-wide text-slate-500">${esc(lab)}</p>
        <p class="text-lg font-bold mt-1 truncate" title="${esc(val)}">${esc(val)}</p>
      </div>`).join('');

    const share = topSec ? ((100 * topSec[1]) / nSt).toFixed(1) : '0';
    $('overviewBrief').textContent =
      `${g.name} appears in the FinSight sector universe with ${nSt} listed name(s) across ${nSec} sector(s) and ${nInd} industry group(s). ` +
      (topSec
        ? `The largest sleeve by count is ${topSec[0]} (~${share}% of names). `
        : '') +
      `Use Visualization for concentration charts, Sector & industry for structure tables, then Evaluation for a shortlist — and jump to Global Equity or Country Ranking for deeper work. ` +
      `Built for analytical workflows (DA / DS / ML feature exploration / equity research education).`;
  }

  function renderViz(g) {
    destroyCharts();
    const secEntries = [...g.sectors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 11);
    const indEntries = [...g.industries.entries()]
      .map(([k, n]) => {
        const [sec, ind] = k.split('||');
        return { sec, ind, n };
      })
      .sort((a, b) => b.n - a.n)
      .slice(0, 10);

    const colors = [
      '#1a7ff5', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
      '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#14b8a6', '#64748b',
    ];

    const ctx1 = $('chartSector');
    if (ctx1 && window.Chart) {
      state.charts.sector = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: secEntries.map((x) => x[0]),
          datasets: [{ data: secEntries.map((x) => x[1]), backgroundColor: colors }],
        },
        options: {
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        },
      });
    }

    const ctx2 = $('chartIndustry');
    if (ctx2 && window.Chart) {
      state.charts.industry = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: indEntries.map((x) => x.ind.length > 28 ? x.ind.slice(0, 26) + '…' : x.ind),
          datasets: [{
            label: 'Stocks',
            data: indEntries.map((x) => x.n),
            backgroundColor: '#1a7ff5',
            borderRadius: 4,
          }],
        },
        options: {
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { precision: 0 } },
            y: { ticks: { font: { size: 10 } } },
          },
        },
      });
    }
  }

  function renderStructure(g) {
    const secs = [...g.sectors.entries()].sort((a, b) => b[1] - a[1]);
    const indCountBySec = new Map();
    for (const k of g.industries.keys()) {
      const sec = k.split('||')[0];
      indCountBySec.set(sec, (indCountBySec.get(sec) || 0) + 1);
    }
    $('sectorTable').innerHTML = secs.map(([sec, n]) => `
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-2 pr-2 font-medium">${esc(sec)}</td>
        <td class="py-2 pr-2 text-right font-mono text-xs">${n}</td>
        <td class="py-2 pr-2 text-right font-mono text-xs">${indCountBySec.get(sec) || 0}</td>
        <td class="py-2">
          <a class="text-xs text-brand-600 hover:underline" href="../part1_sector_industry/index.html">Explore</a>
        </td>
      </tr>`).join('');

    const inds = [...g.industries.entries()]
      .map(([k, n]) => {
        const [sec, ind] = k.split('||');
        return { sec, ind, n };
      })
      .sort((a, b) => b.n - a.n)
      .slice(0, 25);

    $('industryTable').innerHTML = inds.map((r) => `
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-2 pr-2">${esc(r.ind)}</td>
        <td class="py-2 pr-2 text-slate-500 text-xs">${esc(r.sec)}</td>
        <td class="py-2 text-right font-mono text-xs">${r.n}</td>
      </tr>`).join('');
  }

  function renderEval(g) {
    const nSt = g.stocks.length;
    const nSec = g.sectors.size;
    const nInd = g.industries.size;
    const herfindahl = [...g.sectors.values()].reduce((s, x) => {
      const p = x / nSt;
      return s + p * p;
    }, 0);
    const conc = herfindahl > 0.25 ? 'High' : herfindahl > 0.12 ? 'Moderate' : 'Diversified';
    const breadth = nSec >= 8 ? 'Broad' : nSec >= 4 ? 'Medium' : 'Narrow';

    $('evalCards').innerHTML = [
      ['Universe depth', `${nSt} names`, 'Count of symbols in sector universe for this country'],
      ['Sector breadth', breadth, `${nSec} sectors · ${nInd} industries`],
      ['Sector concentration', conc, `Herfindahl (count-based) ≈ ${herfindahl.toFixed(3)}`],
    ].map(([t, v, d]) => `
      <div class="ci-stat">
        <p class="text-[11px] uppercase tracking-wide text-slate-500">${esc(t)}</p>
        <p class="text-xl font-bold mt-1">${esc(v)}</p>
        <p class="text-xs text-slate-500 mt-1">${esc(d)}</p>
      </div>`).join('');

    const sample = g.stocks.slice(0, 24);
    $('sampleSymbols').innerHTML = sample.map((r) => {
      const sym = r.Symbol || '';
      const href = '/equity/?symbol=' + encodeURIComponent(sym);
      return `<a class="ci-chip hover:ring-1 hover:ring-brand-400" href="${href}" target="_blank" rel="noopener" title="${esc(r.CompanyName || '')}">${esc(sym)}</a>`;
    }).join('') || '<span class="text-xs text-slate-500">No symbols</span>';
  }

  function renderAll() {
    const g = state.byCountry.get(state.country);
    if (!g) return;
    setCrossLinks(state.country);
    $('countryHint').textContent = `${state.country} · ${g.stocks.length} names in sector universe · switch subtabs for analysis path`;
    renderOverview(g);
    const active = document.querySelector('.ci-tab.active')?.dataset.tab || 'overview';
    if (active === 'viz') renderViz(g);
    if (active === 'structure') renderStructure(g);
    if (active === 'eval') renderEval(g);
    // always refresh structure/eval data containers when country changes
    renderStructure(g);
    renderEval(g);
  }

  function setTab(name) {
    document.querySelectorAll('.ci-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    document.querySelectorAll('.ci-panel').forEach((p) => {
      p.classList.toggle('active', p.id === 'panel-' + name);
    });
    const g = state.byCountry.get(state.country);
    if (!g) return;
    if (name === 'viz') renderViz(g);
    if (name === 'overview') renderOverview(g);
  }

  async function init() {
    try {
      const res = await fetch('../data/stocks_universe.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load stocks_universe.json');
      state.rows = await res.json();
      state.byCountry = aggregate(state.rows);
      const countries = sortedCountries();
      state.country = countries[0] || null;
      fillSelect('');
      $('countryHint').textContent = `${countries.length} countries · ${state.rows.length} names loaded`;
      if (state.country) renderAll();

      // URL ?country=Name
      const qs = new URLSearchParams(location.search);
      const qCountry = qs.get('country') || qs.get('country_name');
      if (qCountry && state.byCountry.has(qCountry)) {
        state.country = qCountry;
        $('countrySelect').value = qCountry;
        renderAll();
      }
    } catch (e) {
      $('countryHint').textContent = 'Error: ' + (e.message || e);
    }

    $('countrySelect').addEventListener('change', () => {
      state.country = $('countrySelect').value;
      renderAll();
    });
    $('countrySearch').addEventListener('input', () => {
      fillSelect($('countrySearch').value);
    });
    document.querySelectorAll('.ci-tab').forEach((btn) => {
      btn.addEventListener('click', () => setTab(btn.dataset.tab));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
