"use client";

import { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

export type TrendPoint = {
  key: string;
  label: string;
  value: number;
};

type ValueFormatter = (value: number) => string;

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function makeChartCommonOptions(valueFormatter: ValueFormatter) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        borderColor: "rgba(148, 163, 184, 0.32)",
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: false,
        padding: 10,
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        titleFont: {
          size: 12,
          weight: 600,
        },
        bodyFont: {
          size: 12,
          weight: 500,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "#e2e8f0",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          maxTicksLimit: 6,
          callback: (tickValue: string | number) =>
            valueFormatter(Number(tickValue)),
        },
      },
    },
    animation: {
      duration: 500,
    },
  };
}

export function AreaTrendChart({
  title,
  subtitle,
  data,
  valueFormatter = compactNumber,
  tooltipFormatter,
}: {
  title: string;
  subtitle?: string;
  data: TrendPoint[];
  valueFormatter?: ValueFormatter;
  tooltipFormatter?: ValueFormatter;
}) {
  const safeData = data.length ? data : [{ key: "empty", label: "-", value: 0 }];
  const tooltipValueFormatter = tooltipFormatter || valueFormatter;

  const chartData = useMemo(
    () => ({
      labels: safeData.map((point) => point.label),
      datasets: [
        {
          label: title,
          data: safeData.map((point) => point.value),
          borderColor: "#4f46e5",
          borderWidth: 3,
          tension: 0.34,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "#4f46e5",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          backgroundColor: (context: any) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return "rgba(79, 70, 229, 0.18)";
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(79, 70, 229, 0.34)");
            gradient.addColorStop(1, "rgba(79, 70, 229, 0.04)");
            return gradient;
          },
        },
      ],
    }),
    [safeData, title],
  );

  const options = useMemo(() => {
    const common = makeChartCommonOptions(valueFormatter);
    return {
      ...common,
      plugins: {
        ...common.plugins,
        tooltip: {
          ...common.plugins.tooltip,
          callbacks: {
            title: (items: TooltipItem<"line">[]) => items[0]?.label || "",
            label: (item: TooltipItem<"line">) =>
              `Value: ${tooltipValueFormatter(Number(item.parsed.y || 0))}`,
          },
        },
      },
    };
  }, [tooltipValueFormatter, valueFormatter]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="h-[280px] w-full sm:h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}

export function BarTrendChart({
  title,
  subtitle,
  data,
  valueFormatter = compactNumber,
  tooltipFormatter,
}: {
  title: string;
  subtitle?: string;
  data: TrendPoint[];
  valueFormatter?: ValueFormatter;
  tooltipFormatter?: ValueFormatter;
}) {
  const safeData = data.length ? data : [{ key: "empty", label: "-", value: 0 }];
  const tooltipValueFormatter = tooltipFormatter || valueFormatter;

  const chartData = useMemo(
    () => ({
      labels: safeData.map((point) => point.label),
      datasets: [
        {
          label: title,
          data: safeData.map((point) => point.value),
          backgroundColor: "rgba(79, 70, 229, 0.92)",
          borderRadius: 8,
          borderSkipped: false as const,
          maxBarThickness: 26,
          categoryPercentage: 0.72,
          barPercentage: 0.9,
        },
      ],
    }),
    [safeData, title],
  );

  const options = useMemo(() => {
    const common = makeChartCommonOptions(valueFormatter);
    return {
      ...common,
      plugins: {
        ...common.plugins,
        tooltip: {
          ...common.plugins.tooltip,
          callbacks: {
            title: (items: TooltipItem<"bar">[]) => items[0]?.label || "",
            label: (item: TooltipItem<"bar">) =>
              `Value: ${tooltipValueFormatter(Number(item.parsed.y || 0))}`,
          },
        },
      },
    };
  }, [tooltipValueFormatter, valueFormatter]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>

      <div className="h-[280px] w-full sm:h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}
