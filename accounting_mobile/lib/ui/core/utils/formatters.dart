import 'package:intl/intl.dart';

class AppFormatters {
  static final DateFormat dateFormat = DateFormat('dd.MM.yyyy');
  static final NumberFormat currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');
}
