import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/theme_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayarlar'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSettingsTile(
            context,
            'Profil Ayarları',
            Icons.person_outline,
            () {},
          ),
          _buildSettingsTile(
            context,
            'Bildirim Tercihleri',
            Icons.notifications_none,
            () {},
          ),
          SwitchListTile(
            secondary: Icon(
              themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
              color: Colors.blueAccent,
            ),
            title: const Text('Karanlık Mod'),
            value: themeProvider.isDarkMode,
            onChanged: (bool value) {
              themeProvider.toggleTheme();
            },
          ),
          _buildSettingsTile(
            context,
            'Güvenlik ve Şifre',
            Icons.lock_outline,
            () {},
          ),
          const Divider(height: 32, color: Colors.white24),
          _buildSettingsTile(
            context,
            'Uygulama Hakkında',
            Icons.info_outline,
            () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(
      BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.blueAccent),
      title: Text(title, style: const TextStyle(fontSize: 16)),
      trailing: const Icon(Icons.chevron_right, size: 20, color: Colors.white54),
      onTap: onTap,
    );
  }
}
