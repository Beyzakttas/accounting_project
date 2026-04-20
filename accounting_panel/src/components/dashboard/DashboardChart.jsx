import React from 'react';

const DashboardChart = ({ stats }) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const weeklyData = [
    { label: "4 Hafta Önce", income: 0, expense: 0, minDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
    { label: "3 Hafta Önce", income: 0, expense: 0, minDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
    { label: "Geçen Hafta", income: 0, expense: 0, minDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { label: "Bu Hafta", income: 0, expense: 0, minDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), maxDate: now }
  ];

  if (stats.dailyData && stats.dailyData.length > 0) {
    stats.dailyData.forEach(dayItem => {
      const [day, month] = dayItem.dateStr.split('/');
      const year = new Date().getFullYear();
      const d = new Date(`${year}-${month}-${day}T12:00:00`);

      if (!isNaN(d)) {
        for (let week of weeklyData) {
          if (d > week.minDate && d <= week.maxDate) {
            week.income += dayItem.income;
            week.expense += dayItem.expense;
            break;
          }
        }
      }
    });
  }

  const rawMax = Math.max(...weeklyData.map(w => Math.max(w.income, w.expense)));
  const maxVal = rawMax > 0 ? (Math.ceil(rawMax / 100) * 100) : 100;
  const yLabels = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  return (
    <div className="chart-section glass-card">
      <div className="card-header">
        <h2>Gelir/Gider Analizi</h2>
        <button className="icon-btn">⋮</button>
      </div>
      <div className="chart-container">
        {/* Y-Axis Labels */}
        <div className="chart-y-axis">
          {yLabels.map((val, i) => (
            <span key={i}>₺{val >= 1000 ? (val / 1000).toFixed(0) + 'k' : Math.floor(val)}</span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="chart-main-area">
          {weeklyData.map((week, idx) => {
            const hInc = (week.income / maxVal) * 100;
            const hExp = (week.expense / maxVal) * 100;
            const isEmpty = week.income === 0 && week.expense === 0;

            return (
              <div key={idx} className="chart-column" style={{ opacity: isEmpty ? 0.3 : 1 }}>
                <div className="chart-bar-group">
                  {/* Income Bar */}
                  <div
                    className="chart-bar bar-income"
                    style={{ height: `${Math.max(hInc, isEmpty ? 0 : 4)}%` }}
                    title={`Gelir: ₺${week.income.toLocaleString()}`}
                  >
                    {week.income > 0 && (
                      <span className="bar-value-label label-income">
                        ₺{week.income >= 1000 ? (week.income / 1000).toFixed(1) + 'k' : week.income}
                      </span>
                    )}
                  </div>

                  {/* Expense Bar */}
                  <div
                    className="chart-bar bar-expense"
                    style={{ height: `${Math.max(hExp, isEmpty ? 0 : 4)}%` }}
                    title={`Gider: ₺${week.expense.toLocaleString()}`}
                  >
                    {week.expense > 0 && (
                      <span className="bar-value-label label-expense">
                        ₺{week.expense >= 1000 ? (week.expense / 1000).toFixed(1) + 'k' : week.expense}
                      </span>
                    )}
                  </div>
                </div>
                <div className="chart-x-label">
                  {week.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;
