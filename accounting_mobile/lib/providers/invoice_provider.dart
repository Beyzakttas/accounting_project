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
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../core/constants.dart';
import 'auth_provider.dart';

class InvoiceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _stats;
  List<dynamic> _invoices = [];
  List<dynamic> _categories = [];
  List<dynamic> _staff = [];
  bool _isLoading = false;
  String? _lastError;
  String? _existingDuplicateId;

  String? get existingDuplicateId => _existingDuplicateId;
  
  void clearDuplicateError() {
    _existingDuplicateId = null;
  }
  String _filter = 'ALL';
  int _unreadNotificationsCount = 0;
  List<Map<String, dynamic>> _notifications = [];
  
  int get unreadNotificationsCount => _unreadNotificationsCount;
  List<Map<String, dynamic>> get notifications => _notifications;

  void clearUnreadNotifications() {
    _unreadNotificationsCount = 0;
    _saveNotificationsToPrefs();
    notifyListeners();
  }

  void clearAllNotifications() {
    _notifications.clear();
    _unreadNotificationsCount = 0;
    _saveNotificationsToPrefs();
    notifyListeners();
  }

  Future<void> loadSavedNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load notifications
      final String? stored = prefs.getString('saved_notifications');
      if (stored != null) {
        final List<dynamic> decoded = jsonDecode(stored);
        _notifications = decoded.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      _unreadNotificationsCount = prefs.getInt('unread_notifications_count') ?? 0;

      // Load known invoice IDs to prevent duplicate alerts across app launches
      final List<String>? storedKnownIds = prefs.getStringList('known_invoice_ids');
      if (storedKnownIds != null) {
        _knownInvoiceIds = storedKnownIds.toSet();
        _isFirstPoll = false;
      } else {
        _isFirstPoll = true;
      }
      
      notifyListeners();
    } catch (e) {
      print('Error loading notifications: $e');
    }
  }

  Future<void> _saveNotificationsToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('saved_notifications', jsonEncode(_notifications));
      await prefs.setInt('unread_notifications_count', _unreadNotificationsCount);
      await prefs.setStringList('known_invoice_ids', _knownInvoiceIds.toList());
    } catch (e) {
      print('Error saving notifications: $e');
    }
  }
  
  Timer? _pollingTimer;
  Set<String> _knownInvoiceIds = {};
  bool _isFirstPoll = true;

  void startNotificationPolling(BuildContext context) {
    if (_pollingTimer != null) return; // Zaten çalışıyorsa ikinciyi başlatma
    
    // İlk sorguyu yap ve bilinenleri doldur
    _checkNewInvoices(context);

    // Her 20 saniyede bir kesintisiz ve hızlı sorgula (Uygulama yayındayken de hızlı hissettirsin!)
    const interval = Duration(seconds: 20);

    _pollingTimer = Timer.periodic(interval, (timer) {
      _checkNewInvoices(context);
    });
  }

  void stopNotificationPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> _checkNewInvoices(BuildContext context) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final loggedInUserId = authProvider.user?['_id'] as String?;
      if (loggedInUserId == null) return;

      final response = await _apiService.dio.get('/invoice');
      if (response.statusCode == 200) {
        final List<dynamic> fetchedInvoices = response.data['data'];
        final currentIds = fetchedInvoices.map((inv) => inv['_id'] as String).toSet();

        if (_isFirstPoll) {
          _isFirstPoll = false;

          // Son 48 saat içindeki faturaları "çevrimdışı iken gelen" kabul et ve bildirim üret
          final fortyEightHoursAgo = DateTime.now().subtract(const Duration(hours: 48));

          final offlineInvoices = fetchedInvoices.where((inv) {
            final uploader = inv['uploadedBy'] is Map ? inv['uploadedBy'] : {};
            final uploaderId = uploader['_id'] as String? ?? '';

            // 1. Kendi eklediğimiz fatura değilse
            if (uploaderId == loggedInUserId) return false;

            // 2. Son 48 saatte yüklenmişse
            final createdAtStr = inv['createdAt'] as String? ?? inv['date'] as String? ?? '';
            if (createdAtStr.isEmpty) return false;
            final createdAt = DateTime.tryParse(createdAtStr);
            if (createdAt == null || createdAt.isBefore(fortyEightHoursAgo)) return false;

            // 3. Departman uyuşuyorsa (USER için)
            final userRole = authProvider.user?['role'] as String? ?? 'USER';
            if (userRole == 'USER') {
              final userDepartment = authProvider.user?['department'] as String? ?? 'Diger';
              final invDepartment = inv['department'] as String? ?? 'Diger';
              return invDepartment == userDepartment;
            }
            return true;
          }).toList();

          if (offlineInvoices.isNotEmpty) {
            _unreadNotificationsCount += offlineInvoices.length;
            for (var inv in offlineInvoices) {
              final vendor = inv['vendor'] ?? 'Genel';
              final amount = inv['amount']?.toString() ?? '0';
              final uploader = inv['uploadedBy'] is Map ? inv['uploadedBy'] : {};
              final uploaderName = uploader['fullname'] ?? 'Bir personel';
              final department = inv['department'] ?? 'Diger';

              String snackTitle = 'Yeni Fatura Atandı! 🔔';
              String snackBody = 'Siz çevrimdışı iken yöneticiniz $uploaderName, $department departmanı için $vendor firmasından $amount ₺ tutarında bir fatura ekledi.';

              // Bildirimler hafızasına gerçek zamanlı ekle (çiftleme koruması)
              final alreadyExists = _notifications.any((n) => n['id'] == inv['_id']);
              if (!alreadyExists) {
                _notifications.insert(0, {
                  'id': inv['_id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
                  'title': snackTitle,
                  'body': snackBody,
                  'time': DateTime.now().toIso8601String(),
                });
              }
            }
          }

          _knownInvoiceIds = currentIds;
          _saveNotificationsToPrefs();
          notifyListeners();
          return;
        }

        // Yeni eklenen faturaları bul ve akıllı bildirim kurallarına göre filtrele
        final newInvoices = fetchedInvoices.where((inv) {
          final isNew = !_knownInvoiceIds.contains(inv['_id']);
          if (!isNew) return false;

          final uploader = inv['uploadedBy'] is Map ? inv['uploadedBy'] : {};
          final uploaderId = uploader['_id'] as String? ?? '';

          // 1. Kendi eklediğimiz fatura için kendimize bildirim göndermeyelim
          if (uploaderId == loggedInUserId) return false;

          final userDepartment = authProvider.user?['department'] as String? ?? 'Diger';
          final invDepartment = inv['department'] as String? ?? 'Diger';

          // 2. Faturanın atandığı departmandaki herkese bildirim gitsin
          return invDepartment == userDepartment;
        }).toList();

        bool hasNewIds = false;
        for (var id in currentIds) {
          if (!_knownInvoiceIds.contains(id)) {
            _knownInvoiceIds.add(id);
            hasNewIds = true;
          }
        }

        if (newInvoices.isNotEmpty) {
          _unreadNotificationsCount += newInvoices.length;
          for (var inv in newInvoices) {
            final vendor = inv['vendor'] ?? 'Genel';
            final amount = inv['amount']?.toString() ?? '0';
            final uploader = inv['uploadedBy'] is Map ? inv['uploadedBy'] : {};
            final uploaderName = uploader['fullname'] ?? 'Bir personel';
            final department = inv['department'] ?? 'Diger';

            String snackTitle = 'Yeni Fatura Geldi! 🔔';
            String snackBody = '$uploaderName, $department departmanı için $vendor firmasından $amount ₺ tutarında yeni bir fatura ekledi.';

            // Bildirimler hafızasına gerçek zamanlı ekle
            _notifications.insert(0, {
              'id': inv['_id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
              'title': snackTitle,
              'body': snackBody,
              'time': DateTime.now().toIso8601String(),
            });
            
            // Flutter içinde şık bir snackbar bildirimi tetikleyelim
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: const Color(0xFF6366F1), // Premium indigo rengi
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  margin: const EdgeInsets.all(16),
                  duration: const Duration(seconds: 7),
                  content: Row(
                    children: [
                      const Icon(Icons.notifications_active, color: Colors.white),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              snackTitle,
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              snackBody,
                              style: const TextStyle(fontSize: 12, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }
          }
        }

        if (hasNewIds) {
          _saveNotificationsToPrefs();
          notifyListeners();
        }
      }
    } catch (e) {
      print('Polling Error: $e');
    }
  }
  
  Map<String, dynamic>? get stats => _stats;
  List<dynamic> get invoices => _invoices;
  List<dynamic> get categories => _categories;
  List<dynamic> get staff => _staff;
  bool get isLoading => _isLoading;
  String? get lastError => _lastError;
  String get filter => _filter;

  List<dynamic> get filteredInvoices {
    if (_filter == 'ALL') return _invoices;
    if (_filter == 'PENDING') {
      return _invoices.where((invoice) => invoice['status'] == 'Pending').toList();
    }
    if (_filter == 'PAID') {
      return _invoices.where((invoice) => invoice['status'] == 'Processed').toList();
    }
    return _invoices.where((invoice) => invoice['type'] == _filter).toList();
  }

  void setFilter(String filter) {
    _filter = filter;
    notifyListeners();
  }

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

  Future<void> fetchStaff() async {
    try {
      final response = await _apiService.dio.get('/owner/staff');
      if (response.statusCode == 200) {
        _staff = response.data['data'];
        notifyListeners();
      }
    } catch (e) {
      print('Fetch Staff Error: $e');
    }
  }

  Future<bool> addInvoice(Map<String, dynamic> invoiceData, {XFile? image}) async {
    _isLoading = true;
    _lastError = null;
    _existingDuplicateId = null;
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
        final responseData = e.response?.data;
        if (responseData is Map && responseData['data'] != null) {
          final errData = responseData['data'];
          if (errData is Map && errData['existingId'] != null) {
            _existingDuplicateId = errData['existingId']?.toString();
          }
        }
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

  Future<bool> payInvoice(String id) async {
    _isLoading = true;
    _lastError = null;
    notifyListeners();

    try {
      final response = await _apiService.dio.put('/invoice/$id/pay');
      if (response.statusCode == 200) {
        _isLoading = false;
        fetchInvoices();
        fetchStats();
        return true;
      }
    } catch (e) {
      print('Pay Invoice Error: $e');
      if (e is DioException && e.response != null) {
        _lastError = e.response?.data['message'] ?? 'Ödeme işlemi başarısız.';
      } else {
        _lastError = 'Bağlantı hatası oluştu.';
      }
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
