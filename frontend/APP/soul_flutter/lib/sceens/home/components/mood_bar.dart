import 'package:flutter/material.dart';

class MoodBar extends StatelessWidget {
  final String day;
  final double height;

  const MoodBar({
    super.key,
    required this.day,
    required this.height,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Container(
          width: 28,
          height: height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: [
                Color(0xFF0F766E),
                Color(0xFF5EEAD4),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(day),
      ],
    );
  }
}