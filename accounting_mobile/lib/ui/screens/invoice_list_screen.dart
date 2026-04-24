import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../providers/invoice_provider.dart';
import 'add_invoice_screen.dart';
import 'package:intl/intl.dart';

class InvoiceListScreen extends StatefulWidget {
  const InvoiceListScreen({super.key});

  @override
  State<InvoiceListScreen> createState() => _InvoiceListScreenState();
}

class _InvoiceListScreenState extends State<InvoiceListScreen> {
  final currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');
  final dateFormat = DateFormat('dd.MM.yyyy');

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<InvoiceProvider>().fetchInvoices());
  }

  @override
  Widget build(BuildContext context) {
    final invoiceProvider = Provider.of<InvoiceProvider>(context);
    final invoices = invoiceProvider.invoices;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Faturalar'),
      ),
      body: invoiceProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => invoiceProvider.fetchInvoices(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: invoices.length,
                itemBuilder: (context, index) {
                  final invoice = invoices[index];
                  final isIncome = invoice['type'] == 'INCOME';

                  return FadeInUp(
                    delay: Duration(milliseconds: index * 50),
                    child: Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isIncome
                              ? Colors.greenAccent.withOpacity(0.1)
                              : Colors.redAccent.withOpacity(0.1),
                          child: Icon(
                            isIncome ? Icons.arrow_downward : Icons.arrow_upward,
                            color: isIncome ? Colors.greenAccent : Colors.redAccent,
                          ),
                        ),
                        title: Text(
                          '${invoice['vendor'] ?? 'Genel'} - ${invoice['description'] ?? 'Açıklama Yok'}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          invoice['date'] != null
                              ? dateFormat.format(DateTime.parse(invoice['date']))
                              : 'Tarih Yok',
                        ),
                        trailing: Text(
                          currencyFormat.format(invoice['amount'] ?? 0.0),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isIncome ? Colors.greenAccent : Colors.white,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddInvoiceScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
