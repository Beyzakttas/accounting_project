import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bildirimler'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (context, index) => const Divider(color: Colors.white10),
        itemBuilder: (context, index) {
          return ListTile(
            leading: const CircleAvatar(
              backgroundColor: Colors.blueAccent,
              child: Icon(Icons.notifications, color: Colors.white, size: 20),
            ),
            title: Text(
              'Bildirim Başlığı ${index + 1}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: const Text('Yeni bir fatura oluşturuldu veya güncelleme yapıldı.'),
            trailing: const Text(
              '10 dk önce',
              style: TextStyle(fontSize: 12, color: Colors.white54),
            ),
            onTap: () {},
          );
        },
      ),
    );
  }
}
