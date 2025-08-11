// src/pages/AdminFinanceDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import adminFinanceService from "../Components/adminFinanceService";
import Chart from "react-apexcharts";
import "../Styles/AdminFinance.css";

const AdminFinanceDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [incomeBreakdown, setIncomeBreakdown] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define date states
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    return lastDayOfMonth.toISOString().split("T")[0];
  });

  // This date is used for the 12-month report, always based on the current date.
  const currentReportEndDate = new Date().toISOString().split("T")[0];

  // --- Move these functions BEFORE the useEffect hook ---

  const fetchFinanceReports = useCallback(async () => {
    setLoading(true); // Set loading true at the start of fetch
    setError(null);
    try {
      const summaryData = await adminFinanceService.getFinanceSummary(
        startDate,
        endDate
      );
      setSummary(summaryData);

      const incomeBreakdownData =
        await adminFinanceService.getCategoryBreakdown(
          "income",
          startDate,
          endDate
        );
      setIncomeBreakdown(incomeBreakdownData);

      const expenseBreakdownData =
        await adminFinanceService.getCategoryBreakdown(
          "expense",
          startDate,
          endDate
        );
      setExpenseBreakdown(expenseBreakdownData);
    } catch (err) {
      setError(err.message || "Failed to load finance reports.");
      console.error("Error fetching finance reports:", err);
    } finally {
      // setLoading(false); // Only set loading false once ALL fetches are complete or handle granularly
    }
  }, [startDate, endDate]);

  const fetchMonthlyFinanceSummary = useCallback(async (endDateForMonthly) => {
    setLoading(true); // Set loading true at the start of fetch
    setError(null);
    try {
      const data = await adminFinanceService.getMonthlyFinanceSummary(
        endDateForMonthly
      );
      setMonthlySummary(data);
    } catch (err) {
      setError(err.message || "Failed to load monthly finance summary.");
      console.error("Error fetching monthly finance summary:", err);
    } finally {
      // setLoading(false); // Only set loading false once ALL fetches are complete or handle granularly
    }
  }, []);

  // --- Now, the useEffect can safely call them ---
  useEffect(() => {
    // Call both fetch functions
    Promise.all([
      fetchFinanceReports(),
      fetchMonthlyFinanceSummary(currentReportEndDate),
    ])
      .then(() => setLoading(false)) // Set loading false once all promises resolve
      .catch((err) => {
        // Error is already set within individual fetch functions
        setLoading(false);
        console.error("Error during overall report fetch:", err);
      });
  }, [
    startDate,
    endDate,
    fetchFinanceReports,
    fetchMonthlyFinanceSummary,
    currentReportEndDate,
  ]);

  // --- Data and Options for ApexCharts (remain the same) ---

  // Donut Chart สำหรับ Income Breakdown
  const incomeDonutChartOptions = {
    labels: incomeBreakdown.map((item) => item.category_name),
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "top",
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const total = incomeBreakdown.reduce(
          (sum, item) => sum + parseFloat(item.total_amount),
          0
        );
        const percentage =
          (parseFloat(opts.w.globals.series[opts.seriesIndex]) / total) * 100;
        return `${percentage.toFixed(2)}%`; // แสดงเป็นเปอร์เซ็นต์
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return (
            parseFloat(val).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + " บาท"
          );
        },
      },
    },
    colors: ["#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800"], // ตัวอย่างสี
  };

  const incomeDonutChartSeries = incomeBreakdown.map((item) =>
    parseFloat(item.total_amount)
  );

  // Bar Chart สำหรับ Expense Breakdown
  const expenseBarChartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true, // ทำให้เป็น Horizontal Bar Chart
      },
    },
    xaxis: {
      categories: expenseBreakdown.map((item) => item.category_name),
      labels: {
        formatter: function (val) {
          return parseFloat(val).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
    },
    dataLabels: {
      enabled: false, // สามารถเปิดใช้งานได้หากต้องการแสดงค่าบนบาร์
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " บาท";
        },
      },
    },
    colors: ["#F44336"], // ตัวอย่างสี
  };

  const expenseBarChartSeries = [
    {
      name: "รายจ่าย",
      data: expenseBreakdown.map((item) => parseFloat(item.total_amount)),
    },
  ];

  // Column Chart สำหรับ Monthly Income/Expense Summary
  const monthlyColumnChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthlySummary.map((item) => item.month),
      title: {
        text: "เดือน",
      },
    },
    yaxis: {
      title: {
        text: "",
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(0);
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return (
            parseFloat(val).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + " บาท"
          );
        },
      },
    },
    colors: ["#4CAF50", "#F44336"],
  };

  const monthlyColumnChartSeries = [
    {
      name: "รายรับ",
      data: monthlySummary.map((item) => item.total_income),
    },
    {
      name: "รายจ่าย",
      data: monthlySummary.map((item) => item.total_expense),
    },
  ];

  return (
    <div className="admin-finance-container">
      <h1>รายรับ - รายจ่าย</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="date-filters">
        <label>
          เริ่มต้น:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          สิ้นสุด:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <p>Loading finance reports...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="card">
              <h3>รายรับ</h3>
              <p>
                {summary
                  ? parseFloat(summary.totalIncome).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}{" "}
                บาท
              </p>
            </div>
            <div className="card">
              <h3>รายจ่าย</h3>
              <p>
                {summary
                  ? parseFloat(summary.totalExpense).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}{" "}
                บาท
              </p>
            </div>
            <div className="card">
              <h3>กำไรสุทธิ</h3>
              <p
                className={
                  summary && summary.netProfit < 0
                    ? "negative-profit"
                    : "positive-profit"
                }
              >
                {summary
                  ? parseFloat(summary.netProfit).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}{" "}
                บาท
              </p>
            </div>
          </div>

          {/* Monthly Finance Summary Chart */}
          <div className="report-section full-width-chart">
            <h2>รายรับ - รายจ่าย ประจำเดือน</h2>
            {monthlySummary.length === 0 ? (
              <p>No monthly data available for the last 12 months.</p>
            ) : (
              <Chart
                options={monthlyColumnChartOptions}
                series={monthlyColumnChartSeries}
                type="bar"
                height={350}
              />
            )}
          </div>

          {/* Charts/Breakdowns */}
          <div className="report-sections">
            <div className="report-section">
              <h2>รายรับ</h2>
              {incomeBreakdown.length === 0 ? (
                <p>No income transactions for this period.</p>
              ) : (
                <>
                  <Chart
                    options={incomeDonutChartOptions}
                    series={incomeDonutChartSeries}
                    type="donut"
                    height={350}
                  />
                  <table className="admin-table-finance">
                    <thead>
                      <tr>
                        <th>หมวดหมู่</th>
                        <th>จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeBreakdown.map((item) => (
                        <tr key={item.category_id}>
                          <td>{item.category_name}</td>
                          <td>
                            {parseFloat(item.total_amount).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="report-section">
              <h2>รายจ่าย</h2>
              {expenseBreakdown.length === 0 ? (
                <p>No expense transactions for this period.</p>
              ) : (
                <>
                  <Chart
                    options={expenseBarChartOptions}
                    series={expenseBarChartSeries}
                    type="bar"
                    height={350}
                  />
                  <table className="admin-table-finance">
                    <thead>
                      <tr>
                        <th>หมวดหมู่</th>
                        <th>จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseBreakdown.map((item) => (
                        <tr key={item.category_id}>
                          <td>{item.category_name}</td>
                          <td>
                            {parseFloat(item.total_amount).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFinanceDashboard;
