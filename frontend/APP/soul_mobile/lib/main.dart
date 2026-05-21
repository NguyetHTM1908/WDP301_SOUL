import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SOUL',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: const Color(0xFFF7F4FF),
      ),
      home: const ForumScreen(),
    );
  }
}

class ForumScreen extends StatelessWidget {
  const ForumScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SOUL Forum'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          PostCard(
            author: 'Anonymous',
            emotion: 'stress',
            content: 'Hôm nay mình thấy hơi áp lực vì deadline.',
            hashtags: ['stress', 'deadline', 'studentlife'],
          ),
          PostCard(
            author: 'Vy',
            emotion: 'sad',
            content: 'Mình muốn có một nơi an toàn để chia sẻ cảm xúc.',
            hashtags: ['healing', 'sharing'],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: null,
        child: Icon(Icons.add),
      ),
    );
  }
}

class PostCard extends StatelessWidget {
  final String author;
  final String emotion;
  final String content;
  final List<String> hashtags;

  const PostCard({
    super.key,
    required this.author,
    required this.emotion,
    required this.content,
    required this.hashtags,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(author, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Feeling: $emotion',
                style: const TextStyle(color: Colors.deepPurple)),
            const SizedBox(height: 12),
            Text(content),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: hashtags.map((tag) => Chip(label: Text('#$tag'))).toList(),
            ),
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text('👍'),
                Text('❤️'),
                Text('🤗'),
                Text('😢'),
                Text('🌱'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}