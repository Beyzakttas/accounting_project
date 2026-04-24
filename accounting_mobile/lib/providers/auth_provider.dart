import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../core/constants.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  bool _isAuthenticated = false;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;

  Future<void> checkAuthStatus() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    final userData = await _storage.read(key: AppConstants.userKey);

    if (token != null && userData != null) {
      _isAuthenticated = true;
      _user = json.decode(userData);
    } else {
      _isAuthenticated = false;
      _user = null;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        // Backend veriyi 'data' anahtarı içinde gönderiyor
        final responseData = response.data['data'];
        
        await _storage.write(key: AppConstants.tokenKey, value: responseData['token']);
        await _storage.write(key: AppConstants.userKey, value: json.encode(responseData['user']));
        
        _user = responseData['user'];
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on DioException catch (e) {
      if (e.response != null) {
        // Backend'den gelen hata mesajını yazdıralım
        print('Giriş Hatası (Backend): ${e.response?.data['message'] ?? e.response?.data}');
      } else {
        print('Giriş Hatası (Bağlantı): ${e.message}');
      }
    } catch (e) {
      print('Beklenmedik Hata: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.post('/auth/register', data: {
        'fullname': name,
        'email': email,
        'password': password,
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on DioException catch (e) {
      print('Kayıt Hatası: ${e.response?.data['message'] ?? e.message}');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.userKey);
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }
}
