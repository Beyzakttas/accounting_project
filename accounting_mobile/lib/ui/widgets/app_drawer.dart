import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../screens/invoice_list_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/notifications_screen.dart';
import '../screens/reports_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Drawer(
      child: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Column(
          children: [
            // User Profile Header
            UserAccountsDrawerHeader(
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
              ),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.blueAccent,
                child: Text(
                  user?['fullname']?[0].toUpperCase() ?? 'U',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              accountName: Text(
                user?['fullname'] ?? 'Kullanıcı',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              accountEmail: Text(
                user?['email'] ?? 'E-posta bulunamadı',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                ),
              ),
            ),
            
            // Menu Items
            _buildDrawerItem(
              context: context,
              icon: Icons.receipt_long_outlined,
              title: 'Faturalar',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const InvoiceListScreen()),
                );
              },
            ),
            _buildDrawerItem(
              context: context,
              icon: Icons.pie_chart_outline,
              title: 'Raporlar',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ReportsScreen()),
                );
              },
            ),
            _buildDrawerItem(
              context: context,
              icon: Icons.notifications_none_outlined,
              title: 'Bildirimler',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                );
              },
            ),
            _buildDrawerItem(
              context: context,
              icon: Icons.settings_outlined,
              title: 'Ayarlar',
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SettingsScreen()),
                );
              },
            ),
            
            const Spacer(),
            Divider(color: Theme.of(context).dividerColor),
            
            // Logout
            _buildDrawerItem(
              context: context,
              icon: Icons.logout,
              title: 'Çıkış Yap',
              textColor: Colors.redAccent,
              onTap: () => authProvider.logout(),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: textColor ?? Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
      ),
      title: Text(
        title,
        style: TextStyle(
          color: textColor ?? Theme.of(context).colorScheme.onSurface,
          fontSize: 16,
        ),
      ),
      onTap: onTap,
    );
  }
}
