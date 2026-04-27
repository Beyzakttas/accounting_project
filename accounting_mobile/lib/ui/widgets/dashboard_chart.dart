import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardChart extends StatelessWidget {
  final List<dynamic>? dailyData;

  const DashboardChart({super.key, this.dailyData});

  @override
  Widget build(BuildContext context) {
    if (dailyData == null || dailyData!.isEmpty) {
      return const SizedBox.shrink();
    }

    // Haftalık gruplama yapalım (Son 4 hafta)
    final weeklyData = _processWeeklyData(dailyData!);

    return Container(
      height: 300,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Haftalık Analiz',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: _calculateMaxY(weeklyData),
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        int index = value.toInt();
                        if (index >= 0 && index < weeklyData.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              weeklyData[index]['label'] ?? '',
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
                          style: const TextStyle(fontSize: 9),
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
                barGroups: List.generate(weeklyData.length, (index) {
                  final data = weeklyData[index];
                  return BarChartGroupData(
                    x: index,
                    barRods: [
                      BarChartRodData(
                        toY: (data['income'] ?? 0).toDouble(),
                        color: Colors.greenAccent,
                        width: 12,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      BarChartRodData(
                        toY: (data['expense'] ?? 0).toDouble(),
                        color: Colors.redAccent,
                        width: 12,
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

  List<Map<String, dynamic>> _processWeeklyData(List<dynamic> dailyData) {
    List<Map<String, dynamic>> weeks = [
      {'label': '4 Hf. Önce', 'income': 0.0, 'expense': 0.0},
      {'label': '3 Hf. Önce', 'income': 0.0, 'expense': 0.0},
      {'label': 'Geçen Hf.', 'income': 0.0, 'expense': 0.0},
      {'label': 'Bu Hafta', 'income': 0.0, 'expense': 0.0},
    ];

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    for (var item in dailyData) {
      DateTime itemDate;
      if (item['date'] != null) {
        // API'den gelen date string veya object'i parse edelim
        itemDate = DateTime.parse(item['date'].toString());
      } else {
        // Fallback: dateStr parse etmeye çalışalım (GG/AA)
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

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  double _calculateMaxY(List<Map<String, dynamic>> data) {
    double max = 0;
    for (var item in data) {
      if (item['income'] > max) max = item['income'];
      if (item['expense'] > max) max = item['expense'];
    }
    return max == 0 ? 100 : max * 1.15;
  }
}
