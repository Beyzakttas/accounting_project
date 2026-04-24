import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';

class InvoiceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _stats;
  List<dynamic> _invoices = [];
  List<dynamic> _categories = [];
  bool _isLoading = false;

  Map<String, dynamic>? get stats => _stats;
  List<dynamic> get invoices => _invoices;
  List<dynamic> get categories => _categories;
  bool get isLoading => _isLoading;

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
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
