import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../providers/auth_provider.dart';
import '../../providers/invoice_provider.dart';
import '../widgets/app_drawer.dart';
import '../widgets/dashboard_chart.dart';
import '../widgets/category_pie_chart.dart';
import 'invoice_list_screen.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<InvoiceProvider>().fetchStats());
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final invoiceProvider = Provider.of<InvoiceProvider>(context);
    final stats = invoiceProvider.stats;

    // Kullanıcı adını belirleyelim
    String displayName = authProvider.user?['fullname'] ?? 'Kullanıcı';
    
    // Eğer isim bir e-posta gibi görünüyorsa veya yoksa, e-postanın başını alalım
    if (displayName.contains('@')) {
      displayName = displayName.split('@')[0];
      // Baş harfini büyük yapalım
      displayName = displayName[0].toUpperCase() + displayName.substring(1);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      drawer: const AppDrawer(),
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
                    FadeInLeft(
                      child: Text(
                        'Hoş geldin, $displayName 👋',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Summary Stats Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildCompactStatCard(
                            context,
                            'Gelir',
                            stats?['totalIncome']?.toDouble() ?? 0.0,
                            Colors.greenAccent,
                            Icons.trending_up,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildCompactStatCard(
                            context,
                            'Gider',
                            stats?['totalExpense']?.toDouble() ?? 0.0,
                            Colors.redAccent,
                            Icons.trending_down,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildStatCard(
                      context,
                      'Net Bakiye',
                      (stats?['totalIncome']?.toDouble() ?? 0.0) -
                          (stats?['totalExpense']?.toDouble() ?? 0.0),
                      Colors.blueAccent,
                      Icons.account_balance_wallet,
                    ),
                    const SizedBox(height: 32),
                    FadeInUp(
                      delay: const Duration(milliseconds: 600),
                      child: DashboardChart(dailyData: stats?['dailyData']),
                    ),
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Son İşlemler',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const InvoiceListScreen(),
                              ),
                            );
                          },
                          child: const Text('Tümünü Gör'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Center(
                      child: Text(
                        'İşlem listesi yakında eklenecek...',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, double amount,
      Color color, IconData icon) {
    return FadeInUp(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    currencyFormat.format(amount),
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCompactStatCard(BuildContext context, String title, double amount,
      Color color, IconData icon) {
    return FadeInUp(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                currencyFormat.format(amount),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
