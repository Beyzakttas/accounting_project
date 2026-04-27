import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';
import 'dart:io';
import '../../providers/invoice_provider.dart';

class AddInvoiceScreen extends StatefulWidget {
  const AddInvoiceScreen({super.key});

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
  XFile? _image;

  @override
  void initState() {
    super.initState();
    context.read<InvoiceProvider>().fetchCategories();
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
        title: const Text('Yeni Fatura Ekle'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
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
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                ],
                decoration: InputDecoration(
                  labelText: 'Miktar (₺)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.attach_money),
                ),
                validator: (v) => v!.isEmpty ? 'Gerekli' : null,
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
                                final success = await invoiceProvider.addInvoice({
                                  'amount': _amountController.text,
                                  'description': _descController.text,
                                  'vendor': _vendorController.text,
                                  'invoiceNumber': _invoiceNoController.text,
                                  'type': _type,
                                  'category': _selectedCategory,
                                  'date': DateTime.now().toIso8601String(),
                                }, image: _image);
                                if (success && mounted) {
                                  Navigator.pop(context);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Fatura başarıyla eklendi!')),
                                  );
                                }
                              }
                            },
                      child: invoiceProvider.isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Kaydet'),
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
