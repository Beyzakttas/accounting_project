import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';
import 'dart:io';
import '../../providers/invoice_provider.dart';

class AddInvoiceScreen extends StatefulWidget {
  final Map<String, dynamic>? invoiceToEdit;
  final Map<String, dynamic>? initialData;
  final XFile? initialImage;

  const AddInvoiceScreen({super.key, this.invoiceToEdit, this.initialData, this.initialImage});

  @override
  State<AddInvoiceScreen> createState() => _AddInvoiceScreenState();
}

class _AddInvoiceScreenState extends State<AddInvoiceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descController = TextEditingController();
  final _vendorController = TextEditingController();
  final _invoiceNoController = TextEditingController();
  String _type = 'EXPENSE';
  String? _selectedCategory;
  String _department = 'Diger';
  XFile? _image;
  
  @override
  void dispose() {
    _amountController.dispose();
    _descController.dispose();
    _vendorController.dispose();
    _invoiceNoController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    context.read<InvoiceProvider>().fetchCategories();
    
    // Resim varsa ilklendirelim
    if (widget.initialImage != null) {
      _image = widget.initialImage;
    }
    
    if (widget.invoiceToEdit != null) {
      final inv = widget.invoiceToEdit!;
      _amountController.text = inv['amount']?.toString() ?? '';
      _descController.text = inv['description'] ?? '';
      _vendorController.text = inv['vendor'] ?? '';
      _invoiceNoController.text = inv['invoiceNumber'] ?? '';
      _type = inv['type'] ?? 'EXPENSE';
      _department = inv['department'] ?? 'Diger';
      
      if (inv['category'] != null) {
        if (inv['category'] is Map) {
          _selectedCategory = inv['category']['_id'];
        } else {
          _selectedCategory = inv['category'];
        }
      }
    } else if (widget.initialData != null) {
      final data = widget.initialData!;
      _amountController.text = data['amount']?.toString() ?? '';
      _descController.text = data['description'] ?? '';
      _vendorController.text = data['vendor'] ?? '';
      _invoiceNoController.text = data['invoiceNumber'] ?? '';
      _type = data['type'] ?? 'EXPENSE';
      _department = data['department'] ?? 'Diger';
      
      if (data['category'] != null) {
        if (data['category'] is Map) {
          _selectedCategory = data['category']['_id'];
        } else {
          _selectedCategory = data['category'];
        }
      }
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: source);
    if (image != null) {
      setState(() => _image = image);
    }
  }

  @override
  Widget build(BuildContext context) {
    final invoiceProvider = Provider.of<InvoiceProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.invoiceToEdit == null ? 'Yeni Fatura Ekle' : 'Fatura Düzenle'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (widget.invoiceToEdit != null)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
              onPressed: () {
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
                          final success = await invoiceProvider.deleteInvoice(widget.invoiceToEdit!['_id']);
                          if (success && mounted) {
                            Navigator.pop(context); // Düzenleme ekranını kapat
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
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              if (_image != null)
                Stack(
                  children: [
                    Container(
                      height: 200,
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        image: DecorationImage(
                          image: FileImage(File(_image!.path)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 10,
                      right: 10,
                      child: GestureDetector(
                        onTap: () => setState(() => _image = null),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.redAccent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _pickImage(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt, color: Colors.white),
                      label: const Text('Foto Çek', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1), // Indigo
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4,
                        shadowColor: const Color(0xFF6366F1).withOpacity(0.4),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _pickImage(ImageSource.gallery),
                      icon: const Icon(Icons.photo_library, color: Colors.white),
                      label: const Text('Galeri', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981), // Emerald
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4,
                        shadowColor: const Color(0xFF10B981).withOpacity(0.4),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'INCOME', label: Text('Gelir'), icon: Icon(Icons.add_circle_outline)),
                  ButtonSegment(value: 'EXPENSE', label: Text('Gider'), icon: Icon(Icons.remove_circle_outline)),
                ],
                selected: {_type},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() => _type = newSelection.first);
                },
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.text, // Harflerin girilebilmesine izin ver, böylece uyarıyı görebilirler
                autovalidateMode: AutovalidateMode.onUserInteraction,
                decoration: InputDecoration(
                  labelText: 'Miktar (₺)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.attach_money),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Gerekli';
                  
                  // İçinde harf veya geçersiz karakter var mı kontrol et
                  final isNumeric = double.tryParse(v.replaceAll(',', '.'));
                  if (isNumeric == null) {
                    return 'Hatalı giriş! Lütfen sadece rakam kullanın.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descController,
                decoration: InputDecoration(
                  labelText: 'Açıklama',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) => v!.isEmpty ? 'Gerekli' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _vendorController,
                decoration: InputDecoration(
                  labelText: 'Firma / Şahıs',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _invoiceNoController,
                decoration: InputDecoration(
                  labelText: 'Fatura No',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) => v!.isEmpty ? 'Gerekli' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                menuMaxHeight: 250, // Yaklaşık 5 öğe yüksekliği
                decoration: InputDecoration(
                  labelText: 'Kategori',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: invoiceProvider.categories.map((c) {
                  return DropdownMenuItem<String>(
                    value: c['_id'],
                    child: Text(c['name']),
                  );
                }).toList(),
                onChanged: (v) => setState(() => _selectedCategory = v),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _department,
                decoration: InputDecoration(
                  labelText: 'Departman',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: const [
                  DropdownMenuItem(value: 'Muhasebe', child: Text('Muhasebe')),
                  DropdownMenuItem(value: 'Finans', child: Text('Finans')),
                  DropdownMenuItem(value: 'IK', child: Text('İnsan Kaynakları (IK)')),
                  DropdownMenuItem(value: 'Satis', child: Text('Satış')),
                  DropdownMenuItem(value: 'Pazarlama', child: Text('Pazarlama')),
                  DropdownMenuItem(value: 'Yazilim', child: Text('Yazılım')),
                  DropdownMenuItem(value: 'Operasyon', child: Text('Operasyon')),
                  DropdownMenuItem(value: 'Diger', child: Text('Diğer')),
                ],
                onChanged: (v) => setState(() => _department = v ?? 'Diger'),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: invoiceProvider.isLoading
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                  final payload = {
                                    'amount': _amountController.text.replaceAll(',', '.'),
                                    'description': _descController.text,
                                    'vendor': _vendorController.text,
                                    'invoiceNumber': _invoiceNoController.text,
                                    'type': _type,
                                    'category': _selectedCategory,
                                    'department': _department,
                                    'taxAmount': widget.initialData?['taxAmount'] ?? 0,
                                    'date': widget.invoiceToEdit?['date'] ?? DateTime.now().toIso8601String(),
                                  };

                                bool success;
                                if (widget.invoiceToEdit == null) {
                                  success = await invoiceProvider.addInvoice(payload, image: _image);
                                } else {
                                  success = await invoiceProvider.updateInvoice(widget.invoiceToEdit!['_id'], payload, image: _image);
                                }

                                  if (success && mounted) {
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(widget.invoiceToEdit == null ? 'Fatura başarıyla eklendi!' : 'Fatura başarıyla güncellendi!')),
                                    );
                                  } else if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(invoiceProvider.lastError ?? 'Fatura eklenirken bir hata oluştu! Lütfen bilgileri kontrol edin.'),
                                        backgroundColor: Colors.redAccent,
                                      ),
                                    );
                                  }
                              }
                            },
                      child: invoiceProvider.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(widget.invoiceToEdit == null ? 'Kaydet' : 'Güncelle'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 1,
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Vazgeç', style: TextStyle(color: Colors.grey)),
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
}
