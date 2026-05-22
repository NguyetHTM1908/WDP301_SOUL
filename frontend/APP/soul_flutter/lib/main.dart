import 'package:flutter/material.dart';
import 'package:soul_mobile/sceens/home/home.dart';
import 'screens/home/home.dart';

void main() {
  runApp(const SoulApp());
}

class SoulApp extends StatelessWidget {
  const SoulApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SOUL',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFEFFCF8),
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF14B8A6),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}