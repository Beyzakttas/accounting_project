import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:gal/gal.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../services/api_service.dart';
import '../core/constants.dart';

class InvoiceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _stats;
  List<dynamic> _invoices = [];
  List<dynamic> _categories = [];
  bool _isLoading = false;
  String? _lastError;
  
  Map<String, dynamic>? get stats => _stats;
  List<dynamic> get invoices => _invoices;
  List<dynamic> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get lastError => _lastError;

  Future<void> fetchStats() async {
    try {
      final response = await _apiService.dio.get('/invoice/stats');
      if (response.statusCode == 200) {
        _stats = response.data['data'];
        notifyListeners();
      }
    } catch (e) {
      print('Fetch Stats Error: $e');
    }
  }

  Future<void> fetchInvoices() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.get('/invoice');
      if (response.statusCode == 200) {
        _invoices = response.data['data'];
      }
    } catch (e) {
      print('Fetch Invoices Error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchCategories() async {
    try {
      final response = await _apiService.dio.get('/category');
      if (response.statusCode == 200) {
        _categories = response.data['data'];
        notifyListeners();
      }
    } catch (e) {
      print('Fetch Categories Error: $e');
    }
  }

  Future<bool> addInvoice(Map<String, dynamic> invoiceData, {XFile? image}) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      dynamic data;
      
      if (image != null) {
        data = FormData.fromMap({
          ...invoiceData,
          'image': await MultipartFile.fromFile(
            image.path,
            filename: image.name,
          ),
        });
      } else {
        data = invoiceData;
      }

      final response = await _apiService.dio.post('/invoice', data: data);
      if (response.statusCode == 201 || response.statusCode == 200) {
        _isLoading = false;
        fetchInvoices();
        fetchStats();
        return true;
      }
    } catch (e) {
      print('Add Invoice Error: $e');
      if (e is DioException && e.response != null) {
        _lastError = e.response?.data['message'] ?? 'Sunucu hatası oluştu.';
      } else {
        _lastError = 'Bağlantı hatası oluştu.';
      }
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> updateInvoice(String id, Map<String, dynamic> invoiceData, {XFile? image}) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      dynamic data;
      
      if (image != null) {
        data = FormData.fromMap({
          ...invoiceData,
          'image': await MultipartFile.fromFile(
            image.path,
            filename: image.name,
          ),
        });
      } else {
        data = invoiceData;
      }

      final response = await _apiService.dio.put('/invoice/$id', data: data);
      if (response.statusCode == 200) {
        _isLoading = false;
        fetchInvoices();
        fetchStats();
        return true;
      }
    } catch (e) {
      print('Update Invoice Error: $e');
      if (e is DioException && e.response != null) {
        _lastError = e.response?.data['message'] ?? 'Sunucu hatası oluştu.';
      } else {
        _lastError = 'Bağlantı hatası oluştu.';
      }
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> deleteInvoice(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.delete('/invoice/$id');
      if (response.statusCode == 200) {
        _isLoading = false;
        fetchInvoices();
        fetchStats();
        return true;
      }
    } catch (e) {
      print('Delete Invoice Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> downloadInvoice(String imageUrl) async {
    try {
      // Get the full URL (imageUrl starts with /uploads)
      final String fullUrl = AppConstants.baseUrl.replaceAll('/api', '') + imageUrl;
      
      final tempDir = await getTemporaryDirectory();
      final String fileName = imageUrl.split('/').last;
      final String savePath = '${tempDir.path}/$fileName';
      
      await _apiService.dio.download(fullUrl, savePath);
      
      // Save to gallery
      await Gal.putImage(savePath);
      
      return true;
    } catch (e) {
      print('Download Invoice Error: $e');
      return false;
    }
  }

  Future<void> generateAndShareInvoicePdf(Map<String, dynamic> invoice) async {
    final pdf = pw.Document();
    final dateFormat = DateFormat('dd.MM.yyyy');
    final currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(level: 0, text: 'FATURA DETAYI'),
              pw.SizedBox(height: 20),
              pw.Text('Firma/Satıcı: ${invoice['vendor'] ?? 'Genel'}'),
              pw.Text('Açıklama: ${invoice['description'] ?? '-'}'),
              pw.Text('Fatura No: ${invoice['invoiceNumber'] ?? '-'}'),
              pw.Text('Tarih: ${invoice['date'] != null ? dateFormat.format(DateTime.parse(invoice['date'])) : '-'}'),
              pw.Text('Tip: ${invoice['type'] == 'INCOME' ? 'Gelir' : 'Gider'}'),
              pw.SizedBox(height: 10),
              pw.Divider(),
              pw.Text('TOPLAM TUTAR: ${currencyFormat.format(invoice['amount'] ?? 0)}', 
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
              pw.SizedBox(height: 40),
              pw.Text('Bu belge Muhasebe AI tarafından oluşturulmuştur.', 
                style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey)),
            ],
          );
        },
      ),
    );

    await Printing.sharePdf(
      bytes: await pdf.save(), 
      filename: 'fatura_${invoice['invoiceNumber'] ?? invoice['_id']}.pdf'
    );
  }

  Future<void> generateFullReportPdf() async {
    if (_invoices.isEmpty) {
      await fetchInvoices();
    }

    final pdf = pw.Document();
    final dateFormat = DateFormat('dd.MM.yyyy');
    final currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return [
            pw.Header(level: 0, child: pw.Text('GENEL GELİR GİDER RAPORU', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold))),
            pw.SizedBox(height: 20),
            pw.Table.fromTextArray(
              context: context,
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
              headerDecoration: const pw.BoxDecoration(color: PdfColors.grey300),
              headers: ['Tarih', 'Açıklama', 'Tip', 'Miktar'],
              data: _invoices.map((inv) {
                return [
                  inv['date'] != null ? dateFormat.format(DateTime.parse(inv['date'])) : '-',
                  inv['description'] ?? '-',
                  inv['type'] == 'INCOME' ? 'Gelir' : 'Gider',
                  currencyFormat.format(inv['amount'] ?? 0),
                ];
              }).toList(),
            ),
            pw.SizedBox(height: 30),
            pw.Footer(
              leading: pw.Text('Toplam Kayıt: ${_invoices.length}'),
              trailing: pw.Text('Muhasebe AI - Raporlama Sistemi', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey)),
            ),
          ];
        },
      ),
    );

    await Printing.sharePdf(
      bytes: await pdf.save(), 
      filename: 'muhasebe_genel_rapor_${DateFormat('dd_MM_yyyy').format(DateTime.now())}.pdf'
    );
  }

  Future<void> shareInvoice(Map<String, dynamic> invoice) async {
    if (invoice['imageUrl'] != null) {
      try {
        final String fullUrl = AppConstants.baseUrl.replaceAll('/api', '') + invoice['imageUrl'];
        final tempDir = await getTemporaryDirectory();
        final String fileName = invoice['imageUrl'].split('/').last;
        final String savePath = '${tempDir.path}/$fileName';
        
        await _apiService.dio.download(fullUrl, savePath);
        
        await Share.shareXFiles([XFile(savePath)], text: 'Fatura: ${invoice['vendor'] ?? 'Genel'}');
      } catch (e) {
        print('Share Image Error: $e');
      }
    } else {
      // PDF olarak paylaş (Zaten generateAndShareInvoicePdf içinde Printing.sharePdf var)
      await generateAndShareInvoicePdf(invoice);
    }
  }
}
