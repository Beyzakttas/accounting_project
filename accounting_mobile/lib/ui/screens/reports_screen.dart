import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../providers/invoice_provider.dart';
import '../widgets/category_pie_chart.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final invoiceProvider = Provider.of<InvoiceProvider>(context);
    final stats = invoiceProvider.stats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Finansal Raporlar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_rounded),
            onPressed: () => invoiceProvider.generateFullReportPdf(),
            tooltip: 'Genel Raporu İndir',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: invoiceProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => invoiceProvider.fetchStats(),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FadeInDown(
                      child: Text(
                        'Kategori Bazlı Dağılım',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Gelir ve giderlerinizin kategorilere göre dökümü.',
                      style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6)),
                    ),
                    const SizedBox(height: 32),
                    FadeInUp(
                      delay: const Duration(milliseconds: 200),
                      child: CategoryPieChart(
                        categoryData: stats?['categoryData'],
                        type: 'INCOME',
                      ),
                    ),
                    const SizedBox(height: 24),
                    FadeInUp(
                      delay: const Duration(milliseconds: 400),
                      child: CategoryPieChart(
                        categoryData: stats?['categoryData'],
                        type: 'EXPENSE',
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Bilgi Notu
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.blueAccent.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blueAccent.withOpacity(0.1)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.blueAccent),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Bu raporlar son 30 günlük verileriniz temel alınarak oluşturulmuştur.',
                              style: TextStyle(fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
