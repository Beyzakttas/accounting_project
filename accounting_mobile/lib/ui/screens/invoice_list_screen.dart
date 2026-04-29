import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/invoice_provider.dart';
import '../../providers/ai_provider.dart';
import 'add_invoice_screen.dart';
import '../core/utils/formatters.dart';

class InvoiceListScreen extends StatefulWidget {
  const InvoiceListScreen({super.key});

  @override
  State<InvoiceListScreen> createState() => _InvoiceListScreenState();
}

class _InvoiceListScreenState extends State<InvoiceListScreen> {
  String _filter = 'ALL'; // 'ALL', 'INCOME', 'EXPENSE'

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<InvoiceProvider>().fetchInvoices());
  }

  Future<void> _scanInvoiceWithAi() async {
    final aiProvider = context.read<AiProvider>();
    final ImagePicker picker = ImagePicker();
    
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Kamera ile Çek'),
              onTap: () async {
                Navigator.pop(ctx);
                final XFile? image = await picker.pickImage(source: ImageSource.camera);
                if (image != null) _processImage(image, aiProvider);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeriden Seç'),
              onTap: () async {
                Navigator.pop(ctx);
                final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                if (image != null) _processImage(image, aiProvider);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processImage(XFile image, AiProvider aiProvider) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Yapay Zeka faturayı analiz ediyor...'),
          ],
        ),
      ),
    );

    final data = await aiProvider.analyzeInvoice(image);
    
    if (mounted) {
      Navigator.pop(context); // Close loading dialog
      
      if (data != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AddInvoiceScreen(
              initialData: data,
              initialImage: image,
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Fatura analiz edilemedi. Lütfen tekrar deneyin.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final invoiceProvider = Provider.of<InvoiceProvider>(context);
    
    // Filtreleme mantığı
    final invoices = invoiceProvider.invoices.where((invoice) {
      if (_filter == 'ALL') return true;
      return invoice['type'] == _filter;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Faturalar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.document_scanner_outlined),
            onPressed: _scanInvoiceWithAi,
            tooltip: 'AI ile Tara',
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtreleme Paneli
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12.0),
            decoration: BoxDecoration(
              color: Theme.of(context).cardTheme.color,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  _buildFilterChip('Tümü', 'ALL', Icons.list),
                  const SizedBox(width: 10),
                  _buildFilterChip('Gelirler', 'INCOME', Icons.trending_up),
                  const SizedBox(width: 10),
                  _buildFilterChip('Giderler', 'EXPENSE', Icons.trending_down),
                ],
              ),
            ),
          ),
          Expanded(
            child: invoiceProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => invoiceProvider.fetchInvoices(),
                    child: invoices.isEmpty 
                      ? const Center(child: Text('Fatura bulunamadı.'))
                      : ListView.builder(
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
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => AddInvoiceScreen(invoiceToEdit: invoice),
                                      ),
                                    );
                                  },
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
                                        ? AppFormatters.dateFormat.format(DateTime.parse(invoice['date']))
                                        : 'Tarih Yok',
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        AppFormatters.currencyFormat.format(invoice['amount'] ?? 0.0),
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: isIncome ? Colors.greenAccent : Colors.redAccent,
                                        ),
                                      ),
                                      PopupMenuButton<String>(
                                        icon: const Icon(Icons.more_vert, color: Colors.blueAccent),
                                        onSelected: (value) async {
                                          if (value == 'edit') {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => AddInvoiceScreen(invoiceToEdit: invoice),
                                              ),
                                            );
                                          } else if (value == 'delete') {
                                            showDialog(
                                              context: context,
                                              builder: (ctx) => AlertDialog(
                                                title: const Text('Faturayı Sil'),
                                                content: const Text('Bu faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () => Navigator.pop(ctx),
                                                    child: const Text('Vazgeç'),
                                                  ),
                                                  TextButton(
                                                    onPressed: () async {
                                                      Navigator.pop(ctx);
                                                      final success = await context.read<InvoiceProvider>().deleteInvoice(invoice['_id']);
                                                      if (success && mounted) {
                                                        ScaffoldMessenger.of(context).showSnackBar(
                                                          const SnackBar(content: Text('Fatura başarıyla silindi!')),
                                                        );
                                                      }
                                                    },
                                                    child: const Text('Sil', style: TextStyle(color: Colors.redAccent)),
                                                  ),
                                                ],
                                              ),
                                            );
                                          } else if (value == 'share') {
                                            context.read<InvoiceProvider>().shareInvoice(invoice);
                                          } else if (value == 'download') {
                                            if (invoice['imageUrl'] != null) {
                                              final success = await context
                                                  .read<InvoiceProvider>()
                                                  .downloadInvoice(invoice['imageUrl']);
                                              
                                              if (mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text(success 
                                                        ? 'Fatura galeriye kaydedildi.' 
                                                        : 'İndirme başarısız oldu.'),
                                                    backgroundColor: success ? Colors.green : Colors.red,
                                                  ),
                                                );
                                              }
                                            } else {
                                              await context
                                                  .read<InvoiceProvider>()
                                                  .generateAndShareInvoicePdf(invoice);
                                            }
                                          }
                                        },
                                        itemBuilder: (context) => [
                                          const PopupMenuItem(
                                            value: 'edit',
                                            child: Row(
                                              children: [
                                                Icon(Icons.edit_rounded, size: 20, color: Colors.blueAccent),
                                                SizedBox(width: 8),
                                                Text('Düzenle'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'share',
                                            child: Row(
                                              children: [
                                                Icon(Icons.share_rounded, size: 20, color: Colors.blueAccent),
                                                SizedBox(width: 8),
                                                Text('Paylaş'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'download',
                                            child: Row(
                                              children: [
                                                Icon(Icons.download_rounded, size: 20, color: Colors.blueAccent),
                                                SizedBox(width: 8),
                                                Text('İndir'),
                                              ],
                                            ),
                                          ),
                                          const PopupMenuItem(
                                            value: 'delete',
                                            child: Row(
                                              children: [
                                                Icon(Icons.delete_rounded, size: 20, color: Colors.redAccent),
                                                SizedBox(width: 8),
                                                Text('Sil', style: TextStyle(color: Colors.redAccent)),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                  ),
          ),
        ],
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

  Widget _buildFilterChip(String label, String value, IconData icon) {
    final isSelected = _filter == value;
    final color = value == 'INCOME' 
        ? Colors.greenAccent 
        : (value == 'EXPENSE' ? Colors.redAccent : Colors.blueAccent);

    return ChoiceChip(
      avatar: Icon(
        icon,
        size: 16,
        color: isSelected ? Colors.white : color.withOpacity(0.7),
      ),
      label: Text(label),
      selected: isSelected,
      onSelected: (bool selected) {
        setState(() {
          _filter = value;
        });
      },
      selectedColor: color,
      backgroundColor: Theme.of(context).cardTheme.color,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isSelected ? color : Colors.grey.withOpacity(0.2),
        ),
      ),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 13,
      ),
    );
  }
}
