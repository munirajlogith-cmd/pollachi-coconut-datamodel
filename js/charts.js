/**
 * Pollachi Coconut DataSphere - Robust SVG Charting Engine
 * Guaranteed to render visibly in all browsers, viewports, and tabs.
 */

const CoconutCharts = (function() {
  let tooltip = null;

  function initTooltip() {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "simple-tooltip";
      document.body.appendChild(tooltip);
    }
  }

  function showTooltip(e, text) {
    initTooltip();
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = `${e.pageX}px`;
    tooltip.style.top = `${e.pageY - 10}px`;
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.display = "none";
    }
  }

  function getBounds(minVal, maxVal, ticksCount = 5) {
    if (minVal === maxVal) {
      minVal = minVal > 0 ? minVal * 0.8 : 0;
      maxVal = maxVal > 0 ? maxVal * 1.2 : 10;
    }
    const range = maxVal - minVal;
    const roughStep = range / (ticksCount - 1);
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const magMsd = roughStep / mag;
    let step = mag;
    if (magMsd <= 1.5) step = 1 * mag;
    else if (magMsd <= 3) step = 2 * mag;
    else if (magMsd <= 7) step = 5 * mag;
    else step = 10 * mag;

    const niceMin = Math.floor(minVal / step) * step;
    const niceMax = Math.ceil(maxVal / step) * step;
    const ticks = [];
    for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
      ticks.push(v);
    }
    return { min: niceMin, max: niceMax, ticks };
  }

  /**
   * Dual-Axis Line Chart: Area (left) & Nut Yield (right)
   * Both curves are clearly visible, fully proportioned, and beautifully styled.
   */
  function renderLineChart(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";

    const {
      labels = [],
      series = [],
      height = 250,
      width = 540,
      dualAxis = false
    } = options;

    if (!series.length || !labels.length) {
      el.innerHTML = "<div style='color:var(--text-muted);text-align:center;padding:40px;font-size:12px;'>No records available</div>";
      return;
    }

    const margin = { top: 20, right: dualAxis ? 50 : 25, bottom: 35, left: 55 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const leftSeries = series.filter(s => !dualAxis || s.yAxis !== 'right');
    const rightSeries = series.filter(s => dualAxis && s.yAxis === 'right');

    let leftVals = [];
    leftSeries.forEach(s => s.data.forEach(v => leftVals.push(v)));
    const leftBounds = getBounds(Math.min(...leftVals) * 0.9, Math.max(...leftVals) * 1.05, 5);

    let rightBounds = null;
    if (rightSeries.length) {
      let rightVals = [];
      rightSeries.forEach(s => s.data.forEach(v => rightVals.push(v)));
      rightBounds = getBounds(Math.min(...rightVals) * 0.85, Math.max(...rightVals) * 1.08, 5);
    }

    const scaleX = i => margin.left + (i / Math.max(1, labels.length - 1)) * chartW;
    const scaleYLeft = v => margin.top + chartH - ((v - leftBounds.min) / (leftBounds.max - leftBounds.min)) * chartH;
    const scaleYRight = v => rightBounds ? (margin.top + chartH - ((v - rightBounds.min) / (rightBounds.max - rightBounds.min)) * chartH) : scaleYLeft(v);

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:${height}px;display:block;overflow:visible;">`;

    // Gradients
    svg += `<defs>`;
    series.forEach((s, idx) => {
      svg += `
        <linearGradient id="grad-${containerId}-${idx}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${s.color}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0.0"/>
        </linearGradient>
      `;
    });
    svg += `</defs>`;

    // Grid lines & Left Y Ticks
    leftBounds.ticks.forEach(t => {
      const y = scaleYLeft(t);
      svg += `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3,3" />
        <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.65">${t.toLocaleString()}</text>
      `;
    });

    // Right Y Ticks (If Dual Axis)
    if (rightBounds) {
      rightBounds.ticks.forEach(t => {
        const y = scaleYRight(t);
        svg += `
          <text x="${width - margin.right + 8}" y="${y + 4}" text-anchor="start" font-size="10" fill="currentColor" opacity="0.65">${t.toLocaleString()}</text>
        `;
      });
    }

    // X-Axis Labels
    labels.forEach((l, i) => {
      const x = scaleX(i);
      svg += `<text x="${x}" y="${height - margin.bottom + 18}" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.75" font-weight="600">${l}</text>`;
    });

    // Polyline series
    series.forEach((s, idx) => {
      const isRight = dualAxis && s.yAxis === 'right';
      const scaleFn = isRight ? scaleYRight : scaleYLeft;
      const bMin = isRight ? rightBounds.min : leftBounds.min;

      const points = s.data.map((v, i) => `${scaleX(i)},${scaleFn(v)}`);

      if (s.area) {
        const areaPoints = [
          `${scaleX(0)},${scaleFn(bMin)}`,
          ...points,
          `${scaleX(s.data.length - 1)},${scaleFn(bMin)}`
        ].join(" ");
        svg += `<polygon points="${areaPoints}" fill="url(#grad-${containerId}-${idx})" />`;
      }

      svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`;

      s.data.forEach((v, i) => {
        const cx = scaleX(i);
        const cy = scaleFn(v);
        const unitStr = s.unit ? ` ${s.unit}` : '';
        svg += `
          <circle class="chart-point" cx="${cx}" cy="${cy}" r="4" fill="${s.color}" stroke="#ffffff" stroke-width="1.8"
            data-label="${labels[i]}" data-series="${s.name}" data-val="${v.toLocaleString()}${unitStr}" />
        `;
      });
    });

    svg += `</svg>`;
    el.innerHTML = svg;

    el.querySelectorAll(".chart-point").forEach(pt => {
      pt.addEventListener("mouseenter", e => {
        pt.setAttribute("r", "5.5");
        showTooltip(e, `<strong>${pt.getAttribute("data-label")}</strong><br/>${pt.getAttribute("data-series")}: <strong>${pt.getAttribute("data-val")}</strong>`);
      });
      pt.addEventListener("mousemove", e => {
        showTooltip(e, `<strong>${pt.getAttribute("data-label")}</strong><br/>${pt.getAttribute("data-series")}: <strong>${pt.getAttribute("data-val")}</strong>`);
      });
      pt.addEventListener("mouseleave", () => {
        pt.setAttribute("r", "4");
        hideTooltip();
      });
    });
  }

  /**
   * Bar Chart
   */
  function renderBarChart(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";

    const {
      labels = [],
      series = [],
      yUnit = "",
      height = 250,
      width = 540
    } = options;

    if (!series.length || !labels.length) {
      el.innerHTML = "<div style='color:var(--text-muted);text-align:center;padding:40px;font-size:12px;'>No records available</div>";
      return;
    }

    const margin = { top: 20, right: 25, bottom: 35, left: 55 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    let allVals = [];
    series.forEach(s => s.data.forEach(v => allVals.push(v)));
    const bounds = getBounds(0, Math.max(...allVals), 5);

    const groupW = chartW / labels.length;
    const barW = Math.min(22, (groupW * 0.65) / series.length);
    const scaleY = v => margin.top + chartH - ((v - bounds.min) / (bounds.max - bounds.min)) * chartH;

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:${height}px;display:block;overflow:visible;">`;

    bounds.ticks.forEach(t => {
      const y = scaleY(t);
      svg += `
        <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3,3" />
        <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.65">${t.toLocaleString()} ${yUnit}</text>
      `;
    });

    labels.forEach((label, gIdx) => {
      const groupCenter = margin.left + (gIdx + 0.5) * groupW;
      const startX = groupCenter - (series.length * barW) / 2;

      series.forEach((s, sIdx) => {
        const val = s.data[gIdx] || 0;
        const x = startX + sIdx * barW;
        const y = scaleY(val);
        const bHeight = Math.max(0, margin.top + chartH - y);

        svg += `
          <rect class="chart-bar" x="${x}" y="${y}" width="${barW}" height="${bHeight}" rx="3" fill="${s.color}" style="cursor:pointer;transition:opacity 0.2s;"
            data-label="${label}" data-series="${s.name}" data-val="${val.toLocaleString()} ${yUnit}" />
        `;
      });

      svg += `<text x="${groupCenter}" y="${height - margin.bottom + 18}" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.75" font-weight="600">${label}</text>`;
    });

    svg += `</svg>`;
    el.innerHTML = svg;

    el.querySelectorAll(".chart-bar").forEach(bar => {
      bar.addEventListener("mouseenter", e => {
        bar.style.opacity = "0.75";
        showTooltip(e, `<strong>${bar.getAttribute("data-label")}</strong><br/>${bar.getAttribute("data-series")}: <strong>${bar.getAttribute("data-val")}</strong>`);
      });
      bar.addEventListener("mousemove", e => {
        showTooltip(e, `<strong>${bar.getAttribute("data-label")}</strong><br/>${bar.getAttribute("data-series")}: <strong>${bar.getAttribute("data-val")}</strong>`);
      });
      bar.addEventListener("mouseleave", () => {
        bar.style.opacity = "1";
        hideTooltip();
      });
    });
  }

  /**
   * Donut Chart (Value Chain & Varieties)
   * Guaranteed to be 100% visible with robust data extraction.
   */
  function renderDonutChart(containerId, items, centerTitle = "100%") {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";

    const cleanItems = (items || []).map(it => {
      let v = 0;
      if (typeof it.value === 'number') v = it.value;
      else if (typeof it.percentage === 'number') v = it.percentage;
      else if (typeof it.share === 'number') v = it.share;
      else if (typeof it.share_pct === 'number') v = it.share_pct;
      else v = parseFloat(it.value || it.percentage || it.share || 0) || 0;
      return {
        label: it.label || it.name || "Category",
        value: v,
        color: it.color || "#15803d"
      };
    }).filter(it => it.value > 0);

    const total = cleanItems.reduce((acc, it) => acc + it.value, 0);

    if (!cleanItems.length || total <= 0) {
      el.innerHTML = "<div style='color:var(--text-muted);text-align:center;padding:40px;font-size:12px;'>No records available</div>";
      return;
    }

    const size = 230;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 85;
    const innerRadius = 54;

    let currentAngle = -Math.PI / 2;
    let svg = `<svg viewBox="0 0 ${size} ${size}" style="width:100%;max-width:${size}px;height:${size}px;margin:auto;display:block;overflow:visible;">`;

    cleanItems.forEach(it => {
      const sliceAngle = (it.value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const x3 = cx + innerRadius * Math.cos(endAngle);
      const y3 = cy + innerRadius * Math.sin(endAngle);
      const x4 = cx + innerRadius * Math.cos(startAngle);
      const y4 = cy + innerRadius * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      svg += `
        <path class="chart-slice" d="${pathData}" fill="${it.color}" stroke="var(--bg-card)" stroke-width="2.5" style="cursor:pointer;transition:opacity 0.2s;"
          data-label="${it.label}" data-val="${it.value}%" />
      `;
    });

    svg += `
      <text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="9.5" fill="currentColor" opacity="0.6" font-weight="700" letter-spacing="0.05em">TOTAL</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${centerTitle}</text>
    `;

    svg += `</svg>`;
    el.innerHTML = svg;

    el.querySelectorAll(".chart-slice").forEach(slice => {
      slice.addEventListener("mouseenter", e => {
        slice.style.opacity = "0.78";
        showTooltip(e, `<strong>${slice.getAttribute("data-label")}</strong>: <strong>${slice.getAttribute("data-val")}</strong>`);
      });
      slice.addEventListener("mousemove", e => {
        showTooltip(e, `<strong>${slice.getAttribute("data-label")}</strong>: <strong>${slice.getAttribute("data-val")}</strong>`);
      });
      slice.addEventListener("mouseleave", () => {
        slice.style.opacity = "1";
        hideTooltip();
      });
    });
  }

  return {
    renderLineChart,
    renderBarChart,
    renderDonutChart
  };
})();
