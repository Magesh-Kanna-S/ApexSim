"use client";

/**
 * ApexStrategy Enterprise — Market Share Chart
 * Interactive breakdown of segment dominance per round.
 * Renders a stacked bar chart showing each team's share
 * of each segment for the most recent round, or a doughnut
 * chart of total units sold per team.
 */

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GameState } from "@/types/game";

interface MarketShareChartProps {
  state: GameState;
  /** Round to visualize (defaults to latest) */
  round?: number;
  /** If "pie" renders a doughnut of total team share; if "stacked" renders per-segment stacked bars */
  variant?: "pie" | "stacked";
  height?: number;
}

const SEGMENT_LABELS: Record<string, string> = {
  traditional: "Traditional",
  low_end: "Low End",
  high_end: "High End",
  performance: "Performance",
  size: "Size",
};

const RADIAN = Math.PI / 180;

interface DoughnutLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

export function MarketShareChart({
  state,
  round,
  variant = "stacked",
  height = 280,
}: MarketShareChartProps) {
  const targetRound = round ?? state.currentRound;
  const entry = state.history.find((h) => h.round === targetRound) ?? state.history[state.history.length - 1];

  // Track the chart container via a callback ref so the ResizeObserver
  // attaches even when the chart appears AFTER mount (e.g. the first
  // round is processed — before that the component renders a "no data"
  // placeholder and the container element doesn't exist yet).
  const [containerEl, setContainerEl] = React.useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  React.useEffect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  if (!entry) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        No data yet — process a round to see market share.
      </div>
    );
  }

  // ── Stacked variant: per-segment stacked bar ──
  if (variant === "stacked") {
    const segmentData = state.segments.map((seg) => {
      const row: Record<string, number | string> = { segment: SEGMENT_LABELS[seg.id] };
      for (const team of state.teams) {
        const tr = entry.teamResults.find((r) => r.teamId === team.id);
        const product = tr?.products.find((p) => p.segment === seg.id);
        row[team.name] = product?.marketShare ?? 0;
      }
      return row;
    });

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={segmentData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
          <XAxis
            dataKey="segment"
            stroke="currentColor"
            strokeOpacity={0.4}
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            strokeOpacity={0.4}
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(17 24 39)",
              border: "1px solid rgb(55 65 81)",
              borderRadius: "0.5rem",
              color: "rgb(243 244 246)",
              fontSize: 12,
              boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.4)",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "rgb(156 163 175)", fontSize: 11, marginBottom: 4 }}
            itemStyle={{ color: "rgb(243 244 246)" }}
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
          {state.teams.map((team) => (
            <Bar
              key={team.id}
              dataKey={team.name}
              stackId="share"
              fill={team.color}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ── Doughnut variant: true market share vs total market demand ──
  // Reading = team units sold / total market demand for that round.
  // Unserved demand renders as a grey "Unfilled" slice, so slice angles
  // are honest and all readings sum to exactly 100% of the market.
  const segmentsForRound = entry.segmentSnapshots?.length
    ? entry.segmentSnapshots
    : state.segments;
  const totalMarketDemand = segmentsForRound.reduce((s, sg) => s + sg.totalDemand, 0);

  const teamSlices = state.teams
    .map((team) => {
      const tr = entry.teamResults.find((r) => r.teamId === team.id);
      const totalSold = tr?.products.reduce((s, p) => s + p.unitsSold, 0) ?? 0;
      return { name: team.name, value: totalSold, color: team.color, unfilled: false };
    })
    // Skip teams with zero sales so the chart isn't cluttered with empty slices
    .filter((d) => d.value > 0);

  if (teamSlices.length === 0 || totalMarketDemand <= 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground text-sm"
        style={{ height }}
      >
        No units sold this round yet.
      </div>
    );
  }

  const totalSold = teamSlices.reduce((s, d) => s + d.value, 0);
  const unfilledDemand = Math.max(0, totalMarketDemand - totalSold);
  const UNFILLED_LABEL = "Unfilled demand";

  const pieData = [
    ...teamSlices,
    // Grey remainder slice = demand nobody captured (stockouts, empty segments)
    ...(unfilledDemand > 0
      ? [{ name: UNFILLED_LABEL, value: unfilledDemand, color: "rgba(100, 116, 139, 0.4)", unfilled: true }]
      : []),
  ];

  // Scale the doughnut so outside labels always fit inside the container —
  // both vertically (card height) and horizontally (card width).
  const chartHeight = height - 34; // reserve a strip for the legend below
  const outerR = Math.min(76, chartHeight * 0.34, containerWidth * 0.19 || 76);
  const innerR = outerR * 0.62;

  // Two-line labels (name + share) need a little more room than a bare %
  const showNames = containerWidth >= 340;
  // Center stat only when the hole is wide enough for the text
  const showCenter = innerR >= 34;

  /**
   * Custom outside label with leader line.
   * Positions are computed from the slice geometry (cx, cy, midAngle,
   * outerRadius) — this guarantees every label sits next to its own
   * slice instead of piling up in the corner.
   */
  const renderDoughnutLabel = (props: DoughnutLabelProps) => {
    const { cx, cy, midAngle, percent, index } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    // Radial leader line: from the slice edge outward
    const sx = cx + (outerR + 3) * cos;
    const sy = cy + (outerR + 3) * sin;
    const mx = cx + (outerR + 11) * cos;
    const my = cy + (outerR + 11) * sin;
    // Horizontal elbow, always pointing away from the center
    const side = cos >= 0 ? 1 : -1;
    const ex = mx + side * 12;
    const ey = my;
    const slice = pieData[index];
    const isUnfilled = slice?.unfilled === true;
    // True market share: value / total market demand. With the grey
    // unfilled slice included, pieData sums to totalMarketDemand, so
    // recharts' `percent` IS the share of the whole market.
    const share = percent ?? (slice ? slice.value / Math.max(totalMarketDemand, 1) : 0);
    // Short label = first word of the team name (e.g. "Vanguard")
    const shortName = isUnfilled ? "Unfilled" : (slice?.name.split(" ")[0] ?? "");
    const anchor = side >= 0 ? "start" : "end";
    const shadow = { textShadow: "0 1px 3px rgb(0 0 0 / 0.6)" };
    // Muted styling for the grey remainder slice
    const nameFill = isUnfilled ? "rgb(148 163 184)" : "rgb(203 213 225)";
    const valueFill = isUnfilled ? "rgb(148 163 184)" : "rgb(241 245 249)";
    const valueWeight = isUnfilled ? 500 : 700;

    if (!showNames) {
      return (
        <g>
          <path
            d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
            stroke="rgb(148 163 184)"
            strokeOpacity={0.6}
            fill="none"
            strokeWidth={1}
          />
          <text
            x={ex + side * 5}
            y={ey}
            textAnchor={anchor}
            dominantBaseline="central"
            fill={valueFill}
            fontSize={11}
            fontWeight={valueWeight}
            style={shadow}
          >
            {(share * 100).toFixed(1)}%
          </text>
        </g>
      );
    }

    // Two-line label: team name on top, share below (compact + readable)
    return (
      <g>
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke="rgb(148 163 184)"
          strokeOpacity={0.6}
          fill="none"
          strokeWidth={1}
        />
        <text
          x={ex + side * 5}
          y={ey - 6}
          textAnchor={anchor}
          dominantBaseline="central"
          fill={nameFill}
          fontSize={10.5}
          fontWeight={500}
          style={shadow}
        >
          {shortName}
        </text>
        <text
          x={ex + side * 5}
          y={ey + 8}
          textAnchor={anchor}
          dominantBaseline="central"
          fill={valueFill}
          fontSize={11.5}
          fontWeight={valueWeight}
          style={shadow}
        >
          {(share * 100).toFixed(1)}%
        </text>
      </g>
    );
  };

  return (
    <div ref={setContainerEl}>
      <div className="relative" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart margin={{ top: 6, right: 18, bottom: 6, left: 18 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={innerR}
              outerRadius={outerR}
              paddingAngle={2}
              label={renderDoughnutLabel}
              labelLine={false}
              isAnimationActive
            >
              {pieData.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(17 24 39)",
                border: "1px solid rgb(55 65 81)",
                borderRadius: "0.5rem",
                color: "rgb(243 244 246)",
                fontSize: 12,
                boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.4)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "rgb(156 163 175)", fontSize: 11, marginBottom: 4 }}
              itemStyle={{ color: "rgb(243 244 246)" }}
              formatter={(value: number, name: string) => {
                const pct = ((value / Math.max(totalMarketDemand, 1)) * 100).toFixed(1);
                if (name === UNFILLED_LABEL) {
                  return [`${value.toLocaleString()} units unserved · ${pct}% of market`, name];
                }
                return [`${value.toLocaleString()} units · ${pct}% of market demand`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center stat: total market demand for the round.
            Kept narrow ("total demand" line ≈ 66px) so it never touches
            the ring even in the smallest visible hole (68px). */}
        {showCenter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-bold tabular-nums leading-tight">
              {totalMarketDemand.toLocaleString()}
            </span>
            <span className="text-[8.5px] text-muted-foreground mt-0.5">
              total demand
            </span>
            <span className="text-[8.5px] text-muted-foreground/70">
              Round {targetRound}
            </span>
          </div>
        )}
      </div>
      {/* Compact legend: team colors + names (keeps labels on the chart short) */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ background: d.color }}
            />
            <span className="truncate max-w-[140px] sm:max-w-[200px]" title={d.name}>
              {d.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
