import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/theme_provider.dart';
import 'profile_screen.dart';

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
            () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ProfileScreen()),
              );
            },
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
            () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ProfileScreen()),
              );
            },
          ),
          Divider(height: 32, color: Theme.of(context).dividerColor),
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
      trailing: Icon(Icons.chevron_right, size: 20, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54)),
      onTap: onTap,
    );
  }
}
