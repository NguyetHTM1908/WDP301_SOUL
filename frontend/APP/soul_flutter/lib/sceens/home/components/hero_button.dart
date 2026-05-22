import 'package:flutter/material.dart';

import '../home_colors.dart';

class HeroButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isPrimary;

  const HeroButton({
    super.key,
    required this.title,
    required this.icon,
    required this.isPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 12,
      ),
      decoration: BoxDecoration(
        color: isPrimary ? Colors.white : Colors.white.withOpacity(0.22),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 18,
            color: isPrimary ? HomeColors.darkTeal : Colors.white,
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: TextStyle(
              color: isPrimary ? HomeColors.darkTeal : Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}