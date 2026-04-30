import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

enum ChartPeriod { daily, weekly, yearly }

class DashboardChart extends StatefulWidget {
  final Map<String, dynamic>? stats;

  const DashboardChart({super.key, this.stats});

  @override
  State<DashboardChart> createState() => _DashboardChartState();
}

class _DashboardChartState extends State<DashboardChart> {
  ChartPeriod _selectedPeriod = ChartPeriod.weekly;

  @override
  Widget build(BuildContext context) {
    if (widget.stats == null) {
      return const SizedBox.shrink();
    }

    final List<dynamic> dailyData = widget.stats!['dailyData'] ?? [];
    final List<dynamic> monthlyData = widget.stats!['monthlyData'] ?? [];

    if (dailyData.isEmpty && monthlyData.isEmpty) {
      return const SizedBox.shrink();
    }

    List<Map<String, dynamic>> chartData = [];
    String title = '';

    switch (_selectedPeriod) {
      case ChartPeriod.daily:
        chartData = _processDailyData(dailyData);
        title = 'Günlük Analiz (Son 7 Gün)';
        break;
      case ChartPeriod.weekly:
        chartData = _processWeeklyData(dailyData);
        title = 'Haftalık Analiz (Son 4 Hafta)';
        break;
      case ChartPeriod.yearly:
        chartData = _processYearlyData(monthlyData);
        title = 'Yıllık Analiz (Aylık)';
        break;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              _buildPeriodSelector(),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: _calculateMaxY(chartData),
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    tooltipBgColor: Theme.of(context).colorScheme.surface,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      String category = rodIndex == 0 ? 'Gelir' : 'Gider';
                      return BarTooltipItem(
                        '$category\n${rod.toY.toStringAsFixed(0)} ₺',
                        TextStyle(color: rod.color, fontWeight: FontWeight.bold),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        int index = value.toInt();
                        if (index >= 0 && index < chartData.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              chartData[index]['label'] ?? '',
                              style: const TextStyle(fontSize: 9),
                            ),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 35,
                      getTitlesWidget: (value, meta) {
                        if (value == 0) return const Text('0');
                        return Text(
                          value >= 1000 ? '${(value / 1000).toStringAsFixed(0)}k' : value.toStringAsFixed(0),
                          style: const TextStyle(fontSize: 8),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Theme.of(context).dividerColor.withOpacity(0.05),
                    strokeWidth: 1,
                  ),
                ),
                borderData: FlBorderData(show: false),
                barGroups: List.generate(chartData.length, (index) {
                  final data = chartData[index];
                  return BarChartGroupData(
                    x: index,
                    barRods: [
                      BarChartRodData(
                        toY: (data['income'] ?? 0).toDouble(),
                        color: Colors.greenAccent,
                        width: _selectedPeriod == ChartPeriod.daily ? 8 : 12,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      BarChartRodData(
                        toY: (data['expense'] ?? 0).toDouble(),
                        color: Colors.redAccent,
                        width: _selectedPeriod == ChartPeriod.daily ? 8 : 12,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  );
                }),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem('Gelir', Colors.greenAccent),
              const SizedBox(width: 24),
              _buildLegendItem('Gider', Colors.redAccent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodSelector() {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).dividerColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildPeriodButton('G', ChartPeriod.daily),
          _buildPeriodButton('H', ChartPeriod.weekly),
          _buildPeriodButton('Y', ChartPeriod.yearly),
        ],
      ),
    );
  }

  Widget _buildPeriodButton(String label, ChartPeriod period) {
    final isSelected = _selectedPeriod == period;
    return GestureDetector(
      onTap: () => setState(() => _selectedPeriod = period),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
      ),
    );
  }

  List<Map<String, dynamic>> _processDailyData(List<dynamic> dailyData) {
    // Son 7 günü alalım
    if (dailyData.length > 7) {
      return dailyData.sublist(dailyData.length - 7).map((e) => {
        'label': e['dateStr'],
        'income': e['income'],
        'expense': e['expense'],
      }).toList();
    }
    return dailyData.map((e) => {
      'label': e['dateStr'],
      'income': e['income'],
      'expense': e['expense'],
    }).toList();
  }

  List<Map<String, dynamic>> _processWeeklyData(List<dynamic> dailyData) {
    List<Map<String, dynamic>> weeks = [
      {'label': '4 Hf.', 'income': 0.0, 'expense': 0.0},
      {'label': '3 Hf.', 'income': 0.0, 'expense': 0.0},
      {'label': 'Geçen', 'income': 0.0, 'expense': 0.0},
      {'label': 'Bu Hf.', 'income': 0.0, 'expense': 0.0},
    ];

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    for (var item in dailyData) {
      DateTime itemDate;
      if (item['date'] != null) {
        itemDate = DateTime.parse(item['date'].toString());
      } else {
        try {
          final parts = item['dateStr'].split('/');
          itemDate = DateTime(now.year, int.parse(parts[1]), int.parse(parts[0]));
        } catch (e) {
          continue;
        }
      }

      final difference = today.difference(itemDate).inDays;
      int weekIndex = 3 - (difference ~/ 7);

      if (weekIndex >= 0 && weekIndex < 4) {
        weeks[weekIndex]['income'] += (item['income'] ?? 0).toDouble();
        weeks[weekIndex]['expense'] += (item['expense'] ?? 0).toDouble();
      }
    }
    return weeks;
  }

  List<Map<String, dynamic>> _processYearlyData(List<dynamic> monthlyData) {
    return monthlyData.map((e) => {
      'label': e['monthStr'],
      'income': e['income'],
      'expense': e['expense'],
    }).toList();
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  double _calculateMaxY(List<Map<String, dynamic>> data) {
    double max = 0;
    for (var item in data) {
      if (item['income'] > max) max = item['income'].toDouble();
      if (item['expense'] > max) max = item['expense'].toDouble();
    }
    return max == 0 ? 100 : max * 1.2;
  }
}
