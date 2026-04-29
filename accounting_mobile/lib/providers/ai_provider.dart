import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import '../services/api_service.dart';

class AiProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<Map<String, String>> _chatMessages = [];
  List<Map<String, String>> get chatMessages => _chatMessages;

  Future<Map<String, dynamic>?> analyzeInvoice(XFile image) async {
    _isLoading = true;
    notifyListeners();

    try {
      print('AI Analyze başlatıldı: ${image.path}');
      
      String? contentType;
      if (image.path.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
      } else {
        // Varsayılan olarak jpeg kabul edelim
        contentType = 'image/jpeg';
      }

      final formData = FormData.fromMap({
        'invoice': await MultipartFile.fromFile(
          image.path,
          filename: image.name,
          contentType: contentType != null ? MediaType.parse(contentType) : null,
        ),
      });

      final response = await _apiService.dio.post('/ai/ocr', data: formData);
      print('AI Response Status: ${response.statusCode}');
      print('AI Response Data: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        _isLoading = false;
        notifyListeners();
        return response.data['data'];
      } else {
        print('AI Analiz başarısız: ${response.data['message']}');
      }
    } catch (e) {
      print('AI Analyze Error: $e');
      if (e is DioException) {
        print('Dio Error Data: ${e.response?.data}');
      }
    }

    _isLoading = false;
    notifyListeners();
    return null;
  }

  void addMessage(String sender, String text) {
    _chatMessages.add({'sender': sender, 'text': text});
    notifyListeners();
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    addMessage('user', text);
    
    _isLoading = true;
    notifyListeners();

    try {
      print('AI Chat gönderiliyor: $text');
      final response = await _apiService.dio.post('/ai/chat', data: {'question': text});
      print('AI Chat Response: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        addMessage('ai', response.data['data']);
      } else {
        print('AI Chat başarısız: ${response.data['message']}');
        addMessage('ai', 'Üzgünüm, şu an cevap veremiyorum: ${response.data['message']}');
      }
    } catch (e) {
      print('AI Chat Error: $e');
      if (e is DioException) {
        print('Dio Chat Error Data: ${e.response?.data}');
      }
      addMessage('ai', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearChat() {
    _chatMessages.clear();
    notifyListeners();
  }
}
