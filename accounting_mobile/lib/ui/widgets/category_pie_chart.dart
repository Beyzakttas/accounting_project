import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class CategoryPieChart extends StatelessWidget {
  final List<dynamic>? categoryData;
  final String type; // 'INCOME' or 'EXPENSE'

  const CategoryPieChart({
    super.key,
    required this.categoryData,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
    if (categoryData == null || categoryData!.isEmpty) {
      return const SizedBox.shrink();
    }

    // İlgili tipteki kategorileri filtreleyelim
    var filteredData = categoryData!
        .where((item) => item['type'] == type)
        .toList();

    // Değerlerine göre büyükten küçüğe sıralayalım
    filteredData.sort((a, b) {
      final valA = (a['value'] ?? 0).toDouble();
      final valB = (b['value'] ?? 0).toDouble();
      return valB.compareTo(valA);
    });

    // Eğer 10'dan fazla kategori varsa ilk 9'u alıp kalanları "Diğer" altında toplayalım
    if (filteredData.length > 10) {
      final top9 = filteredData.sublist(0, 9);
      final remaining = filteredData.sublist(9);
      final otherValue = remaining.fold<double>(
        0.0,
        (sum, item) => sum + (item['value'] ?? 0).toDouble(),
      );

      filteredData = List<dynamic>.from(top9)
        ..add({
          'name': 'Diğer',
          'value': otherValue,
          'type': type,
        });
    }

    if (filteredData.isEmpty) {
      return Container(
        height: 200,
        alignment: Alignment.center,
        child: Text(
          '${type == 'INCOME' ? 'Ödenen' : 'Bekleyen'} fatura verisi bulunamadı',
          style: const TextStyle(color: Colors.grey),
        ),
      );
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
          Text(
            '${type == 'INCOME' ? 'Ödenen' : 'Bekleyen'} Fatura Dağılımı',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                sections: _buildSections(filteredData),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Legend
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: filteredData.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              return _buildLegendItem(
                item['name'] ?? 'Kategorisiz',
                _getColor(index),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  List<PieChartSectionData> _buildSections(List<dynamic> data) {
    return List.generate(data.length, (index) {
      final item = data[index];
      final value = (item['value'] ?? 0).toDouble();
      
      return PieChartSectionData(
        color: _getColor(index),
        value: value,
        title: value > 0 ? '${value.toStringAsFixed(0)}₺' : '',
        radius: 50,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      );
    });
  }

  Color _getColor(int index) {
    const colors = [
      Color(0xFF6366F1), // Indigo
      Color(0xFF10B981), // Emerald
      Color(0xFFF59E0B), // Amber
      Color(0xFFEF4444), // Red
      Color(0xFF8B5CF6), // Violet
      Color(0xFFEC4899), // Pink
      Color(0xFF06B6D4), // Cyan
    ];
    return colors[index % colors.length];
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
